class ServicesController < ApplicationController
  before_action :set_service, only: [:show, :update, :destroy]

  # GET /services
  def index
    @services = Service.order(:code).all

    enabled = params[:enabled]
    @services = @services.where(enabled: enabled) if enabled

    surgery = params[:surgery]
    @services = @services.where(surgery: surgery) if surgery
  end

  # GET /services/1
  def show
  end

  # POST /services
  def create
    @service = Service.new(service_params)

    if @service.save
      render :show, status: :created, location: @service
    else
      render json: @service.errors, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /services/1
  def update
    if @service.update(service_params)
      render :show, status: :ok, location: @service
    else
      render json: @service.errors, status: :unprocessable_entity
    end
  end

  # DELETE /services/1
  def destroy
    @service.destroy
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_service
      @service = Service.find(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def service_params
      params.require(:service).permit(:code, :name, :surgery, :enabled)
    end
end
