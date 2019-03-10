require 'test_helper'

class ServicesControllerTest < ActionDispatch::IntegrationTest
  setup do
    @service = services(:one)
    @common_params = {
      code: '5.011',
      name: 'service 1000',
      surgery: false
    }
  end

  test "should get index" do
    get services_url, as: :json
    assert_response :success
  end

  test "code should exist" do
    @common_params[:code] = nil
    post services_url, params: @common_params, as: :json

    assert_response 400
  end

  test "name should exist" do
    @common_params[:name] = nil
    post services_url, params: @common_params, as: :json

    assert_response 400
  end

  test "surgery should exist" do
    @common_params[:surgery] = nil
    post services_url, params: @common_params, as: :json

    assert_response 400
  end

  test "should create service" do
    assert_difference('Service.count') do
      post services_url, params: @common_params, as: :json
    end

    assert_response 201
  end

  test "should show service" do
    get service_url(@service), as: :json
    assert_response :success
  end

  test "should update service" do
    patch service_url(@service), params: {
      code: @service.code,
      enabled: @service.enabled,
      name: @service.name,
      surgery: @service.surgery
    }, as: :json
    assert_response 200
  end

  test "should destroy service" do
    assert_difference('Service.count', -1) do
      delete service_url(@service), as: :json
    end

    assert_response 204
  end
end
