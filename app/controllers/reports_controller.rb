class ReportsController < ApplicationController
  def view_tickets
    validate_date_params!

    @report = ReportsService.get_tickets_report(params)
  end

  def view_payments
    validate_date_params!
    param! :manager_id, Integer

    @report = ReportsService.get_payments_report(params)
  end

  def validate_date_params!
    param! :date_from, Date, required: true
    param! :date_by, Date, required: true
  end
end