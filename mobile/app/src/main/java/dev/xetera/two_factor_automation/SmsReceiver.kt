package dev.xetera.two_factor_automation

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.provider.Telephony
import android.util.Log
import com.google.gson.Gson
import okhttp3.Call
import okhttp3.Callback
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import okhttp3.Response
import java.io.IOException
import java.util.Base64


class SmsReceiver : BroadcastReceiver() {

    private val key = "9d04971f8d17c915660179ad186b58db7feaa00ae51e3c35ff00163e0cc1393b"
    private val endpoint = "http://100.127.72.41:4000/api/v1/sms"
    private val octetStreamMime = "application/octet-stream".toMediaType()

    private val encryptor = Encryptor()
    private val httpClient = OkHttpClient()
    private val gson = Gson()

    private val routingKey = encryptor.sha256(key)

//    init {
//        println("initializing receiver")
//        fixedRateTimer("Test timer", false, 0L, 1000L) {
//            println("Processing sms")
//            processSms(
//                IncomingSms(
//                    sender = "Test Provider",
//                    messageClass = SmsMessage.MessageClass.UNKNOWN,
//                    body = "testing!",
//                    date = Date().time
//                )
//            )
//        }
//    }

    fun processSms(sms: IncomingSms) =
        sendCiphertext(createPacket(sms))

    override fun onReceive(context: Context, intent: Intent) {
        println("Received intent: ${intent.action}")
        if (intent.action == Telephony.Sms.Intents.SMS_RECEIVED_ACTION) {
            println("Received sms!")
            val smsMessages = Telephony.Sms.Intents.getMessagesFromIntent(intent)

            val message = fromSmsList(smsMessages)
            processSms(message)
        }
    }

    private fun createPacket(message: IncomingSms): Packet {
        val serializedMessages = gson.toJson(message)
        println(serializedMessages)
        val cipherText = encryptor.encryptSMS(key, serializedMessages, message.date)
        return Packet(cipherText)
    }

    private fun sendCiphertext(packet: Packet) {
        val response = Request.Builder()
            .post(packet.cipherText.toRequestBody(octetStreamMime))
            .header("Content-Type", "application/octet-stream")
            .header("User-Agent", "SmsRouter (Android)")
            .url("$endpoint/$routingKey")
            .build()

        httpClient.newCall(response).enqueue(object : Callback {
            override fun onFailure(call: Call, e: IOException) {
                Log.e("error", "Something went wrong with http call", e)
            }

            override fun onResponse(call: Call, response: Response) {
                println(response)
            }
        })
    }
}

