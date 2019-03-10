require 'test_helper'

class TicketsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @ticket = tickets(:one)
    @common_params = {
      patient_name: 'some name',
      medic_id: medics(:one).id,
      date: '2019-01-01',
      services: [services(:one).id, services(:two).id]
    }
  end

  test "should get index" do
    get tickets_url, as: :json
    assert_response :success
  end

  test 'patient_name should exits' do
    post tickets_url, params: @common_params.except(:patient_name), as: :json
    assert_response 400
  end

  test 'medic_id should exits' do
    post tickets_url, params: @common_params.except(:medic_id), as: :json
    assert_response 400
  end

  test 'date should exits' do
    post tickets_url, params: @common_params.except(:date), as: :json
    assert_response 400
  end

  test 'services should exits' do
    post tickets_url, params: @common_params.except(:services), as: :json
    assert_response 400
  end

  test "should create ticket" do
    assert_difference('Ticket.count') do
      post tickets_url, params: @common_params, as: :json
    end

    assert_response 201
  end

  test "should show ticket" do
    get ticket_url(@ticket), as: :json
    assert_response :success
  end

  test "should update ticket" do
    patch ticket_url(@ticket), params: @common_params.except(:services), as: :json
    assert_response 200
  end

  test "should destroy ticket" do
    assert_difference('Ticket.count', -1) do
      delete ticket_url(@ticket), as: :json
    end

    assert_response 204
  end
end
