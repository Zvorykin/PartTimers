class CreateMedics < ActiveRecord::Migration[5.2]
  def change
    create_table :medics do |t|
      t.string :name, null: false
      t.boolean :enabled, null: false, default: true
      t.belongs_to :manager, null: false

      t.timestamps
    end
    add_index :medics, :name, unique: true
  end
end
