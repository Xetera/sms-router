defmodule SmsWeb.SmsController do
  use SmsWeb, :controller
  import Sms.Messages

  action_fallback(SmsWeb.FallbackController)

  def list(conn, params) do
    routing_key = Base.decode16!(params["id"], case: :lower)

    {:ok, list} = Sms.Messages.list_sms(routing_key)
    serialized = Enum.map(list, fn bytes -> Base.encode64(bytes) end)

    resp(conn, 200, Jason.encode!(serialized))
    |> put_resp_header("content-type", "application/json")
  end

  def create(conn, params) do
    {:ok, data, conn} = Plug.Conn.read_body(conn)

    routing_key = Base.decode16!(params["id"], case: :lower)

    case is_valid_body?(data) do
      false ->
        resp(conn, 400, "The body has to be non-empty.")

      true ->
        case is_valid_primary_key?(routing_key) do
          false ->
            resp(
              conn,
              400,
              "The routing key has to be 32 bytes. Did you hash your secret key correctly?"
            )

          true ->
            routing_path = "sms:#{routing_key}"
            :ok = Phoenix.PubSub.broadcast!(Sms.PubSub, routing_path, data)
            Sms.Messages.persist_sms(data, routing_key)

            resp(conn, 200, "OK")
        end
    end
  end
end
