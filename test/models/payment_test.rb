require 'test_helper'

class PaymentTest < ActiveSupport::TestCase
  def setup
    @payment = Payment.new(
      manager: Manager.first,
      service: Service.first,
      value: 100
    )
  end

  test "manager should exist" do
    @payment.manager = nil
    assert_not @payment.save
  end

  test "service should exist" do
    @payment.service = nil
    assert_not @payment.save
  end

  test "value should exist" do
    @payment.value = nil
    assert_not @payment.save
  end

  test "save should be true" do
    assert @payment.save
  end
end
