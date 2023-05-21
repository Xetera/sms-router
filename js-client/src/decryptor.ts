import crypto from "node:crypto";
import { z } from "zod";

export interface TimestampedMessage {
  timestamp: Date;
  message: string;
}

export const Base64Ciphertext = z
  .string()
  .transform((text) => new Uint8Array(Buffer.from(text, "base64")))
  .brand("ciphertext");

export type Base64Ciphertext = z.infer<typeof Base64Ciphertext>;

export class SmsDecryptor {
  private readonly IV_BYTE_SIZE = 12;
  private readonly TAG_BYTE_SIZE = 16;

  private readonly secret: Buffer;

  constructor(secret: Buffer | string) {
    if (typeof secret === "string") {
      this.secret = Buffer.from(secret, "hex");
    } else {
      this.secret = secret;
    }
  }

  hashedSecret(): string {
    return crypto.createHash("sha256").update(this.secret).digest("hex");
  }

  decryptCiphertext(ciphertext: Base64Ciphertext): string {
    const encryptedDataOffset = this.IV_BYTE_SIZE;
    const iv = ciphertext.slice(0, encryptedDataOffset);

    // bouncycastle appends an auth tag at the end of encrypted data
    const tag = ciphertext.slice(-this.TAG_BYTE_SIZE);
    const encryptedMessage = ciphertext.slice(
      encryptedDataOffset,
      -this.TAG_BYTE_SIZE
    );

    // Decrypt the message with AES-256-GCM
    const decipher = crypto.createDecipheriv("aes-256-gcm", this.secret, iv, {
      encoding: "utf8",
    });

    decipher.setAuthTag(tag);
    const decryptedMessage = Buffer.concat([
      decipher.update(encryptedMessage),
      decipher.final(),
    ]);

    return decryptedMessage.toString();
  }
}
