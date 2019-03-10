ENV['RAILS_ENV'] ||= 'test'
require_relative '../config/environment'
require 'rails/test_help'
require "database_cleaner"

class ActiveSupport::TestCase
  # Setup all fixtures in test/fixtures/*.yml for all tests in alphabetical order.
  fixtures :all

  # Add more helper methods to be used by all tests here...

  def get_body
    JSON.parse(@response.body).with_indifferent_access
  end


  DatabaseCleaner.strategy = :transaction
  DatabaseCleaner.clean_with(:truncation)

  module AroundEachTest
    def before_setup
      super
      DatabaseCleaner.start
    end

    def after_teardown
      super
      DatabaseCleaner.clean
    end
  end

  class Minitest::Test
    include AroundEachTest
  end
end
