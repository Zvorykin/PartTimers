require 'test_helper'

class ReportsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @common_params = {
      date_from: '2000-01-01',
      date_by: '2100-01-01'
    }
  end

  test "ticket report match snapshot" do
    get "#{root_url}/api/reports/tickets.json", params: @common_params
    assert_response :success

    snapshot = '{"data":[{"code2":2,"code1":3,"summary":5,"name":"medic 1"},{"code2":2,"code1":1,"summary":3,"name":"medic 2"}],"columns":["code2","code1"]}'

    assert_equal snapshot, body
  end

  test "payments report match snapshot" do
    get "#{root_url}/api/reports/payments.json", params: @common_params
    assert_response :success

    snapshot = '{"rows":[{"name":"medic 1","services":[{"name":"MyString2","code":"code2","payment":0.0,"summary":0.0,"amount":2},{"name":"MyString1","code":"code1","payment":100.0,"summary":300.0,"amount":3}],"summary":300.0},{"name":"medic 2","services":[{"name":"MyString2","code":"code2","payment":0.0,"summary":0.0,"amount":2},{"name":"MyString1","code":"code1","payment":100.0,"summary":100.0,"amount":1}],"summary":100.0}],"total":400.0}'

    assert_equal snapshot, body
  end
end
