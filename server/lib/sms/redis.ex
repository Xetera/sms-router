defmodule Sms.Redis do
  @pool_size 3

  def child_spec(_args) do
    # Specs for the Redix connections.
    conn = URI.parse(System.get_env("REDIS_URL"))
    [username, password] = IO.inspect(conn.userinfo |> String.split(":"))
    IO.inspect(conn)

    children =
      for index <- 0..(@pool_size - 1) do
        Supervisor.child_spec(
          {
            Redix,
            #  sync_connect: true,
            username: username,
            password: password,
            host: conn.host,
            port: 6379,
            name: :"redix_#{index}",
            socket_opts: [:inet6],
            database: 0
          },
          id: {Redix, index}
        )
      end

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

  def command(command) do
    Redix.command(:"redix_#{random_index()}", command)
  end

  defp random_index() do
    Enum.random(0..(@pool_size - 1))
  end
end
