package dev.xetera.two_factor_automation;

import org.junit.Test;
import java.util.Base64

public class EncryptorTest {
    private val key = "9d04971f8d17c915660179ad186b58db7feaa00ae51e3c35ff00163e0cc1393b"
    @Test
    fun encrypt_isReversible() {
        val encryptor = Encryptor()
        val test = """{"date": 1684010289, "sender": "Test Corp", "messageClass": "UNKNOWN", "body": "We've been trying to reach you concerning your vehicle's extended warranty. You should've received a notice in the mail about your car's extended warranty eligibility. Since we've not gotten a response, we're giving you a final courtesy call before we close out your file. Press 2 to be removed and placed on our do-not-call list. To speak to someone about possibly extending or reinstating your vehicle's warranty, press 1 to speak with a warranty specialist."}"""
        val bytes = encryptor.encryptSMS(key, test, 1684010289)
        println(bytes)
        println(Base64.getEncoder().encodeToString(bytes))

        assert(encryptor.decryptSms(key, bytes) == test)
    }

    @Test
    fun knownEncryption_canDecrypt() {
        val encryptor = Encryptor()
        val encoded =
            "/Fq28AeaqYFvRudmLA0ZBFBQKbINPyYwLuc3dy8ZxqSJCVqHRnbbiU+DlmwHAzXC6Ode8e9wEWbxPxi1tGdRz/0KzNL3HHLi14j6OnDcKRzDAQ1XU6aL6y9ul/89gAOm16nHqlPqmumNDsw74ZMZC1meVtmTB/NIaxMSnBuwUQM/+N03QYsuTRi+O5DggG0EAu4z/ZT95OL3IYkTFoLTcXy60V4Y10dMi3Zd00ZVrfDy7qw/26Br/5gJwLOt1UM="
        println(encryptor.decryptSms(
            key,
            Base64.getDecoder().decode(encoded)
        ))
    }

    @Test
    fun sha256_works() {
        val encryptor = Encryptor()
        assert(encryptor.sha256("abcd") == "88d4266fd4e6338d13b845fcf289579d209c897823b9217da3e161936f031589")
    }
}
