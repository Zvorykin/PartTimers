class Service < ApplicationRecord
  validates :name, presence: true

  has_and_belongs_to_many :tickets
  has_many :payments
end
