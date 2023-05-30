import "@total-typescript/ts-reset";
import Websocket from "isomorphic-ws";
import qs from "node:querystring";
import { Socket, Channel } from "phoenix";
import { Base64Ciphertext, SmsDecryptor } from "./decryptor.js";
import debug from "debug";
import { z } from "zod";
import { Extractor, Metadata } from "./extractor.js";
import { inspect } from "node:util";

const log = debug("sms-router");

export const Sms = z.object({
  body: z.string(),
  sender: z.string(),
  date: z.number(),
  messageClass: z.string(),
});

export type Sms = z.infer<typeof Sms>;

export type SmsPacket<T extends object = Sms> = {
  sms: T;
  metadata?: Metadata;
};

export interface SmsRouterOptions {
  extractor?: Extractor;
  secret: string;
  websocketUrl?: string;
  onError?: (err: Error) => void;
}

const smsList = z.array(Base64Ciphertext);

export class SmsRouter {
  readonly #socket: Socket;
  readonly #channel: Channel;
  readonly #decryptor = new SmsDecryptor(this.opts.secret);
  readonly #extractor: Extractor | undefined;
  static readonly DEFAULT_HOST = "sms.xetera.dev";
  static readonly DEFAULT_WEBSOCKET_URL = `wss://${SmsRouter.DEFAULT_HOST}/subscribe/websocket`;
  // "ws://localhost:4000/subscribe/websocket";

  constructor(private readonly opts: SmsRouterOptions) {
    const params = { routing_key: this.#decryptor.hashedSecret() };

    const url = `${
      this.opts.websocketUrl ?? SmsRouter.DEFAULT_WEBSOCKET_URL
    }?${qs.stringify(params)}`;

    this.#socket = new Socket(url, {
      params,
      transport: Websocket,
    });
    this.#channel = this.#socket.channel(`sms:${params.routing_key}`, {});
    this.#extractor = opts.extractor;
  }

  static async withExtractor(opts: SmsRouterOptions): Promise<SmsRouter> {
    const extractor = await Extractor.fromSmsRegex();
    return new SmsRouter({
      ...opts,
      extractor,
    });
  }

  async list<T extends object = Sms>(): Promise<
    Array<{ sms: T; metadata?: Metadata }>
  > {
    const res = await fetch(
      `https://${
        SmsRouter.DEFAULT_HOST
      }/api/v1/sms/${this.#decryptor.hashedSecret()}`
    );
    const data = smsList.parse(await res.json());
    return data
      .map((data) => {
        try {
          const sms = JSON.parse(this.#decryptor.decryptCiphertext(data)) as T;
          const metadata = this.extractFromSms(sms);
          return { sms, metadata };
        } catch (err) {
          log(err);
          return;
        }
      })
      .filter(Boolean);
  }

  waitFor<T extends object = Sms>(
    pattern: RegExp,
    opts?: { timeout: number }
  ): Promise<SmsPacket<T>> {
    return new Promise<SmsPacket<T>>((resolve, reject) => {
      let matchedMessages = 0;
      let timer: NodeJS.Timeout | undefined;
      const leave = this.listen<T>(({ sms }) => {
        if (
          "body" in sms &&
          typeof sms.body === "string" &&
          !pattern.test(sms.body)
        ) {
          matchedMessages++;
          return;
        }
        clearTimeout(timer);
        leave();
        const metadata = this.extractFromSms(sms);
        resolve({ sms, metadata });
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

  private extractFromSms<S extends object>(obj: S) {
    console.log(obj);
    return this.#extractor && "body" in obj && typeof obj.body === "string"
      ? this.#extractor.extract(
          obj.body,
          "sender" in obj && typeof obj.sender === "string"
            ? obj.sender
            : undefined
        )
      : undefined;
  }

  listen<K extends object = Sms>(f: (sms: SmsPacket<K>) => void) {
    this.#socket.connect();
    log("ran listen function");

    this.#channel
      .join(1000)
      .receive("ok", (res) => {
        log("joined channel", res);
      })
      .receive("error", (err) => {
        log("error", err);
      });

    this.#channel.on("new", (data) => {
      log("encrypted sms", data);

      if (!data.ciphertext) {
        console.warn("Got an empty sms message?");
        return;
      }

      try {
        const val = Base64Ciphertext.parse(data.ciphertext);
        const sms = this.#decryptor.decryptCiphertext(val);
        const out = JSON.parse(sms) as K;

        const metadata = this.extractFromSms(out);

        f({ sms: out, metadata });
      } catch (err) {
        if (this.opts.onError && err instanceof Error) {
          this.opts.onError(err);
        } else {
          throw err;
        }
      }
    });
    return () => {
      log("leaving channel");
      this.#channel.leave();
    };
  }
}

// async function main() {
//   const secretKey =
//     "9d04971f8d17c915660179ad186b58db7feaa00ae51e3c35ff00163e0cc1393b";
//   const smsRouter = await SmsRouter.withExtractor({ secret: secretKey });

//   smsRouter.listen((sms) => {
//     console.log(sms);
//   });
//   // const sms = await smsRouter.waitFor(/\ /, { timeout: 60 * 5000 });

//   // log(inspect(await smsRouter.list(), { depth: null }));

//   // const code2fa = sms.body.match(/sifreniz: (\d+)/)?.[0];
// }

// main();
