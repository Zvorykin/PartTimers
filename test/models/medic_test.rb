require 'test_helper'

class MedicTest < ActiveSupport::TestCase
  def setup
    @medic = Medic.new(name: 'medic name', manager: Manager.first)
  end

  test "name should exist" do
    @medic.name = nil
    assert_not @medic.save
  end

  test "manager should exist" do
    @medic.manager = nil
    assert_not @medic.save
  end

  test "save should be true" do
    assert @medic.save
  end

  test "name should be unique" do
    duplicate_medic = @medic.dup
    @medic.save
    duplicate_medic.save
  rescue => e
    assert e.class == ActiveRecord::RecordNotUnique
  end
end
