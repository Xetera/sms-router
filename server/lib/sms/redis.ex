defmodule Sms.Redis do
  alias RedixPool, as: Redis

  @pool_size 1

  # def connection_opts(nil) do
  #   IO.puts("REDIS_URL is not set!!")
  #   []
  # end

  # def connection_opts(redis_url) do
  #   socket_opts = []

  #   conn = URI.parse(redis_url)

  #   IO.inspect(conn.host)

  #   [username, password] =
  #     if conn.userinfo do
  #       String.split(conn.userinfo, ":")
  #     else
  #       [nil, nil]
  #     end

  #   [
  #     socket_opts: socket_opts,
  #     # username: username,
  #     # password: password,
  #     sync_connect: true,
  #     # host: conn.host,
  #     backoff_max: 5_000,
  #     database: 0
  #   ]
  # end

  # defp spec(nil) do
  #   []
  # end

  # defp spec(redis_url) do
  #   events = [
  #     [:redix, :disconnection],
  #     [:redix, :failed_connection],
  #     [:redix, :connection]
  #   ]

  #   :telemetry.attach_many(
  #     "redis_telemetry",
  #     events,
  #     &Sms.RedixTelemetryHandler.handle_event/4,
  #     []
  #   )

  #   for index <- 0..(@pool_size - 1) do
  #     Supervisor.child_spec(
  #       {
  #         Redix,
  #         {System.get_env("REDIS_URL"),
  #          Keyword.merge(
  #            connection_opts(redis_url),
  #            name: :"redix_#{index}"
  #          )}
  #       },
  #       id: {Redix, index}
  #     )
  #   end
  # end

  # def child_spec(_args) do
  #   # Specs for the Redix connections.
  #   redis_url = System.get_env("REDIS_URL")

  #   IO.puts(redis_url)

  #   children = spec(redis_url)

  #   # Spec for the supervisor that will supervise the Redix connections.
  #   %{
  #     id: RedixSupervisor,
  #     type: :supervisor,
  #     start: {Supervisor, :start_link, [children, [strategy: :one_for_one]]}
  #   }
  # end

  def pipeline(commands) do
    Redis.pipeline(commands)
  end

  def transaction_pipeline(commands) do
    Redis.pipeline(commands)
  end

  def command(command) do
    Redis.command(command)
  end
end
