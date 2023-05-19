package dev.xetera.sms

import org.junit.Test

class SecretKeyTest {
    @Test
    fun initializeSecretKey() {
        val sk = SmsKey("0904")
        // sk must equal its parsed array equivalent
        assert(sk.key.contentEquals(byteArrayOf(9, 4)))
    }
}