module PaymentsService
  class << self
    def find
      services = Service.includes(payments: :manager).references(:payments, :managers)

      services.reduce([]) do |acc, service|
        service_rec = {
          id: service[:id],
          name: service[:name],
          surgery: service[:surgery]
        }

        service.payments.each do |payment|
          manager_name = payment.manager[:name]
          value = payment[:value]

          service_rec[manager_name] = value
        end

        acc.push(service_rec)
      end
    end
  end
end