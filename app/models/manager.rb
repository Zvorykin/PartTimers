class Manager < ApplicationRecord
  validates :name, presence: true
  has_many :medics
  has_many :payments
end
