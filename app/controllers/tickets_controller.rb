class TicketsController < ApplicationController
  before_action :set_ticket, only: %i[show update destroy]

  # GET /tickets
  def index
    validate_common_params!

    @tickets = TicketService.find(params)
  end

  # GET /tickets/1
  def show
  end

  # POST /tickets
  def create
    validate_common_params!true
    validate_services_ids! true

    @ticket = TicketService.create(sanitize_params)
    if @ticket.save
      render :show, status: :created, location: @ticket
    else
      render json: @ticket.errors, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /tickets/1
  def update
    validate_common_params!
    validate_services_ids!

    if @ticket.update(sanitize_params)
      render :show, status: :ok, location: @ticket
    else
      render json: @ticket.errors, status: :unprocessable_entity
    end
  end

  # DELETE /tickets/1
  def destroy
    @ticket.destroy
  end

  private

  def validate_common_params!(required = false)
    param! :medicId, Integer, min: 0, required: required
    param! :enabled, :boolean
    param! :date, Date, required: required
    param! :patientName, String, required: required
  end

  def validate_services_ids!(required = false)
    param! :services, Array, required: required do |array, index|
      array.param! index, Integer, required: true
    end
  end

  # Use callbacks to share common setup or constraints between actions.
  def set_ticket
    @ticket = Ticket.left_joins(:services, :medic).find(params[:id])
  end

  def sanitize_params
    params.to_h.except(:action, :controller, :ticket)
  end
end
