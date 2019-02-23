class ReportsController < ApplicationController
  def tickets
    param! :date_from, Date, required: true
    param! :date_by, Date, required: true

    @report = ReportsService.get_tickets_report(params)
  end
end