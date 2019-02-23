class ReportsController < ApplicationController
  def tickets
    param! :date_from, Date, required: true
    param! :date_by, Date, required: true

    @report = {}
    @report[:data] = ReportsService.get_tickets(params)
    @report[:columns] = []
  end
end