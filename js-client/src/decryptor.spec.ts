import { describe, it, expect } from "vitest";
import { SmsDecryptor } from "./decryptor";

describe("decryptor", () => {
  it("decrypts an sms", () => {
    const decryptor = new SmsDecryptor();

    const rawMessage =
      "We've been trying to reach you concerning your vehicle's extended warranty. You should've received a notice in the mail about your car's extended warranty eligibility. Since we've not gotten a response, we're giving you a final courtesy call before we close out your file. Press 2 to be removed and placed on our do-not-call list. To speak to someone about possibly extending or reinstating your vehicle's warranty, press 1 to speak with a warranty specialist.";
    expect(
      decryptor.decrypt(
        Buffer.from(
          "AAAAAGRf9TE2xZ3ig87k5l0AVFYN81LIdXrEp9aH6Trw/ldBvVRNKESW+QvG0pl48NnRloxFCmwCepNJTW9l7VcdT4PkFNSsTAxdXkKw76Tye27rEnce3p3MZAswVsQsDYsZjumHWrcv5AjOzyy6NRVIaqJRaZnkKMDSZ/RcjlX6sFxQz78+1rKBx4ID67KrpBNcR1eVoTs7bGygRgFr+bfIsqD37pp6HFsi4mWUjz+7wUZ6a+ZTJnlhmnL9BMV3kMb+8ooO4pOUoAFvkEIhhvr49IwGZb6/4R5wTFBBN3KF/RS7Z+vtLUboCiCW5Iz0J7Icbod+O2NLQi+sSAvJnCNIVgs7fSD4AyLI3rIMWxKghh+r70iK/UpeqznfxrtXGzj382Z93Me+TtR/woPGXvRHwkczhsjQglypsmOxkrfDR6KJ1ldSwvu2aYYGEsCgU57/NMCZZMgA2HMvAGthRCynq0y1UjUuNGM7/k3zqEKv4LcfeaagCCSfApM8o/vzuFsRnrew/NdrIn2WeLI9cygQJ/oDqybTqKqhnxylJ77XPnEO/zg9FdDy0yCnqYAyZzSiT3KksX7Qnied1MVhST4Lx7y2eCntxJBtHxLTqTJ8XKsSp2lO+UNuHTVVzgHTe2hnprVhj2943vRkrEIvvJtdVGacMEqEkYFGYr/p9X0=",
          "base64"
        ),
        "9d04971f8d17c915660179ad186b58db7feaa00ae51e3c35ff00163e0cc1393b"
      )
    ).toStrictEqual({
      message: rawMessage,
      timestamp: new Date(1684010289 * 1000),
    });
  });
});
