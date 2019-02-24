module ServicesService
  class << self
    def find(params)
      enabled, surgery = params.values_at(:enabled, :surgery)

      services = Service.order(:code).all
      services = services.where(enabled: enabled) unless enabled.nil?
      services = services.where(surgery: surgery) unless surgery.nil?
      services
    end
  end
end