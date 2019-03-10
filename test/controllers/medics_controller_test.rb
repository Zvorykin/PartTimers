require 'test_helper'

class MedicsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @medic = medics(:one)
  end

  test "should get index" do
    get medics_url, as: :json
    assert_response :success
  end

  test "manager_id should exits" do
    post medics_url, params: { name: 'new medic' }, as: :json

    assert_response 400
  end

  test "should create medic" do
    assert_difference('Medic.count') do
      post medics_url, params: { name: 'new medic', manager_id: Manager.first.id }, as: :json
    end

    assert_response 201
  end

  test "should show medic" do
    get medic_url(@medic), as: :json
    assert_response :success
  end

  test "should update medic" do
    patch medic_url(@medic), params: { name: @medic.name }, as: :json
    assert_response 200
  end

  test "should destroy medic" do
    assert_difference('Medic.count', -1) do
      delete medic_url(@medic), as: :json
    end

    assert_response 204
  end
end
