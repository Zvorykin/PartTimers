class Payment < ApplicationRecord
  belongs_to :manager
  belongs_to :service
  validates :value, :manager_id, :service_id, presence: true
end
