class CreateTicketsServices < ActiveRecord::Migration[5.2]
  def change
    create_join_table :services, :tickets do |t|
      t.index :service
      t.index :ticket
    end

    add_index :services_tickets, [:service_id, :ticket_id], unique: true
  end
end
