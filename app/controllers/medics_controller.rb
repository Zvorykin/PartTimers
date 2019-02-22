class MedicsController < ApplicationController
  before_action :set_medic, only: %i[show update destroy]

  # GET /medics
  def index
    @medics = Medic.joins(:manager).order(:name)

    enabled = params[:enabled]
    @medics = @medics.where(enabled: enabled) if enabled
  end

  # GET /medics/1
  def show
  end

  # POST /medics
  def create
    @medic = Medic.new(medic_params)

    if @medic.save
      render :show, status: :created, location: @medic
    else
      render json: @medic.errors, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /medics/1
  def update
    if @medic.update(medic_params)
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

  # Use callbacks to share common setup or constraints between actions.
  def set_medic
    @medic = Medic.joins(:manager).find(params[:id])
  end

  # Never trust parameters from the scary internet, only allow the white list through.
  def medic_params
    params.require(:medic).permit(:name, :enabled)
  end
end
