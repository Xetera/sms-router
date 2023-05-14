defmodule Sms.Repo.Migrations.CreateSms do
  use Ecto.Migration

  def change do
    create table(:sms) do
      timestamps()
    end
  end
end
