module ManagersService
  class << self
    def find(params)
      enabled, include_medic = params.values_at(:enabled, :include_medic)

      @managers = Manager.all.order(:name)
      @managers = @managers.where.not(name: 'Медик') unless include_medic
      @managers = @managers.where(enabled: enabled) unless enabled.nil?

      @managers
    end
  end
end