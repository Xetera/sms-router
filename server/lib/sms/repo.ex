defmodule Sms.Repo do
  use Ecto.Repo,
    otp_app: :sms,
    adapter: Ecto.Adapters.Postgres
end
