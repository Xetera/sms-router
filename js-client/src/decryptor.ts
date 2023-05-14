import crypto from "node:crypto";

export interface TimestampedMessage {
  timestamp: Date;
  message: string;
}

export class SmsDecryptor {
  private readonly TIMESTAMP_BYTE_SIZE = 8;
  private readonly SALT_BYTE_SIZE = 16;
  private readonly IV_BYTE_SIZE = 12;
  private readonly TAG_BYTE_SIZE = 16;

  static hashedSecret(secret: string) {
    return crypto.createHash("sha256").update(secret).digest("hex");
  }

  decrypt(encryptedData: Uint8Array, secretKey: string): TimestampedMessage {
    const timestamp = encryptedData.slice(0, this.TIMESTAMP_BYTE_SIZE);
    const saltOffset = this.TIMESTAMP_BYTE_SIZE;

    const ivOffset = saltOffset + this.SALT_BYTE_SIZE;
    const salt = encryptedData.slice(saltOffset, ivOffset);

    const encryptedDataOffset = ivOffset + this.IV_BYTE_SIZE;
    const iv = encryptedData.slice(ivOffset, encryptedDataOffset);

    // bouncycastle appends an auth tag at the end of encrypted data
    const tag = encryptedData.slice(-this.TAG_BYTE_SIZE);
    const encryptedMessage = encryptedData.slice(
      encryptedDataOffset,
      -this.TAG_BYTE_SIZE
    );

    // Key derivation function (PBKDF2 with HMAC-SHA256)
    const key = crypto.pbkdf2Sync(secretKey, salt, 65536, 32, "sha256");

    // Decrypt the message with AES-256-GCM
    const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv, {
      encoding: "utf8",
    });

    decipher.setAAD(timestamp);
    decipher.setAuthTag(tag);
    const decryptedMessage = Buffer.concat([
      decipher.update(encryptedMessage),
      decipher.final(),
    ]);

    return {
      message: decryptedMessage.toString(),
      timestamp: this.extractTimestamp(timestamp),
    };
  }

  private extractTimestamp(encodedDate: Uint8Array): Date {
    const dataView = Buffer.from(encodedDate);
    const timestamp = dataView.readBigInt64BE(0);
    return new Date(Number(timestamp) * 1000);
  }
}
