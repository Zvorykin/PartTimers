class CreateServices < ActiveRecord::Migration[5.2]
  def change
    create_table :services do |t|
      t.string :code, null: false
      t.string :name, null: false
      t.boolean :surgery, null: false, default: false
      t.boolean :enabled, null: false, default: true

      t.timestamps
    end
    add_index :services, :code, unique: true
    add_index :services, :name, unique: true
  end
end
