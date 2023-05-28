package dev.xetera.sms

import android.content.Context
import android.content.Context.MODE_PRIVATE
import android.content.SharedPreferences
import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyProperties
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import org.bouncycastle.jce.provider.BouncyCastleProvider
import java.nio.ByteBuffer
import java.security.KeyStore
import java.security.MessageDigest
import java.security.SecureRandom
import java.security.Security
import java.util.Base64
import javax.crypto.Cipher
import javax.crypto.KeyGenerator
import javax.crypto.spec.GCMParameterSpec
import javax.crypto.spec.SecretKeySpec


//import androidx.datastore.preferences


class Encryptor {
    private val KEY_LENGTH = 32

    private val ANDROID_KEY_STORE = "AndroidKeyStore"

//    private val keyGenerator =
//        KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES, ANDROID_KEY_STORE)
//
//    private val keyGenParameterSpec = KeyGenParameterSpec.Builder(
//        "sms-router-key", KeyProperties.PURPOSE_ENCRYPT or KeyProperties.PURPOSE_DECRYPT
//    ).setBlockModes(KeyProperties.BLOCK_MODE_GCM)
//        .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE).setKeySize(256).build()
//
    init {
        Security.addProvider(BouncyCastleProvider())
//        KeyStore.getInstance(ANDROID_KEY_STORE).load(null)
//        keyGenerator.init(keyGenParameterSpec)
    }

    fun hexToBytes(hex: String): ByteArray {
        val len = hex.length
        val data = ByteArray(len / 2)
        var i = 0
        while (i < len) {
            data[i / 2] =
                ((Character.digit(hex[i], 16) shl 4) + Character.digit(hex[i + 1], 16)).toByte()
            i += 2
        }
        return data
    }

    fun generateKey(): ByteArray {
        return hexToBytes("9d04971f8d17c915660179ad186b58db7feaa00ae51e3c35ff00163e0cc1393b")

        val random = SecureRandom()
        val key = ByteArray(KEY_LENGTH)
        random.nextBytes(key)
        return key
    }

    fun sha256(secret: SmsKey): ByteArray {
        return this.sha256(secret.toByteArray())
    }

    private fun sha256(secret: ByteArray): ByteArray {
        val digest = MessageDigest.getInstance("SHA256")
        val hashedBytes = digest.digest(secret)
        return hashedBytes
    }

    fun idempotencyKey(routingKey: ByteArray, digest: ByteArray): String {
        return bytesToHex(sha256(routingKey + digest))
    }

    fun encryptSMS(secret: SmsKey, message: String): ByteArray {

        // Generate a random salt and initialization vector (IV)
        val secureRandom = SecureRandom()
//        val salt = ByteArray(16).apply { secureRandom.nextBytes(this) }


        // Key derivation function (PBKDF2WithHmacSHA256)
//        val keyFactory = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256")
//        val keySpec: KeySpec = PBEKeySpec(secret.toCharArray(), salt, 65536, 256)
//        val secretKey = keyFactory.generateSecret(keySpec)
//        println(Hex.encode(secretKey.encoded).toString())
        val aesKey = SecretKeySpec(secret.toByteArray(), "AES")

        // Encrypt the message with AES-256-GCM
        val cipher = Cipher.getInstance("AES/GCM/NoPadding")
        cipher.init(Cipher.ENCRYPT_MODE, aesKey)
        val iv = cipher.iv
//        val gcmSpec = GCMParameterSpec(128, iv)


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
        val aesKey = SecretKeySpec(secret.toByteArray(), "AES")

        // Decrypt the message with AES-256-GCM
        val cipher = Cipher.getInstance("AES/GCM/NoPadding")
        val gcmSpec = GCMParameterSpec(128, iv)
        cipher.init(Cipher.DECRYPT_MODE, aesKey, gcmSpec)

        val decryptedMessage = cipher.doFinal(encryptedMessage)

        return String(decryptedMessage)
    }

    fun bytesToHex(bytes: ByteArray): String {
        val result = StringBuffer()
        for (byt in bytes) result.append(
            ((byt.toInt() and 0xff) + 0x100).toString(16).substring(1)
        )
        return result.toString()
    }
}
