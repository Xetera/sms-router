defmodule Sms.Redis do
  @pool_size 2

  def connection_opts(nil) do
    []
  end

  def connection_opts(redis_url) do
    socket_opts =
      if Application.get_env(:sms, :env) == :prod do
        [:inet6]
      else
        []
      end

    conn = URI.parse(redis_url)

    [username, password] =
      if conn.userinfo do
        String.split(conn.userinfo, ":")
      else
        [nil, nil]
      end

    [
      socket_opts: socket_opts,
      username: username,
      password: password,
      sync_connect: true,
      host: conn.host,
      backoff_max: 5_000,
      database: 0
    ]
  end

  defp spec(nil, _opts) do
    []
  end

  defp spec(redis_url) do
    for index <- 0..(@pool_size - 1) do
      Supervisor.child_spec(
        {
          Redix,
          Keyword.merge(
            connection_opts(redis_url),
            name: :"redix_#{index}"
          )
        },
        id: {Redix, index}
      )
    end
  end

  def child_spec(_args) do
    # Specs for the Redix connections.
    redis_url = System.get_env("REDIS_URL")

    children = spec(redis_url)

    events = [
      [:redix, :disconnection],
      [:redix, :failed_connection],
      [:redix, :connection]
    ]

    :telemetry.attach_many(
      "my-redix-log-handler",
      events,
      &Sms.RedixTelemetryHandler.handle_event/4,
      []
    )

    # Spec for the supervisor that will supervise the Redix connections.
    %{
      id: RedixSupervisor,
      type: :supervisor,
      start: {Supervisor, :start_link, [children, [strategy: :one_for_one]]}
    }
  end

  def pipeline(commands) do
    Redix.pipeline(:"redix_#{random_index()}", commands)
  end

  def transaction_pipeline(commands) do
    Redix.transaction_pipeline(:"redix_#{random_index()}", commands)
  end

  def command(command) do
    Redix.command(:"redix_#{random_index()}", command)
  end

  defp random_index() do
    Enum.random(0..(@pool_size - 1))
  end
end
