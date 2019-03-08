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
    validate_basic_params!(true)

    @service = ServicesService.create(params)

    if @service.save
      render :show, status: :created, location: @service
    else
      render json: @service.errors, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /services/1
  def update
    validate_basic_params!
    param! :enabled, :boolean

    if @service.update(sanitize_params)
      render :show, status: :ok, location: @service
    else
      render json: @service.errors, status: :unprocessable_entity
    end
  end

  # DELETE /services/1
  def destroy
    @service.destroy
  end

  def set_payment
    param! :service_id, Integer, required: true
    param! :manager_id, Integer, required: true
    param! :value, Float, required: true

    @payment = PaymentsService.update(params)
  end

  private

  def validate_basic_params!(required = false)
    param! :name, String, required: required
    param! :code, String, required: required
    param! :surgery, :boolean, required: required
  end

  def sanitize_params
    params.to_h.except(:action, :controller, :service)
  end

  def set_service
    @service = Service.find(params[:id])
  end
end
