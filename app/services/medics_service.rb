module MedicsService
  class << self
    def find(params)
      @medics = Medic.includes(:manager)
                  .references(:managers)
                  .order(:name)
                  .all

      enabled = params[:enabled]
      @medics = @medics.where(enabled: enabled) unless enabled.nil?

      @medics
    end

    def create(params)
      query_params = %i[name manager_id]
      name, manager_id = params.values_at(*query_params)

      Medic.new(
        name: name,
        enabled: true,
        manager: Manager.find(manager_id)
      )
    end
  end
end