defmodule SmsWeb.MessageChannel do
  use SmsWeb, :channel

  def join("sms:" <> _routing_key, _params, socket) do
    {:ok, socket}
  end

  # sockets are read-only
  def handle_in(_any, _params, socket) do
    {:reply, :ok, socket}
  end

  # def handle_out(_any, params, socket) do
  #   IO.inspect(params, label: "OUT EVENT")
  #   push(socket, "new", %{sms: Base.encode64(params["sms"])})
  #   {:noreply, socket}
  # end

  # def handle_info(data, socket) do
  #   IO.inspect(data, label: "INFO EVENT")
  #   broadcast!(socket, "new", %{sms: Base.encode64(data)})
  #   {:noreply, socket}
  # end
end
