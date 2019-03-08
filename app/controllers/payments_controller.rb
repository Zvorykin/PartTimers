class PaymentsController < ApplicationController

  # GET /payments
  def index
    @payments, @managers = PaymentsService.find
                             .values_at(:services, :managers)
  end

end
