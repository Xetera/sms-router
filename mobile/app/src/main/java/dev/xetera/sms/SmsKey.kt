package dev.xetera.sms

class SmsKey(private val keyStr: String) {
    @OptIn(ExperimentalUnsignedTypes::class)
    val key: UByteArray = hexStringToByteArray(keyStr)

    @OptIn(ExperimentalUnsignedTypes::class)
    fun toCharArray(): CharArray {
        return key.toString().toCharArray()
    }

    @OptIn(ExperimentalUnsignedTypes::class)
    fun toByteArray(): ByteArray {
        return key.toByteArray()
    }

    @OptIn(ExperimentalUnsignedTypes::class)
    override fun toString(): String {
        return keyStr
    }

    @OptIn(ExperimentalUnsignedTypes::class)
    private fun hexStringToByteArray(item: String): UByteArray {
        val result = UByteArray(item.length / 2)
        for (i in item.indices step 2) {
            val firstDigit = Character.digit(item[i], 16)
            val secondDigit = Character.digit(item[i + 1], 16)
            val value = firstDigit shl 4 or secondDigit
            result[i / 2] = value.toUByte()
        }
        return result
    }
}
