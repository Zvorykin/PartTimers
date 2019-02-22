<template lang="pug">
    div
        tickets-form(v-on:reloadTicketList="reloadTicketListIfAutoReload")
        Card(:dis-hover="true")
            p(slot='title') Список направлений
            Form(:labelWidth="50", inline)
                FormItem(label='Отчетный период', :labelWidth="110")
                    Date-picker(v-model="reportDate", format="MMM yyyy", placement='bottom-start', type="month", size="small",
                    :clearable="false")
                FormItem(:labelWidth="150", label="Показывать удаленные")
                    i-switch(v-model="showDeleted")
                FormItem(label='Врач', :labelWidth="40")
                    Select(v-model="medicId", size="small", transfer, style="width:300px", filterable)
                        Option(v-for="item in medics", :value="item.id", :key="item.name")  {{item.name}}
                FormItem(:labelWidth="5")
                    Button(type='primary', size="small", @click="loadTickets") Показать
                FormItem(:labelWidth="5")
                    Checkbox(v-model="autoReload") автообновление
            Table(border, size='small', :columns="columns", :data="tableData", height="400", width="1260", :loading="loading")
                span(slot="footer") Всего: {{recCount}}
</template>

<script>
  const moment = require('moment')
  import TicketsForm from './TicketsForm.vue'

  export default {
    components: {TicketsForm},
    data() {
      return {
        reportDate: new Date,
        columns: [
          {
            title: 'В работе',
            key: 'enabled',
            width: 100,
            align: 'center',
            sortable: true,
            render: (h, params) => {
              return h('div', [
                h('i-switch', {
                  props: {
                    value: params.row.enabled,
                    size: 'small'
                  },
                  on: {
                    'on-change': (state) => this.setTicketActiveState(params.row.id, state)
                  }
                })
              ])
            }
          },
          {
            title: 'Дата',
            key: 'date',
            width: 85,
            align: 'center',
            sortable: true
          },
          {
            title: 'Врач',
            key: 'name',
            width: 230,
            sortable: true
          },
          {
            title: 'ФИО пациента',
            key: 'patient_name',
            width: 140,
            sortable: true
          },
          {
            title: 'Услуги',
            key: 'services',
            width: 540,
            align: 'center'
          },
          {
            title: 'Время создания',
            key: 'created_at',
            width: 140,
            align: 'center',
            sortable: true
          },
          {
            className: 'invisible-column',
          }
        ],
        tableData: [],
        medicId: 0,
        medics: [],
        showDeleted: false,
        autoReload: false,
        loading: false
      }
    },
    computed: {
      recCount() {
        return this.tableData.length
      }
    },
    watch: {},
    methods: {
      async refresh() {
        const cb = async () => {
          const res = await this.axios({
            method: 'GET',
            url: `medics`,
            params: {
              enabled: true
            }
          })

          this.medics = [{name: 'Все', id: 0}, ...res.data]
          this.medicId = 0
        }

        await this.$makeRequest(this, cb)
      },
      reloadTicketListIfAutoReload() {
        if (this.autoReload) {
          this.reloadTicketList()
        }
      },
      async loadTickets() {
        const cb = async () => {
          this.tableData = []

          const params = {
            date: moment(this.reportDate).endOf('month')
          }

          if (!this.showDeleted) {
            params.enabled = true;
          }

          if (this.$store.state.Main.admin) {
            params.showSurgical = this.$store.state.Main.admin
          }

          if (this.medicId) {
            params.medicId = this.medicId
          }

          const res = await this.axios({
            method: 'GET',
            url: 'tickets',
            params
          })

          res.data.forEach(item => {
            item.created_at = moment(item.created_at).format('Y-MM-DD HH:mm:ss')
            item.services = item.services.reduce((line, service) => {
              line += `${line || ''}\n${service.code} - ${service.name}`
              return line.trim()
            }, '')
            this.tableData.push(item)
          })
        }

        await this.$makeRequest(this, cb)
      },
      reloadTicketList() {
        this.reportDate = new Date
        this.loadTickets()
      },
      setTicketActiveState(id, enabled) {
        const cb = async () => {
          await this.axios({
            method: 'PATCH',
            url: `tickets/${id}`,
            data: {
              ticket: {
                enabled
              }
            }
          })

          this.$Message.success('Обновление успешно выполнено!')
        }

        this.$makeRequest(this, cb, false)
      }
    },
    mounted() {
      this.refresh()
    }
  }
</script>

<style scoped>

</style>
