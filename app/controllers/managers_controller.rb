class ManagersController < ApplicationController
  before_action :set_manager, only: %i[show update destroy]

  # GET /managers
  def index
    param! :enabled, :boolean
    param! :include_medic, :boolean

    @managers = ManagersService.find(params)
  end

  # GET /managers/1
  def show
  end

  # POST /managers
  def create
    param! :name, String, required: true

    @manager = Manager.new(
      name: params[:name]
    )

    if @manager.save
      render :show, status: :created, location: @manager
    else
      render json: @manager.errors, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /managers/1
  def update
    param! :name, String
    param! :enabled, :boolean

    if @manager.update(sanitize_params)
      render :show, status: :ok, location: @manager
    else
      render json: @manager.errors, status: :unprocessable_entity
    end
  end

  # DELETE /managers/1
  def destroy
    @manager.destroy
  end

  private

  def set_manager
    @manager = Manager.find(params[:id])
  end

  def sanitize_params
    params.to_h.except(:action, :controller, :manager)
  end
end
