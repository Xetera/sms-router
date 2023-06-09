package dev.xetera.sms

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.provider.Telephony
import android.util.Log
import com.google.gson.Gson
import kotlinx.coroutines.runBlocking
import okhttp3.*
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.RequestBody.Companion.toRequestBody
import java.io.IOException
import java.util.Base64
import java.util.UUID

class SmsReceiver : BroadcastReceiver() {
//    private val encryptor = Encryptor()
//    private val key = SmsKey("9d04971f8d17c915660179ad186b58db7feaa00ae51e3c35ff00163e0cc1393b")
//    private val key = SmsKey(encryptor.generateKey())

    //    private val endpoint = "http://100.127.72.41:4000/api/v1/sms"
    private val endpoint = "https://sms.xetera.dev/api/v1/sms"
    private val octetStreamMime = "application/octet-stream".toMediaType()

    private val httpClient = OkHttpClient()
    private val gson = Gson()

    suspend fun processSms(sms: IncomingSms, encryptor: Encryptor, key: SmsKey) {
        val packet = createPacket(sms, encryptor, key)

        sendCiphertext(packet, encryptor, key)
    }

    private suspend fun createPacket(
        message: IncomingSms,
        encryptor: Encryptor,
        key: SmsKey
    ): Packet {
        val serializedMessages = gson.toJson(message)
        val cipherText = encryptor.encryptSMS(key, serializedMessages)
        return Packet(cipherText)
    }

    override fun onReceive(context: Context, intent: Intent) {
        println("Received intent: ${intent.action}")
        if (intent.action == Telephony.Sms.Intents.SMS_RECEIVED_ACTION) {
            println("Received sms!")
            val smsMessages = Telephony.Sms.Intents.getMessagesFromIntent(intent)

            val message = IncomingSms(smsMessages)
            val encryptor = Encryptor()
            runBlocking {
                val key = SmsKey.getFromStoreOrDefault(context, encryptor)
                processSms(message, encryptor, key)
            }
        }
    }

    private fun sendCiphertext(packet: Packet, encryptor: Encryptor, key: SmsKey) {
        val routingKey = encryptor.sha256(key)
        val routingKeyHex = encryptor.bytesToHex(routingKey)
        // TODO: Reuse this for requests that are retried
        val idempotencyKey = UUID.randomUUID()
        val out = Base64.getEncoder().encodeToString(packet.cipherText)
        println(out)

        val response = Request.Builder()
            .post(packet.cipherText.toRequestBody(octetStreamMime))
            .header("Content-Type", "application/octet-stream")
            .header("User-Agent", "SmsRouter (Android)")
            .header("X-Idempotency-Key", idempotencyKey.toString())
            .url("$endpoint/$routingKeyHex")
            .build()

        httpClient.newCall(response).enqueue(object : Callback {
            override fun onFailure(call: Call, e: IOException) {
                Log.e("error", "Something went wrong with http call" + e.stackTraceToString())
            }

            override fun onResponse(call: Call, response: Response) {
                println(response)
            }
        })
    }
}

