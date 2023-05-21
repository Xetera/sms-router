package dev.xetera.sms;

import org.junit.Test;
import java.util.Base64

public class EncryptorTest {
    private val key = SmsKey("9d04971f8d17c915660179ad186b58db7feaa00ae51e3c35ff00163e0cc1393b")
    @Test
    fun encrypt_isReversible() {
        val encryptor = Encryptor()
//        val test = """{"date": 1684010289, "sender": "Test Corp", "messageClass": "UNKNOWN", "body": "We've been trying to reach you concerning your vehicle's extended warranty. You should've received a notice in the mail about your car's extended warranty eligibility. Since we've not gotten a response, we're giving you a final courtesy call before we close out your file. Press 2 to be removed and placed on our do-not-call list. To speak to someone about possibly extending or reinstating your vehicle's warranty, press 1 to speak with a warranty specialist."}"""
        val test = "We've been trying to reach you concerning your vehicle's extended warranty. You should've received a notice in the mail about your car's extended warranty eligibility. Since we've not gotten a response, we're giving you a final courtesy call before we close out your file. Press 2 to be removed and placed on our do-not-call list. To speak to someone about possibly extending or reinstating your vehicle's warranty, press 1 to speak with a warranty specialist."
        val bytes = encryptor.encryptSMS(key, test)
        println(bytes)
        println(Base64.getEncoder().encodeToString(bytes))

        assert(encryptor.decryptSms(key, bytes) == test)
    }

    @Test
    fun keyHash() {
        val encrytor = Encryptor()
        val key = "9d04971f8d17c915660179ad186b58db7feaa00ae51e3c35ff00163e0cc1393b"
        val out = encrytor.sha256(
            SmsKey(key)
        )
        print(out)
        val result = "4afeb4aff0b13a7d94cfffdd4cd3f94f1c826b2d4f24e56384d81ff73b11fc0b"
        assert(out == result)
    }
}
