module ReportsService
  class << self
    def get_tickets_report(params)
      date_range = params[:date_from].to_date..params[:date_by].to_date

      tickets = Ticket
                  .includes(:medic, :services)
                  .references(:medics, :services)
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
        medic_stats[:summary] = medic_stats.values.reduce(0) { |sum, value| sum + value }
        medic_stats[:name] = medic_name
        data << medic_stats
      end

      columns = columns.uniq.map! do |value|
        {
          key: value,
          title: value,
          width: 80,
          align: 'center'
        }
      end

      {
        data: data.sort_by { |item| item['name'] },
        columns: columns
                   .unshift(
                     title: 'Врач',
                     key: 'name',
                     width: 250,
                     sortable: true,
                     fixed: 'left'
                   )
                   .push(
                     title: 'Всего',
                     key: 'summary',
                     width: 80,
                     align: 'center',
                     sortable: true,
                     fixed: 'right'
                   )
      }
    end
  end
end