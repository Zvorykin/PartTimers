class Ticket < ApplicationRecord
  scope :between_dates, ->(range) { where(date: range) }

  belongs_to :medic
  has_and_belongs_to_many :services

  validates_presence_of :patient_name
  validates_presence_of :date
  validates_presence_of :medic
  validates_presence_of :services
end
