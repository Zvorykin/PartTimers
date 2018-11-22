require 'test_helper'

class ParttimersControllerTest < ActionDispatch::IntegrationTest
  test "should get index" do
    get parttimers_index_url
    assert_response :success
  end

end
