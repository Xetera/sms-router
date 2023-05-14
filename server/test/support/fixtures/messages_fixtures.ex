defmodule Sms.MessagesFixtures do
  @moduledoc """
  This module defines test helpers for creating
  entities via the `Sms.Messages` context.
  """

  @doc """
  Generate a sms.
  """
  def sms_fixture(attrs \\ %{}) do
    {:ok, sms} =
      attrs
      |> Enum.into(%{})
      |> Sms.Messages.create_sms()

    sms
  end
end
