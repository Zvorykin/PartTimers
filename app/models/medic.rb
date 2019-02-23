class Medic < ApplicationRecord
  validates :name, presence: true

  belongs_to :manager
  has_many :tickets
end
