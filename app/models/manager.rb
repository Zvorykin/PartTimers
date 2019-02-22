class Manager < ApplicationRecord
  validates :name, presence: true
  has_many :medics
end
