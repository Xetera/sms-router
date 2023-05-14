import Websocket from "isomorphic-ws";
import qs from "node:querystring";
import { Socket, Channel } from "phoenix";
import { SmsDecryptor } from "./decryptor";

export interface Sms {
  body: string;
  from: string;
  timestamp: number;
}

export class SmsRouter {
  readonly #socket: Socket;
  readonly #channel: Channel;
  readonly #decryptor = new SmsDecryptor();

  constructor(private readonly secretKey: string) {
    const params = { routing_key: SmsDecryptor.hashedSecret(secretKey) };

    this.#socket = new Socket(
      `ws://localhost:4000/subscribe/websocket?${qs.stringify(params)}`,
      {
        params,
        transport: Websocket,
      }
    );
    this.#channel = this.#socket.channel(`sms:${params.routing_key}`, {});
  }

  waitFor(pattern: RegExp, opts?: { timeout: number }): Promise<Sms> {
    return new Promise<Sms>((resolve, reject) => {
      let matchedMessages = 0;
      let timer: NodeJS.Timeout | undefined;
      const leave = this.listen((sms) => {
        if (!pattern.test(sms.body)) {
          matchedMessages++;
          return;
        }
        clearTimeout(timer);
        leave();
        resolve(sms);
      });

      if (opts?.timeout) {
        const { timeout } = opts;
        timer = setTimeout(() => {
          leave();
          if (matchedMessages > 0) {
            reject(
              new Error(
                `Could not find a message matching ${pattern} in ${timeout}ms. But found ${matchedMessages} total non-matching messages`
              )
            );
          }
          reject(
            new Error(
              `Did not receive any messages matching ${pattern} in ${timeout}ms`
            )
          );
        }, timeout);
      }
    });
  }

  listen(f: (sms: Sms, sentAt: Date) => void) {
    this.#socket.connect();
    console.log("ran listen function");
    this.#channel
      .join(1000)
      .receive("ok", (res) => {
        console.log("joined channel", res);
      })
      .receive("error", (err) => {
        console.log("error", err);
      });
    this.#channel.on("new", (data) => {
      console.log("encrypted sms", data);
      if (!data.sms) {
        console.warn("Got an empty sms message?");
      }
      const val = Buffer.from(data.sms, "base64");
      const sms = this.#decryptor.decrypt(val, this.secretKey);
      console.log(sms);
      f(JSON.parse(sms.message) as Sms, sms.timestamp);
    });
    return () => {
      this.#channel.leave();
    };
  }
}

async function main() {
  const secretKey =
    "9d04971f8d17c915660179ad186b58db7feaa00ae51e3c35ff00163e0cc1393b";
  const smsRouter = new SmsRouter(secretKey);

  const sms = await smsRouter.waitFor(/vehicle/, { timeout: 60 * 5000 });

  console.log(sms);

  // const code2fa = sms.body.match(/sifreniz: (\d+)/)?.[0];
}

main();
