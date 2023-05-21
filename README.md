# SMS Router

A realtime end-to-end encrypted public API for forwarding SMS messages from your devices to any other app.

## How it works

1. Your android phone receives an SMS message
2. Your secret key is used to to encrypt the message and all its metadata using AES256-GCM (aka "military grade encryption") on your device
3. Your secret key is hashed using SHA256 and is used as the routing key to send the encrypted message to the SMS Router API as binary data
4. The server adds the message to a ring buffer in redis
5. Any 3rd party application that is subscribed to your routing key (sha256 of your secret key) through websockets or longpolling receives the encrypted message in realtime
6. The receiving application decrypts the message it receives using a shared secret key

Throughout the entire process, the server has no knowledge of any information about the SMS including the content or any phone numbers other than the date it received the message. This information is not stored in any way, although it influences the order encrypted data is stored in redis.

Messages that are stored in redis expire after 1 month of inactivity and aren't guaranteed to always be available. If you wish to use the service for long term storage, you can subscribe to your routing key and store the messages in your own database.

## API

### Android Encrypted Metadata

The following fields are available from decrypted SMS data. They are subject to potential change in the future, in a non-breaking way.

- `date`: The date the message was sent from the sender's phone
- `messageClass`: The [message class](https://developer.android.com/reference/android/telephony/SmsMessage.MessageClass) of the SMS.
- `body`: The body of the SMS message
- `sender`: The phone number of the sender (or a name if the author uses Sender ID)

### Web API

Base URL: `https://sms.xetera.dev`

#### `GET /subscribe/websocket`

| Parameter | Type                             |
| --------- | -------------------------------- |
| Header:   | `Content-Type: application/json` |

Example: `wss://sms.xetera.dev/subscribe/websocket`

The websocket API follows the Phoenix websocket protocol. Before receiving messages, you're required to join a channel with your device's routing key. This allows you to subscribe to multiple routing keys at once if you wish to.

**Example Payload**

```json
{
  "topic": "sms:4afeb4aff0b13a7d94cfffdd4cd3f94f1c826b2d4f24e56384d81ff73b11fc0b",
  "event": "phx_join",
  "payload": {},
  "ref": 1
}
```

After receiving a new SMS, you'll get a new message in the form of

```json
{
  "event": "new",
  "payload": {
    "ciphertext": "ISylN...dYK7g="
  },
  "ref": null,
  "topic": "sms:4afeb4aff0b13a7d94cfffdd4cd3f94f1c826b2d4f24e56384d81ff73b11fc0b"
}
```

The ciphertext is left exactly as it was received from the android device.

#### `POST /api/v1/sms/:routing_key`

| Parameter | Type                                     |
| --------- | ---------------------------------------- |
| Header:   | `Content-Type: application/octet-stream` |
| Body:     | Encrypted SMS data                       |

### Message Layout

Encrypted SMS are ingested as raw binary but displayed and emitted as base64 encoded strings.

The encrypted message is a concatenation of the following fields:

```
| iv       | ciphertext | auth tag |
| -------- | ---------- | -------- |
| 12 bytes | N bytes    | 16 bytes |
```

> The auth tag is always at the end due to the way AES-GCM works.

## Custom Protocol

Because SMS Router server doesn't depend on protocol-specific things related to encryption, if you don't like the default protocol, you can use whatever you prefer.

The only requirement is the routing key has to be 32 bytes long, and the ciphertext can't be longer than 8kb.

## Caveats

- The encryption used is symmetric, which means you must have a secure, out-of-band communication channel to share your secret key with the receiving application.
- Because there is no login or authentication process, anyone who knows your routing key can subscribe to your messages. It is important to keep your routing key hidden from other users, and the secret key it's derived from hidden from everyone.
- iOS does not allow any programmatic 3rd party access into sms, so this service is only available for android devices. It's possible to integrate this through MacOS using [Auto2FA](https://github.com/jtbergman/Auto2FA) but I haven't taken the time to do so yet. Feel free to submit a PR if that interests you.
