total = 0

json.rows(@report[:medics]) do |medic|
  json.(medic, :name)

  services = {}

  medic.tickets.each do |ticket|
    ticket.services.each do |service|
      service_id = service[:id]

      if services[service_id]
        services[service_id][:amount] += 1
        services[service_id][:summary] += services[service_id][:payment]
      else
        payment_rec = @report[:payments].detect { |payment| payment[:service_id] == service_id }
        payment = (payment_rec || {})[:value] || 0

        services[service_id] = {
          name: service[:name],
          code: service[:code],
          payment: payment,
          summary: payment,
          amount: 1
        }
      end
    end

    json.services services.values.sort_by { |item| item['name'] }
  end

  medic_summary = services.values.to_a.reduce(0) {|acc, item| acc += item[:summary]}
  json.summary medic_summary

  total += medic_summary
end

json.total total