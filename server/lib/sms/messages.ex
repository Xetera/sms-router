defmodule Sms.Messages do
  @moduledoc """
  The Messages context.
  """
  @max_sms_persistence 20

  @new_sms_key "new"

  @one_month_in_seconds 2_592_000

  def persist(routing_key, sms) do
    key = broadcast_key(routing_key)

    {status, _} =
      Sms.Redis.pipeline([
        ["LPUSH", key, sms],
        ["LTRIM", key, 0, @max_sms_persistence - 1],
        ["EXPIRE", key, @one_month_in_seconds]
        # ["SETEX", "seen_messages:#{routing_key}", @one_month_in_seconds, sms]
      ])

    routing_key
  end

  # def has_been_seen(idempotency_key) do
  #   key = "seen_messages:#{routing_key}"
  #   Sms.Redis.command(["EXISTS", key, 0, sms])
  # end

  def list_sms(routing_key) do
    key = list_key(routing_key)
    Sms.Redis.command(["LRANGE", key, 0, @max_sms_persistence - 1])
  end

  def broadcast(routing_key, binary_message) do
    broadcast_key(routing_key)
    |> SmsWeb.Endpoint.broadcast!(@new_sms_key, %{ciphertext: Base.encode64(binary_message)})

    routing_key
  end

  def seen_message_key(idempotency_key) do
    "seen_messages:#{idempotency_key}"
  end

  def list_key(routing_key) do
    "sms:#{routing_key}"
  end

  def broadcast_key(routing_key) do
    "sms:#{routing_key}"
  end

  def is_valid_body?(<<>>), do: false
  def is_valid_body?(_body), do: true

  def is_valid_primary_key?(key), do: byte_size(key) == 64
  # def is_valid_primary_key?(key), do: byte_size(key) == 64
end
