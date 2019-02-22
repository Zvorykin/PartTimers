Rails.application.routes.draw do
  scope 'api' do
    resources :payments
    resources :tickets
    resources :services
    resources :managers
    resources :medics

    post 'login', to: 'login#auth'
  end

  get 'parttimers/index'
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
  root to: 'parttimers#index'
end
