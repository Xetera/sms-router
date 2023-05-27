defmodule SmsWeb.SmsController do
  use SmsWeb, :controller
  import Sms.Messages

  # plug Hammer.Plug,
  #      [
  #        # 10 messages every 90 seconds
  #        rate_limit: {"sms:broadcast", 90_000, 10},
  #        by: :ip
  #      ]
  #      when action == :create

  action_fallback(SmsWeb.FallbackController)

  def list(conn, params) do
    routing_key = params["id"]

    {:ok, list} = Sms.Messages.list_sms(routing_key)

    serialized =
      Enum.map(list, fn bytes -> Base.encode64(bytes) end)
      |> Enum.reverse()

    resp(conn, 200, Jason.encode!(serialized))
    |> put_resp_header("content-type", "application/json")
  end

  def create(conn, params) do
    {:ok, data, conn} = Plug.Conn.read_body(conn)

    # Base.decode16!(params["id"], case: :lower)
    routing_key = params["id"]

    IO.inspect(String.length(routing_key), label: "key")

    case is_valid_body?(data) do
      false ->
        resp(conn, 400, "The body has to be non-empty.\n")

      true ->
        case is_valid_primary_key?(routing_key) do
          false ->
            resp(
              conn,
              400,
              "The routing key has to be 32 bytes. Did you hash your secret key correctly?\n"
            )

          true ->
            routing_key
            |> Sms.Messages.broadcast(data)
            |> Sms.Messages.persist(data)

            resp(conn, 200, "RECEIVED\n")
        end
    end
  end
end
