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
  let moment = require('moment')
  import TicketsForm from './TicketsForm.vue'

  export default {
    components: {TicketsForm},
    data() {
      return {
        reportDate: new Date,
        columns: [
          {
            title: 'В работе',
            key: 'active',
            width: 100,
            align: 'center',
            sortable: true,
            render: (h, params) => {
              return h('div', [
                h('i-switch', {
                  props: {
                    value: params.row.active === 1,
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
            key: 'patientName',
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
            key: 'createdAt',
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
        let request = this.axios({
          method: 'GET',
          url: `${this.$store.state.Main.apiLink}/medics/user`
        })
          .then(response => {
            this.medics = [{name: 'Все', id: 0}]
            this.medics = this.medics.concat(response.data)
            this.medicId = this.medics[0].id
          })

        this.$makeRequest(this, request)
      },
      reloadTicketListIfAutoReload() {
        if (this.autoReload) {
          this.reloadTicketList()
        }
      },
      loadTickets() {
        this.loading = true
        this.tableData = []

        let request = this.axios({
          method: 'GET',
          url: `${this.$store.state.Main.apiLink}/tickets/list`,
          params: {
            dateMonth: this.reportDate,
            medicId: this.medicId,
            showDeleted: this.showDeleted,
            showSurgical: this.$store.state.Main.masterLogin
          }
        })
          .then(response => {
            response.data.forEach(item => {
              item.createdAt = moment(item.createdAt).format('Y-MM-DD HH:mm:ss')
              this.tableData.push(item)
            })
          })

        this.$makeRequest(this, request)
      },
      reloadTicketList() {
        this.reportDate = new Date
        this.loadTickets()
      },
      setTicketActiveState(id, active) {
        let request = this.axios({
          method: 'PATCH',
          url: `${this.$store.state.Main.apiLink}/tickets`,
          data: {
            id: id,
            active: active
          }
        })
          .then(response => {
            this.$Message.success('Обновление успешно выполнено!')
          })

        this.$makeRequest(this, request, false)
      }
    },
    mounted() {
      this.refresh()
      //this.loadTickets()
    }
  }
</script>

<style scoped>

</style>
