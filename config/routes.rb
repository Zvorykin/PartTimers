Rails.application.routes.draw do
  scope 'api' do
    resources :tickets
    resources :services
    resources :managers
    resources :medics

    post 'login', to: 'login#auth'

    get 'reports/tickets', to: 'reports#view_tickets'
    post 'reports/tickets', to: 'reports#save_tickets' # to be done later

    get 'reports/payments', to: 'reports#view_payments'

    get 'payments', to: 'payments#index'
    put 'services/:service_id/managers/:manager_id/payment', to: 'services#set_payment'
  end

  get 'parttimers/index'
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
  root to: 'parttimers#index'
end
