require 'test_helper'

class PaymentsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @payment = payments(:one)
    @common_params = {
      value: 100
    }
  end

  test "should get index" do
    get payments_url, as: :json
    assert_response :success
  end

  test "should upsert payment" do
    put "#{root_url}/api/services/#{@payment.service_id}/managers/#{@payment.manager_id}/payment",
        params: @common_params, as: :json
    assert_response 200
  end
end
