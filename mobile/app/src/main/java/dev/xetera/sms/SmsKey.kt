package dev.xetera.sms

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import java.util.Base64

val keyStorageKey = stringPreferencesKey("sms-router-key")

val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "settings")

class SmsKey(private val key: ByteArray) {

    fun toCharArray(): CharArray {
        return this.toString().toCharArray()
    }

    fun toByteArray(): ByteArray {
        return key
    }

    override fun toString(): String {
        return key.toString(Charsets.UTF_8)
    }

    companion object {
        suspend fun getFromStoreOrDefault(context: Context, encryptor: Encryptor): SmsKey {
            val out = context.dataStore.edit { preferences ->
                val edited =
                    preferences[keyStorageKey] ?: Base64.getEncoder()
                        .encodeToString(encryptor.generateKey())

                preferences[keyStorageKey] = edited
            }[keyStorageKey]

            return SmsKey(Base64.getDecoder().decode(out))
        }
    }

    suspend fun getOrDefault() {

    }
}
