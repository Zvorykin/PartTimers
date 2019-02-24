class PaymentsController < ApplicationController
  before_action :set_payment, only: %i[show update destroy]

  # GET /payments
  def index
    @payments = PaymentsService.find
  end

  # GET /payments/1
  def show
  end

  # POST /payments
  def create
    @payment = Payment.new(payment_params)

    if @payment.save
      render :show, status: :created, location: @payment
    else
      render json: @payment.errors, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /payments/1
  def update
    if @payment.update(payment_params)
      render :show, status: :ok, location: @payment
    else
      render json: @payment.errors, status: :unprocessable_entity
    end
  end

  # DELETE /payments/1
  def destroy
    @payment.destroy
  end

  private

  def set_payment
    @payment = Payment.find(params[:id])
  end
end
