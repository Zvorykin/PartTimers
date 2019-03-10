require 'test_helper'

class LoginControllerTest < ActionDispatch::IntegrationTest
  test "user login should be successful" do
    post login_url
    assert_response :success

    assert_equal true, get_body[:result]
  end

  test "admin login - need password" do
    post login_url, params: { isAdmin: true, password: '' }
    assert_response :success

    assert_equal false, get_body[:result]
  end

  test "admin login - should be successful" do
    post login_url, params: { isAdmin: true, password: 'admin' }
    assert_response :success

    assert_equal true, get_body[:result]
  end
end
