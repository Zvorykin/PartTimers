module ReportsService
  class << self
    def get_tickets(params)
      date_range = params[:date_from].to_date..params[:date_by].to_date

      @medics = Medic.includes(:tickets)
                  .references(:tickets)
                  .where(tickets: { date: date_range })
      .distinct
      .pluck(:id)

    end
  end
end