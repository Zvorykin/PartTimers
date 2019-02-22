class CreateTickets < ActiveRecord::Migration[5.2]
  def change
    create_table :tickets do |t|
      t.string :patient_name, null: false
      t.date :date, null: false
      t.belongs_to :medic, null: false
      t.boolean :enabled, null: false, default: true

      t.timestamps
    end
  end
end
