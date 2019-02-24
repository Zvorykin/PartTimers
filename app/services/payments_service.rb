module PaymentsService
  class << self
    def find
      services = Service.joins(:payments).includes(:payments, :managers).all

      result = []

      services.each do |service|
        service.payments.each do |payment|
          manager_name = payment[:manager][:name]
          value = payment[:value]

          service[manager_name] = value
        end

        result.push(service)
      end

      result
    end
  end
end