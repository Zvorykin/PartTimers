require 'test_helper'

class ManagerTest < ActiveSupport::TestCase
  test "validates missing name" do
    manager = Manager.new
    assert_not manager.save
  end

  test "validates save" do
    manager = Manager.new(name: 'manager1')
    assert manager.save
  end
end
