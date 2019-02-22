require 'json-schema'

class ApplicationController < ActionController::API
  ActionController::Parameters.permit_all_parameters = true

  rescue_from ActiveRecord::RecordNotFound, with: :render_404

  rescue_from RailsParam::Param::InvalidParameterError do |err|
    render json: err, status: :bad_request
  end

  private

  def validate_params(params)
    schema_name = "#{params[:controller]}_#{params[:action]}.json"
    schema_path = File.join(File.dirname(__FILE__), 'schemas', schema_name)
    hashed_params = params.to_h

    if File.exist?(schema_path)
      schema_content = File.read(schema_path)
      schema = JSON.parse(schema_content)

      validation_errors = JSON::Validator
                              .fully_validate(schema, hashed_params, insert_defaults: true)

      render json: validation_errors, status: :bad_request if validation_errors.any?
    else
      logger.warn "validate_params was requested but schema #{schema_name} not found - skipping"
    end

    hashed_params
  end
end
