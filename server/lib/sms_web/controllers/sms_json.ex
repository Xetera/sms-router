defmodule SmsWeb.SmsJSON do
  alias Sms.Messages.Sms

  @doc """
  Renders a list of sms.
  """
  def index(%{sms: sms}) do
    %{data: for(sms <- sms, do: data(sms))}
  end

  @doc """
  Renders a single sms.
  """
  def show(%{sms: sms}) do
    %{data: data(sms)}
  end

  defp data(%Sms{} = sms) do
    %{
      id: sms.id
    }
  end
end
