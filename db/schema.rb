# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 2019_01_04_095245) do

  create_table "managers", force: :cascade do |t|
    t.string "name", null: false
    t.boolean "enabled", default: true, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["name"], name: "index_managers_on_name", unique: true
  end

  create_table "medics", force: :cascade do |t|
    t.string "name", null: false
    t.boolean "enabled", default: true, null: false
    t.integer "manager_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["manager_id"], name: "index_medics_on_manager_id"
    t.index ["name"], name: "index_medics_on_name", unique: true
  end

  create_table "payments", force: :cascade do |t|
    t.integer "service_id", null: false
    t.integer "manager_id", null: false
    t.float "value", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["manager_id", "service_id"], name: "index_payments_on_manager_id_and_service_id", unique: true
    t.index ["manager_id"], name: "index_payments_on_manager_id"
    t.index ["service_id"], name: "index_payments_on_service_id"
  end

  create_table "services", force: :cascade do |t|
    t.string "code", null: false
    t.string "name", null: false
    t.boolean "surgery", default: false, null: false
    t.boolean "enabled", default: true, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["code"], name: "index_services_on_code", unique: true
    t.index ["name"], name: "index_services_on_name", unique: true
  end

  create_table "services_tickets", id: false, force: :cascade do |t|
    t.integer "service_id", null: false
    t.integer "ticket_id", null: false
    t.index ["service_id", "ticket_id"], name: "index_services_tickets_on_service_id_and_ticket_id", unique: true
    t.index [nil], name: "index_services_tickets_on_service"
    t.index [nil], name: "index_services_tickets_on_ticket"
  end

  create_table "tickets", force: :cascade do |t|
    t.string "patient_name", null: false
    t.date "date", null: false
    t.integer "medic_id", null: false
    t.boolean "enabled", default: true, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["medic_id"], name: "index_tickets_on_medic_id"
  end

  create_table "users", force: :cascade do |t|
    t.string "name"
    t.string "admin"
    t.string "password_digest"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

end
