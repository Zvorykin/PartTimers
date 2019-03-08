module ServicesService
  class << self
    def find(params)
      enabled, surgery = params.values_at(:enabled, :surgery)

      services = Service.order(:code).all
      services = services.where(enabled: enabled) unless enabled.nil?
      services = services.where(surgery: surgery) unless surgery.nil?
      services
    end

    def create(params)
      query_params = %i[name code surgery]
      name, code, surgery = params.values_at(*query_params)

      Service.new(
        name: name,
        code: code,
        enabled: true,
        surgery: surgery
      )
    end
  end
end