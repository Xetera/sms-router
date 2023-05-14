defmodule Sms.MessagesTest do
  use ExUnit.Case, async: true
  @tag :unit_test

  alias Sms.Messages

  describe "sms" do
    alias Sms.Messages.Sms

    @invalid_attrs %{}

    test "decrypt sms" do
      payload =
        "LJif2Kx8A8ZyrIc28DYQQXcJBOeQ4IOnzg+9iVnlDmgIlyXDWyTk0i3y4qv8PRykzy3M+pJdfLTQ/pGbpFY95hjwwmKfGIJ9A8PymWHFQFGm+0m7lIhixdyFUrnaeC4QGOFTdTE7XrAwjR4cJLH2o27TTXO+i4kE/qibgnQcq+g76Jfwk1f5aSMyBc8evE564857B+5WWk8Rp7GUoRoVvlU4fz6S2XYF4NzrcRcwjJPHc94zgWkZbeJBfqFxQcM="

      assert(Sms.Messages.decrypt_sms(payload, "123") == "aa")
    end
  end
end
