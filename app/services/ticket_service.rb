module TicketService
  class << self
    include BasicService

    def find(params)
      query_params = %i[date medic_id enabled show_surgical patient_name]
      date, medic_id, enabled, surgical, patient_name = params.values_at(*query_params)

      where_conditions = {}
      if patient_name
        where_conditions = Ticket.arel_table[:patient_name].matches("%#{patient_name}%")
      else
        if date
          date = date.to_date
          where_conditions[:date] = date.beginning_of_month..date.end_of_month
        end

        where_conditions[:medic_id] = medic_id if medic_id
        where_conditions[:enabled] = parse_boolean(enabled) unless enabled.nil?
        where_conditions[:services] = { surgery: surgical } unless surgical.nil?
      end

      Ticket.includes(:services, :medic)
        .references(:services)
        .order(date: :desc, created_at: :desc)
        .order(Service.arel_table[:code].asc)
        .where(where_conditions)
    end

    def create(params)
      req_params = %i[medic_id patient_name date services]
      medic_id, patient_name, date, services_ids = params.values_at(*req_params)

      Ticket.new(
        patient_name: patient_name,
        date: date,
        medic: Medic.find(medic_id),
        services: Service.find(services_ids)
      )
    end
  end
end