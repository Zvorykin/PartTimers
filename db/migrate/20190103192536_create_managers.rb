class CreateManagers < ActiveRecord::Migration[5.2]
  def change
    create_table :managers do |t|
      t.string :name, null: false
      t.boolean :enabled, null: false, default: true

      t.timestamps
    end
    add_index :managers, :name, unique: true
  end
end
