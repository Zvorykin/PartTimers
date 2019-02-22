class LoginController < ApplicationController
  # protect_from_forgery with: :null_session

  def auth
    result = admin? ? params[:password] == '5' : true

    render json: { isAdmin: admin?, result: result }
  end

  private

  def admin?
    params.fetch(:isAdmin, false)
  end
end
