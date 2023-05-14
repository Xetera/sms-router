package dev.xetera.two_factor_automation

import android.telephony.SmsMessage
import android.telephony.SmsMessage.MessageClass

data class IncomingSms(
    val date: Long,
    val sender: String?,
    val messageClass: MessageClass,
    val body: String?
)

/**
 * The Telephony framework will split messages that run over the message
 * limit into multiple [SmsMessage]
 */
fun fromSmsList(smsList: Array<SmsMessage>): IncomingSms {
    if (smsList.isEmpty()) {
        throw IllegalStateException("Empty SMS array")
    }
    // we're assuming that all the properties here can be inferred
    // from the first sms in the list
    val (sms) = smsList
    val body = smsList.joinToString("") { it.messageBody }

    return IncomingSms(
        date = sms.timestampMillis,
        sender = sms.originatingAddress,
        messageClass = sms.messageClass,
        body = body
    )
}

