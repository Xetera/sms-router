package dev.xetera.sms

import android.telephony.SmsMessage
import android.telephony.SmsMessage.MessageClass

class IncomingSms {
    val date: Long
    val sender: String?
    val messageClass: MessageClass
    val body: String?

    constructor(
        date: Long,
        sender: String?,
        messageClass: MessageClass,
        body: String?
    ) {
        this.date = date
        this.sender = sender
        this.messageClass = messageClass
        this.body = body
    }

    /**
     * The Telephony framework will split messages that run over the message
     * limit into multiple [SmsMessage]
     */
    constructor(smsList: Array<SmsMessage>) {
        if (smsList.isEmpty()) {
            throw IllegalStateException("Empty SMS array")
        }
        // we're assuming that all the properties here can be inferred
        // from the first sms in the list
        val (sms) = smsList
        val body = smsList.joinToString("") { it.messageBody }

        this.date = sms.timestampMillis
        this.sender = sms.originatingAddress
        this.messageClass = sms.messageClass
        this.body = body
    }
}
