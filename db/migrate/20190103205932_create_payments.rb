class CreatePayments < ActiveRecord::Migration[5.2]
  def change
    create_table :payments do |t|
      t.belongs_to :service, null: false
      t.belongs_to :manager, null: false
      t.float :value, null: false

      t.timestamps
    end
    add_index :payments, [:manager_id, :service_id], unique: true
  end
end
