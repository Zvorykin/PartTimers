# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rails db:seed command (or created alongside the database with db:setup).

ActiveRecord::Base.transaction do
  Manager.create([
                     {name: 'Медик'},
                     {name: 'Менеджер 1'},
                     {name: 'Менеджер 2'},
                     {name: 'Менеджер 3'}
                 ])
  Medic.create([
                   {name: 'Врач 1', manager_id: 2},
                   {name: 'Врач 2', manager_id: 2},
                   {name: 'Врач 3', manager_id: 3},
                   {name: 'Врач c фамилией из >25 символов', manager_id: 4},
               ])
  Service.create([
                     {code: '5.010', name: 'Операция 1', surgery: true},
                     {code: '5.011', name: 'Операция 2', surgery: true},
                     {code: '5.0310', name: 'Операция 3', surgery: true},
                     {code: '5.0311', name: 'Операция 4', surgery: true},
                     {code: '5.020', name: 'Диагностика 1', surgery: false},
                     {code: '5.021', name: 'Диагностика 2', surgery: false},
                     {code: '5.0420', name: 'Диагностика 3', surgery: false},
                     {code: '5.0421', name: 'Диагностика 4', surgery: false},
                 ])
  Payment.create([
                     {service_id: 1, manager_id: 1, value: 100},
                     {service_id: 1, manager_id: 2, value: 100},
                     {service_id: 1, manager_id: 3, value: 100},
                     {service_id: 1, manager_id: 4, value: 100},
                     {service_id: 2, manager_id: 1, value: 10},
                     {service_id: 3, manager_id: 1, value: 22.20},
                     {service_id: 4, manager_id: 1, value: 33.33},
                 ])

  TICKETS_TO_CREATE = [
      {
          ticket: {medic_id: 1, patient_name: 'Иванов В.С.', date: '2017-09-26'},
          service_id: 1
      },
      {
          ticket: {medic_id: 1, patient_name: 'Петров', date: '2017-09-27'},
          service_id: 1
      },
      {
          ticket: {medic_id: 1, patient_name: 'Сидоров', date: '2017-09-26'},
          service_id: 1
      },
      {
          ticket: {medic_id: 1, patient_name: 'Петров', date: '2017-09-26'},
          service_id: 2
      },
  ]

  TICKETS_TO_CREATE.each do |rec|
    ticket = Ticket.create(rec[:ticket])
    ticket.services << Service.find(rec[:service_id])
  end

end
