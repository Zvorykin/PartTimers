module PaymentsService
  class << self
    def find
      services = Service.includes(payments: :manager)
                   .references(:payments, :managers)

      managers = Manager.joins(:payments)
                   .references(:payments)
                   .distinct
                   .select(:name)

      services = services.reduce([]) do |acc, service|
        service_rec = {
          id: service[:id],
          name: service[:name],
          surgery: service[:surgery],
          enabled: service[:enabled],
          code: service[:code]
        }

        service.payments.each do |payment|
          manager_name = payment.manager[:name]
          value = payment[:value]

          service_rec[manager_name] = value
        end

        managers.each do |manager|
          manager_name = manager[:name]
          service_rec[manager_name] = service_rec[manager_name] || 0.00
        end

        acc.push(service_rec)
      end

      {
        services: services,
        managers: managers
      }
    end

    def update(params)
      value, service_id, manager_id = params.values_at(:value, :service_id, :manager_id)

      payment = Payment.find_or_initialize_by(
        service_id: service_id,
        manager_id: manager_id
      )

      payment.update(value: value)
      payment.save
      payment
    end

    def get_manager_payments(manager_id)
      Payment.select('service_id', 'value')
        .where(manager_id: manager_id)
    end
  end
end