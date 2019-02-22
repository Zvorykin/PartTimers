class Payment < ApplicationRecord
  belongs_to :manager
  belongs_to :service
  validates :value, presence: true
end
