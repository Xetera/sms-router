import cp from "node:child_process";
import { inspect } from "node:util";
import { SmsRouter } from "sms-router";

const copyOption = "Copy OTP";

const secret =
  process.argv[2] ??
  (() => {
    throw new Error("Must include secret");
  })();

const router = await SmsRouter.withExtractor({
  secret,
});

router.listen(({ metadata, sms }) => {
  console.log(sms);
  console.log(metadata);
  if (metadata?.pattern.type === "otp" && metadata?.fields.otp) {
    console.log("Spawning alerter");
    const alerter = cp.spawn(
      "alerter",
      [
        "-title",
        `"[${metadata?.pattern.type.toUpperCase()}] ${sms.sender}"`,
        "-contentImage",
        `"${metadata.app.icon}"`,
        "-message",
        `"${sms.body}"`,
        "-actions",
        `"Copy OTP"`,
      ],
      {
        timeout: 60_000,
      }
    );

    alerter.stderr.pipe(process.stderr);
    alerter.stdout.on("data", (data) => {
      if (data.toString() === copyOption) {
        const spawned = cp.spawn("pbcopy");
        spawned.stdin.write(metadata.fields.otp);
        spawned.stdin.end();
      }
    });

    alerter.on("disconnect", console.log);
    alerter.on("error", console.error);
    alerter.on("close", (code) => {
      console.log(code);
    });
  } else {
    cp.spawn(
      "alerter",
      ["-title", `"${sms.sender}"`, "-message", `"${sms.body}"`],
      {
        timeout: 60_000,
      }
    );
    console.log("No OTP");
    console.log(inspect(sms, { depth: 10 }));
    console.log(inspect(metadata, { depth: 10 }));
  }
});

console.log("Listening...");

//     // icon: path.join(__dirname, "coulson.jpg"), // Absolute path (doesn't work on balloons)
//     sound: false, // Only Notification Center or Windows Toasters
//     wait: true, // Wait with callback, until user action is taken against notification, does not apply to Windows Toasters as they always wait or notify-send as it does not support the wait option
//   },
//   function (err, response, metadata) {
//     console.log(err, response, metadata);
//     // Response is response from notification
//     // Metadata contains activationType, activationAt, deliveredAt
//   }
// );

// notif.on("click", function (notifierObject, options, event) {
//   // Triggers if `wait: true` and user clicks notification
// });

// notifier.on("timeout", function (notifierObject, options) {
//   console.log("timed out");
//   // Triggers if `wait: true` and notification closes
// });
