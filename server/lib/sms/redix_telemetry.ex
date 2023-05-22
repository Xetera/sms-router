defmodule Sms.RedixTelemetryHandler do
  require Logger

  def handle_event([:redix, event], measurements, metadata, _config) do
    if map_size(measurements) != 0 do
      IO.inspect(measurements)
    end

    case event do
      :disconnection ->
        human_reason = Exception.message(metadata.reason)
        Logger.warn("Disconnected from #{metadata.address}: #{human_reason}")

      :failed_connection ->
        human_reason = Exception.message(metadata.reason)
        Logger.warn("Failed to connect to #{metadata.address}: #{human_reason}")

      :connection ->
        Logger.debug("Connected/reconnected to #{metadata.address}")
    end
  end
end
