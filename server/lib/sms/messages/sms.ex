defmodule Sms.Messages.Sms do
  use Ecto.Schema
  import Ecto.Changeset

  schema "sms" do
    timestamps()
  end

  @doc false
  def changeset(sms, attrs) do
    sms
    |> cast(attrs, [])
    |> validate_required([])
  end
end
