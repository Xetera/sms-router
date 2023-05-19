package dev.xetera.sms

class SmsKey(key: String) {
    val key: ByteArray = hexStringToByteArray(key)

    fun toCharArray(): CharArray {
        return key.toString(Charsets.UTF_8).toCharArray()
    }

    private fun hexStringToByteArray(item: String): ByteArray {
        val result = ByteArray(item.length / 2)
        for (i in item.indices step 2) {
            val firstDigit = Character.digit(item[i], 16)
            val secondDigit = Character.digit(item[i + 1], 16)
            val value = firstDigit shl 4 or secondDigit
            result[i / 2] = value.toByte()
        }
        return result
    }
}
