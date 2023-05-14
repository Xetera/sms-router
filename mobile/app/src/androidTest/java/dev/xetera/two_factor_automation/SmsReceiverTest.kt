package dev.xetera.two_factor_automation

import android.telephony.SmsMessage.MessageClass
import androidx.test.ext.junit.runners.AndroidJUnit4
import org.junit.Test
import org.junit.runner.RunWith
import java.util.Date

@RunWith(AndroidJUnit4::class)
class SmsReceiverTest {
    @Test
    fun testOnReceive() {
        // Create an instance of your BroadcastReceiver
        val smsReceiver = SmsReceiver()

        // Create a fake SMS_RECEIVED intent
        val intent = IncomingSms(
            sender = "Test Provider",
            messageClass = MessageClass.UNKNOWN,
            body = "testing!",
            date = Date().time
        )

        smsReceiver.processSms(intent)
    }
}
