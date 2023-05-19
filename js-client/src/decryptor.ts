import crypto from "node:crypto";

export interface TimestampedMessage {
  timestamp: Date;
  message: string;
}

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

  decrypt(encryptedData: Uint8Array): string {
    const encryptedDataOffset = this.IV_BYTE_SIZE;
    const iv = encryptedData.slice(0, encryptedDataOffset);

    // bouncycastle appends an auth tag at the end of encrypted data
    const tag = encryptedData.slice(-this.TAG_BYTE_SIZE);
    const encryptedMessage = encryptedData.slice(
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

  private extractTimestamp(encodedDate: Uint8Array): Date {
    const dataView = Buffer.from(encodedDate);
    const timestamp = dataView.readBigInt64BE(0);
    return new Date(Number(timestamp) * 1000);
  }
}
