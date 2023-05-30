import { z } from "zod";
import type { Sms, SmsPacket } from ".";

export const PatternRegex = z.string().transform((val) => new RegExp(val));

export const Pattern = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  type: z.string(),
  senders: z.array(z.string()).transform((senders) => new Set(senders)),
  pattern: PatternRegex,
});

export type Pattern = z.infer<typeof Pattern>;

export const App = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  icon: z.string(),
  patterns: z.array(Pattern),
});

export type App = z.infer<typeof App>;

export const Apps = z.array(App);

export type Apps = z.infer<typeof Apps>;

export const Metadata = z.object({
  app: z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    icon: z.string(),
  }),
  pattern: z.object({
    id: z.string(),
    type: z.string(),
    name: z.string(),
    description: z.string(),
    regex: z.any().transform((val) => val as RegExp),
  }),
  fields: z.record(z.string()),
});

function findMap<T, R>(arr: T[], fn: (val: T) => R | undefined): R | undefined {
  for (const val of arr) {
    const res = fn(val);
    if (res) {
      return res;
    }
  }
}

export type Metadata = z.infer<typeof Metadata>;

export class Extractor {
  private static ENDPOINT =
    "https://github.com/Xetera/sms-regex/blob/main/generated/patterns.json?raw=true";

  constructor(private apps: Apps) {}

  static async request(): Promise<Apps> {
    const apps = await fetch(Extractor.ENDPOINT).then((r) => r.json());
    return Apps.parse(apps);
  }

  static async fromSmsRegex(): Promise<Extractor> {
    const apps = await Extractor.request();

    return new this(apps);
  }

  private match(
    message: string,
    app: App,
    pattern: Pattern
  ): Metadata | undefined {
    const matched = message.match(pattern.pattern);
    if (matched) {
      return {
        app: {
          id: app.id,
          name: app.name,
          description: app.description,
          icon: app.icon,
        },
        pattern: {
          id: pattern.id,
          type: pattern.type,
          name: pattern.name,
          description: pattern.description,
          regex: pattern.pattern,
        },
        fields: matched.groups ?? {},
      };
    }
  }

  testSms({ sms, metadata }: SmsPacket<Sms>, tester: MatchRules): boolean {
    if ("content" in tester) {
      return tester.content.test(sms.body);
    } else if ("sender" in tester) {
      return tester.sender.test(sms.sender);
    } else if ("metadata" in tester && typeof metadata !== "undefined") {
      return metadata.app.id === tester.metadata.app;
    }
    return false;
  }

  extract(message: string, sender?: string): Metadata | undefined {
    const metadata = findMap(this.apps, (app) => {
      return findMap(app.patterns, (pattern) => {
        if (sender && pattern.senders.has(sender)) {
          return this.match(message, app, pattern);
        } else if (!sender) {
          return this.match(message, app, pattern);
        }
      });
    });

    return metadata ? Metadata.parse(metadata) : undefined;
  }
}

export type MatchRules =
  | {
      content: RegExp;
    }
  | {
      sender: RegExp;
    }
  | {
      metadata: {
        app: string;
      };
    };
