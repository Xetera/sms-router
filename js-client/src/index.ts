import "@total-typescript/ts-reset";
import Websocket from "isomorphic-ws";
import qs from "node:querystring";
import { Socket, Channel } from "phoenix";
import { Base64Ciphertext, SmsDecryptor } from "./decryptor";
import { z } from "zod";

export interface Sms {
  body: string;
  sender: string;
  date: number;
  messageClass: string;
}

export interface SmsRouterOptions {
  secret: string;
  websocketUrl?: string;
  onError?: (err: Error) => void;
}

const smsList = z.array(Base64Ciphertext);

export class SmsRouter {
  readonly #socket: Socket;
  readonly #channel: Channel;
  readonly #decryptor = new SmsDecryptor(this.opts.secret);
  static readonly DEFAULT_WEBSOCKET_URL =
    "wss://sms-router.fly.dev/subscribe/websocket";
  // "ws://localhost:4000/subscribe/websocket";

  constructor(private readonly opts: SmsRouterOptions) {
    const params = { routing_key: this.#decryptor.hashedSecret() };
    console.log(params);

    const url = `${
      this.opts.websocketUrl ?? SmsRouter.DEFAULT_WEBSOCKET_URL
    }?${qs.stringify(params)}`;

    this.#socket = new Socket(url, {
      params,
      transport: Websocket,
    });
    this.#channel = this.#socket.channel(`sms:${params.routing_key}`, {});
  }

  async list<T = Sms>(): Promise<T[]> {
    const res = await fetch(
      `https://sms-router.fly.dev/api/v1/sms/${this.#decryptor.hashedSecret()}`
    );
    const data = smsList.parse(await res.json());
    return data
      .map((data) => {
        try {
          return JSON.parse(this.#decryptor.decryptCiphertext(data)) as T;
        } catch (err) {
          console.error(err);
          return;
        }
      })
      .filter(Boolean);
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

  listen<T = Sms>(f: (sms: T) => void) {
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

      if (!data.ciphertext) {
        console.warn("Got an empty sms message?");
        return;
      }

      try {
        const val = Base64Ciphertext.parse(data.ciphertext);
        const sms = this.#decryptor.decryptCiphertext(val);

        f(JSON.parse(sms) as T);
      } catch (err) {
        if (this.opts.onError) {
          this.opts.onError(err);
        } else {
          throw err;
        }
      }
    });
    return () => {
      console.log("leaving channel...");
      this.#channel.leave();
    };
  }
}

async function main() {
  const secretKey =
    "9d04971f8d17c915660179ad186b58db7feaa00ae51e3c35ff00163e0cc1393b";
  const smsRouter = new SmsRouter({ secret: secretKey });

  // smsRouter.listen((sms) => {
  //   console.log(sms);
  // });
  // const sms = await smsRouter.waitFor(/\ /, { timeout: 60 * 5000 });

  console.log(await smsRouter.list());

  // const code2fa = sms.body.match(/sifreniz: (\d+)/)?.[0];
}

main();
