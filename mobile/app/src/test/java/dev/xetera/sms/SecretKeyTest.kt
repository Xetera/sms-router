package dev.xetera.sms

import org.junit.Test

class SecretKeyTest {
    @OptIn(ExperimentalUnsignedTypes::class)
    @Test
    fun initializeSecretKey() {
        val key = "9d04971f8d17c915660179ad186b58db7feaa00ae51e3c35ff00163e0cc1393b"
        val sk = SmsKey(key)
        // sk must equal its parsed array equivalent
        assert(
            sk.key.contentEquals(
                ubyteArrayOf(
                    0x9du,
                    0x04u,
                    0x97u,
                    0x1fu,
                    0x8du,
                    0x17u,
                    0xc9u,
                    0x15u,
                    0x66u,
                    0x01u,
                    0x79u,
                    0xadu,
                    0x18u,
                    0x6bu,
                    0x58u,
                    0xdbu,
                    0x7fu,
                    0xeau,
                    0xa0u,
                    0x0au,
                    0xe5u,
                    0x1eu,
                    0x3cu,
                    0x35u,
                    0xffu,
                    0x00u,
                    0x16u,
                    0x3eu,
                    0x0cu,
                    0xc1u,
                    0x39u,
                    0x3bu
                )
            )
        )

        println(sk.toString())
        assert(sk.toString() == key)
    }

}