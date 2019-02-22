class User < ApplicationRecord
  #Validations
  validates_presence_of :name, :admin, :password_digest

  #encrypt password
  has_secure_password
end
