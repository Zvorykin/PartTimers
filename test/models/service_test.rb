require 'test_helper'

class ServiceTest < ActiveSupport::TestCase
  def setup
    @service = Service.new(code: '5.001', name: 'some service')
  end

  test "name should exist" do
    @service.name = nil
    assert_not @service.save
  end

  test "code should exist" do
    @service.code = nil
    assert_not @service.save
  end

  test "save should be true" do
    assert @service.save
  end
end
