require 'test_helper'

class TicketTest < ActiveSupport::TestCase
  def setup
    @ticket = Ticket.new(
      patient_name: 'some name',
      date: '2019-01-01',
      medic: Medic.first,
      services: [
        Service.first,
        Service.last
      ]
    )
  end

  test "patient_name should exist" do
    @ticket.patient_name = nil
    assert_not @ticket.save
  end

  test "date should exist" do
    @ticket.date = nil
    assert_not @ticket.save
  end

  test "medic should exist" do
    @ticket.medic = nil
    assert_not @ticket.save
  end

  test "services should exist" do
    @ticket.services = []
    assert_not @ticket.save
  end

  test "save should be true" do
    assert @ticket.save
  end
end
