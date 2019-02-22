class Ticket < ApplicationRecord
  belongs_to :medic
  has_and_belongs_to_many :services

  validates_presence_of :medic
  validates_presence_of :services
end
