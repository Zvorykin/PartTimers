module BasicService
  def parse_boolean(value)
    ActiveModel::Type::Boolean.new.cast(value)
  end
end