class ApplicationController < ActionController::API
  ActionController::Parameters.permit_all_parameters = true

  rescue_from ActiveRecord::RecordNotFound, with: :render_404

  rescue_from RailsParam::Param::InvalidParameterError do |err|
    render json: err, status: :bad_request
  end

  private
end
