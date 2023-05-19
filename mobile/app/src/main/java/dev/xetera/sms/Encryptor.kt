package dev.xetera.sms

import org.bouncycastle.jce.provider.BouncyCastleProvider
import org.bouncycastle.util.encoders.Hex
import java.nio.ByteBuffer
import java.security.MessageDigest
import java.security.SecureRandom
import java.security.Security
import java.security.spec.KeySpec
import javax.crypto.Cipher
import javax.crypto.SecretKeyFactory
import javax.crypto.spec.GCMParameterSpec
import javax.crypto.spec.PBEKeySpec
import javax.crypto.spec.SecretKeySpec

class Encryptor {
    init {
        Security.addProvider(BouncyCastleProvider())
    }

    fun sha256(secret: SmsKey): String {
        return this.sha256(secret.toString())
    }

    fun sha256(secret: String): String {
        val digest = MessageDigest.getInstance("SHA256")
        val hashedBytes = digest.digest(secret.toByteArray(Charsets.UTF_8))
        return bytesToHex(hashedBytes)
    }

    fun encryptSMS(secret: SmsKey, message: String): ByteArray {

        // Generate a random salt and initialization vector (IV)
        val secureRandom = SecureRandom()
//        val salt = ByteArray(16).apply { secureRandom.nextBytes(this) }
        val iv = ByteArray(12).apply { secureRandom.nextBytes(this) }
        println(Hex.encode(iv).toString())


        // Key derivation function (PBKDF2WithHmacSHA256)
//        val keyFactory = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256")
//        val keySpec: KeySpec = PBEKeySpec(secret.toCharArray(), salt, 65536, 256)
//        val secretKey = keyFactory.generateSecret(keySpec)
//        println(Hex.encode(secretKey.encoded).toString())
        val aesKey = SecretKeySpec(secret.key, "AES")

        // Encrypt the message with AES-256-GCM
        val cipher = Cipher.getInstance("AES/GCM/NoPadding")
        val gcmSpec = GCMParameterSpec(128, iv)
        cipher.init(Cipher.ENCRYPT_MODE, aesKey, gcmSpec)

        val encryptedMessage = cipher.doFinal(message.toByteArray())

        val result = ByteBuffer.allocate(iv.size + encryptedMessage.size)
        result.put(iv)
        result.put(encryptedMessage)

        return result.array()
    }

    // This is only here to test reversibility
    fun decryptSms(secret: SmsKey, encryptedData: ByteArray): String {
        val buffer = ByteBuffer.wrap(encryptedData)
//        val salt = ByteArray(16)
//        buffer.get(salt)
        val iv = ByteArray(12)
        buffer.get(iv)
        val encryptedMessage = ByteArray(buffer.remaining())
        buffer.get(encryptedMessage)

        // Key derivation function (PBKDF2WithHmacSHA256)
//        val keyFactory = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256")
//        val keySpec: KeySpec = PBEKeySpec(secret.toCharArray(), salt, 65536, 256)
//        val secretKey = keyFactory.generateSecret(keySpec)
//        println(secretKey.encoded)
        val aesKey = SecretKeySpec(secret.key, "AES")

        // Decrypt the message with AES-256-GCM
        val cipher = Cipher.getInstance("AES/GCM/NoPadding")
        val gcmSpec = GCMParameterSpec(128, iv)
        cipher.init(Cipher.DECRYPT_MODE, aesKey, gcmSpec)

        val decryptedMessage = cipher.doFinal(encryptedMessage)

        return String(decryptedMessage)
    }

    private fun bytesToHex(bytes: ByteArray): String {
        val result = StringBuffer()
        for (byt in bytes) result.append(
            ((byt.toInt() and 0xff) + 0x100).toString(16).substring(1)
        )
        return result.toString()
    }
}