import { describe, it, expect } from "vitest";
import { Apps, Extractor } from "./extractor.js";

const apps = [
  {
    id: "kahve-dunyasi",
    name: "Kahve dunyasi",
    description: "Turkish coffee shop",
    icon: "https://github.com/xetera/sms-regex/blob/main/assets/icons/kahve-dunyasi.png?raw=true",
    patterns: [
      {
        id: "login",
        name: "Login",
        description: "OTP for logging into the mobile app",
        type: "otp",
        senders: ["KAHVEDUNYAS"],
        pattern: "sifreniz: (?<otp>\\d+)",
      },
    ],
  },
  {
    id: "trendyol",
    name: "Trendyol",
    description: "Turkish shopping app",
    icon: "https://github.com/xetera/sms-regex/blob/main/assets/icons/trendyol.jpg?raw=true",
    patterns: [
      {
        id: "delivery-code",
        name: "Delivery Code",
        description: "OTP for confirming delivery",
        type: "otp",
        senders: ["TY EXPRESS"],
        pattern: "(?<otp>\\d+) tek kullan\u0131ml\u0131k kod ile",
      },
    ],
  },
  {
    id: "interaktif-vergi-dairesi",
    name: "Interaktif Vergi Dairesi",
    description: "Tax office for Turkish companies",
    icon: "https://github.com/xetera/sms-regex/blob/main/assets/icons/ivd.png?raw=true",
    patterns: [
      {
        id: "invoice-confirmation",
        name: "Invoice Confirmation",
        description: "OTP for validating an e-archive invoice",
        type: "otp",
        senders: ["GIB"],
        pattern:
          "EARSIV FATURA(INTERAKTIF) ONAYI ICIN SMS SIFRENIZ: (?<otp>\\w+) B\\d{3}",
      },
      {
        id: "generic-confirmation",
        name: "Generic Confirmation",
        description: "Generic OTP for confirming actions",
        type: "otp",
        senders: ["GIB"],
        pattern: "Interaktif Vergi Dairesi SMS sifreniz: (?<otp>\\d+) B\\d{3}",
      },
    ],
  },
  {
    id: "finansbank",
    name: "Finansbank",
    description: "Turkish bank",
    icon: "https://github.com/xetera/sms-regex/blob/main/assets/icons/finansbank.png?raw=true",
    patterns: [
      {
        id: "3d-confirmation",
        name: "3D Confirmation",
        description: "OTP for 3D purchase confirmation",
        type: "otp",
        senders: ["FINANSBANK", "*FINANSBANK", "FINANSBANK*"],
        pattern: "TL harcamaniz icin sifreniz:(?<otp>\\d+)",
      },
    ],
  },
  {
    id: "turk-telekom",
    name: "Turk Telekom",
    description: "Turkish ISP",
    icon: "https://github.com/xetera/sms-regex/blob/main/assets/icons/turk-telekom.png?raw=true",
    patterns: [
      {
        id: "wifi-login",
        name: "Wifi Login",
        description:
          "OTP for signing up for public wifi networks like Starbucks",
        type: "otp",
        senders: ["TT WI-FI"],
        pattern: "Dogrulama kodu: (?<otp>\\d+)",
      },
    ],
  },
  {
    id: "pegasus-airlines",
    name: "Pegasus Airlines",
    description: "Turkish airliner",
    icon: "https://github.com/xetera/sms-regex/blob/main/assets/icons/pegasus-airlines.png?raw=true",
    patterns: [
      {
        id: "reservation-view",
        name: "Reservation View",
        description: "OTP for viewing a reservation",
        type: "otp",
        senders: ["PEGASUS"],
        pattern: "your activation code is (?<otp>\\w+).",
      },
    ],
  },
];

describe("extractor", () => {
  it("extracts otp from sms", () => {
    const extractor = new Extractor(Apps.parse(apps));
    const out = extractor.extract(
      "Kahve Dünyasi mobil uygulama giris dogrulama sifreniz: 901646 B002",
      "KAHVEDUNYAS"
    );
    expect(out).toBeTruthy();
    expect(out?.fields.otp).toBe("901646");
  });
});
