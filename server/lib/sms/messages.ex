defmodule Sms.Messages do
  @moduledoc """
  The Messages context.
  """
  @max_sms_persistence 20

  @one_month_in_seconds 2_592_000

  @moduledoc """
  Saves the sms based on the routing key to a ring buffer in Redis.
  """
  def persist_sms(sms, routing_key) do
    key = "sms:#{routing_key}"

    {:ok, _} =
      Sms.Redis.pipeline([
        ["LPUSH", key, sms],
        ["LTRIM", key, 0, @max_sms_persistence - 1],
        ["EXPIRE", key, @one_month_in_seconds]
      ])

    :ok
  end

  def list_sms(routing_key) do
    key = "sms:#{routing_key}"
    Sms.Redis.command(["LRANGE", key, 0, @max_sms_persistence - 1])
  end

  def is_valid_body?(<<>>), do: false
  def is_valid_body?(_body), do: true

  def is_valid_primary_key?(key), do: byte_size(key) == 32
end
