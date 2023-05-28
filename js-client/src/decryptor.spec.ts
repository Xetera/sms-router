import { describe, it, expect } from "vitest";
import { Base64Ciphertext, SmsDecryptor } from "./decryptor.js";

describe("decryptor", () => {
  const decryptor = new SmsDecryptor(
    "9d04971f8d17c915660179ad186b58db7feaa00ae51e3c35ff00163e0cc1393b"
  );

  it("decrypts an sms", () => {
    const rawMessage =
      "We've been trying to reach you concerning your vehicle's extended warranty. You should've received a notice in the mail about your car's extended warranty eligibility. Since we've not gotten a response, we're giving you a final courtesy call before we close out your file. Press 2 to be removed and placed on our do-not-call list. To speak to someone about possibly extending or reinstating your vehicle's warranty, press 1 to speak with a warranty specialist.";
    expect(
      decryptor.decryptCiphertext(
        Base64Ciphertext.parse(
          "ISylNhaAkqp95JZW1FpLH0CGheVSbGH94D8an7jizQbNUYxbWuodv/ttfo5XesTweweBr2I8hetmqxnFe4EbCGxZ4uNm+jSa0yy8BtcOC1Ry9ISHnSbFlbVB5BTGiCzuaS1TlfeRtuKcknwwqzkzkikAqYbq4BHPKk91DTPzRtu1guk+xdzcUrU6y6KFQkGPOhbuqPSqQeC9UZ7+HwWilybH7C3LTd9hqMwUo3fzilSbWN/bXc76ZGMevYCYNaoAytHYvT6abbqCTKZaktTBMkSGYON7kub7NIPXLcZRfa8xEKrbNTUv9i/AZb91kDguY9ko6WjAJdkr/hNp6JzwAu4wazbjOvIY2/AcKV/JOPgSjurFjGf2KmPGliBivr9+DZqmNxpu6rNK17mu8tu1n5mbHhaLFz1uMs6VXeuuT6Rn2F+4+m0D1Yep72KTrAYtL701fxW9Sh9Z2qMMKU8kjs88mGS8r8rNp7btaWzmCy1DzwRkxPrbhUafxscsGsMvpyFqBhx0+I7IkYhmuBtqBndvTalqtfUgO9PjAWipD/Y/mcyIe66PpKzbJQ/mQYtHBQq8YlBNQ9kKXXzzU20ASSDsvaXJaanX0W0LKA1J1Sthre5WYtfSrmUjPYEVDlLSn3G0ApdYK7g="
        )
      )
    ).toEqual(rawMessage);
  });
  // it("decrypts", () => {
  //   expect(
  //     decryptor.decryptBase64(
  //       "mqL29HXOrlUF5PekrdtFfXVPRVQrivoRv67C+mMkBYS5bjf4Mw/t3tc4+2nkhhKUWc+xEh4gkIb+Dw0bfjGan10GeB5BEOqKV+oTCmcV4UZ1NI/a5xf/CWBNHVLTofyPdtXKlVdpRmly6BvJqyLPC0FgrysmLn8XisaUTR/85MtJP2pfcJUwW3Fu61xEFnjpvSTyfE9nE2qDaMRvGSIVZ6J2slOCVbRaPVgDEDKPlQ=="
  //     )
  //   ).toEqual("");
  // });
});
