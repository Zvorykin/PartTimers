class Manager < ApplicationRecord
  validates :name, presence: true

  has_many :medics
  has_many :payments
  has_many :tickets, through: :medics
end
