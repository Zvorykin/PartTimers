class ServicesController < ApplicationController
  before_action :set_service, only: %i[show update destroy]

  # GET /services
  def index
    param! :enabled, :boolean
    param! :surgery, :boolean

    @services = ServicesService.find(params)
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

  def set_service
    @service = Service.find(params[:id])
  end
end
