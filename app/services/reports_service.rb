module ReportsService
  class << self
    def get_tickets_report(params)
      date_range = params[:date_from].to_date..params[:date_by].to_date

      tickets = Ticket.eager_load(:medic, :services)
                  .where(
                    date: date_range,
                    enabled: true
                  )
                  .order(Medic.arel_table[:name].asc)

      columns = []
      medic_data = {}

      tickets.each do |item|
        medic_name = item.medic.name
        medic_data[medic_name] = {} if medic_data[medic_name].nil?

        item.services.each do |service|
          service_code = service[:code]
          medic_data[medic_name][service_code] = 0 if medic_data[medic_name][service_code].nil?

          medic_data[medic_name][service_code] += 1
          columns << service_code
        end
      end

      data = []

      medic_data.each do |medic_name, medic_stats|
        medic_stats[:summary] = medic_stats.values.reduce(0, &:+)
        medic_stats[:name] = medic_name
        data << medic_stats
      end

      {
        data: data.sort_by { |item| item['name'] },
        columns: columns.uniq
      }
    end

    def get_payments_report(params)
      date_range = params[:date_from].to_date..params[:date_by].to_date
      manager_id = params[:manager_id]

      payments = PaymentsService.get_manager_payments(1)

      medics = Medic.eager_load(tickets: :services)
                 .where(
                   tickets: {
                     enabled: true,
                     date: date_range
                   }
                 )

      {
        medics: medics,
        payments: payments
      }
    end
  end
end