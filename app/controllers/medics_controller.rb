class MedicsController < ApplicationController
  before_action :set_medic, only: %i[show update destroy]

  # GET /medics
  def index
    param! :enabled, :boolean

    @medics = MedicsService.find(params)
  end

  # GET /medics/1
  def show
  end

  # POST /medics
  def create
    validate_basic_params! true

    @medic = MedicsService.create(params)

    if @medic.save
      render :show, status: :created, location: @medic
    else
      render json: @medic.errors, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /medics/1
  def update
    validate_basic_params!
    param! :enabled, :boolean

    if @medic.update(sanitize_params)
      render :show, status: :ok, location: @medic
    else
      render json: @medic.errors, status: :unprocessable_entity
    end
  end

  # DELETE /medics/1
  def destroy
    @medic.destroy
  end

  private

  def validate_basic_params!(required = false)
    param! :name, String, required: required
    param! :manager_id, Integer, required: required
  end

  def sanitize_params
    params.to_h.except(:action, :controller, :medic, :manager_name)
  end

  def set_medic
    @medic = Medic.includes(:manager)
               .references(:managers)
               .find(params[:id])
  end
end
