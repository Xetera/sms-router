# SMS Router

A realtime end-to-end encrypted public API for forwarding SMS messages from your phone to your applications.

## How it works

1. Your android phone receives an SMS message
2. Your secret key is used to to encrypt the message and all its metadata using AES256-GCM (aka "military grade encryption")
3. Your secret key is hashed using SHA256 and is used as the routing key to send the encrypted message to the SMS Router API as binary data.
4. The server adds the message to a ring buffer in redis.
5. Any 3rd party application that is subscribed to your routing key (sha256 of your secret key) through websockets or longpolling receives the encrypted message in realtime
6. The receiving application decrypts the message it receives using a shared secret key

Throughout the entire process, the server has no knowledge of any information about the SMS including the content or any phone numbers other than the date it received the message. This information is not stored in any way, although it influences the order encrypted data is stored in redis.

## API

### Android Encrypted Metadata

The following fields are available from decrypted SMS data

- `date`: The date the message was sent from the sender's phone
- `messageClass`: The [message class](https://developer.android.com/reference/android/telephony/SmsMessage.MessageClass) of the SMS.
- `body`: The body of the SMS message
- `sender`: The phone number of the sender (or a name if the author uses Sender ID)

### Web API

Default URL: `https://sms-router.fly.dev`

#### `POST /api/v1/sms/:routing_key`

| Parameter | Type                                     |
| --------- | ---------------------------------------- |
| Header:   | `Content-Type: application/octet-stream` |
| Body:     | Encrypted SMS data                       |

```
|
```

#### `GET /subscribe/websocket/:routing_key`

| Parameter    | Type                             |
| ------------ | -------------------------------- |
| Header:      | `Content-Type: application/json` |
| Query Params | `routing_key`                    |

Example: `https://sms-router.fly.dev/subscribe/websocket?routing_key=2b7e151628aed2a6abf7158809cf4f3c`

```

```

## Caveats

- The encryption used is symmetric, which means you must have a secure, out-of-band communication channel to share your secret key with the receiving application.
- Because there is no login or authentication process, anyone who knows your routing key can subscribe to your messages. It is important to keep your routing key hidden from other users, and the secret key it's derived from hidden from everyone.
- iOS does not allow any programmatic 3rd party access into sms, so this service is only available for android devices. It's possible to integrate this through macos using [Auto2FA](https://github.com/jtbergman/Auto2FA) but I haven't taken the time to do so yet.

## Custom Protocol

Because SMS Router server doesn't depend on protocol-specific things related to encryption, if you don't like the default protocol, you can use whatever you prefer.

The only requirement is the routing key has to be 32 bytes long, and the ciphertext can't be longer than 8kb.

```

```
