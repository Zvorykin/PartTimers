<template lang="pug">
  Card(:dis-hover="true", id="card")
    p(slot='title') Услуги и выплаты
    Button(slot="extra", icon="refresh",  @click="refresh", type='text', shape="circle", class="refresh-card-button")
    Form(:labelWidth="50", inline)
      FormItem(:labelWidth="1")
        Input(v-model.trim="service.code", size='small', placeholder="Код", style="width: 75px")
      FormItem(:labelWidth="1")
        Input(v-model.trim="service.name", size='small', placeholder="Название", style="width: 300px")
          span(slot="prepend") id: {{service.id}}
      FormItem(:labelWidth="5")
        Checkbox(v-model="service.surgery") Хирургия
      FormItem(:labelWidth="5")
        Checkbox(v-model="service.active") В работе
      FormItem(:labelWidth="1")
        Button(type='primary', size="small", icon="plus-round", @click="addService", shape="circle", :disabled="addDisabled")
      FormItem(:labelWidth="1")
        Button(type='success', size="small", icon="edit", @click="updateService", shape="circle", :disabled="editDisabled")
      FormItem(:labelWidth="100", label="Менеджер")
        Select(v-model="managerId", size="small", style="width: 150px")
          Option(v-for="item in managers", :value="item.id", :key="item.name")  {{item.name}}
      FormItem(:labelWidth="100", label="Размер выплаты", @keyup.enter="updatePayment")
        InputNumber(v-model="paymentValue", :step="10", :min="0", size="small", style="width: 100px")
      FormItem(:labelWidth="1")
        Button(type='warning', size="small", icon="checkmark-round", @click="updatePayment", shape="circle",
        :disabled="paymentDisabled")
    Table(border, size='small', :columns="table.columns", :data="table.data", height="490", width="1280",
    @on-current-change="selectRow",  highlight-row, :loading="loading")
      span(slot="footer") Всего: {{recCount}}
</template>

<script>
  export default {
    components: {},
    data() {
      return {
        service: {
          id: null,
          code: '',
          name: '',
          surgery: false,
          active: true
        },
        managerId: null,
        paymentValue: 0,
        managers: [],
        table: this.$getConst('EMPTY_TABLE'),
        loading: false
      }
    },
    computed: {
      recCount() {
        return this.table.data.length
      },
      addDisabled() {
        return (this.service.name.length === 0) || (this.service.code.length === 0)
      },
      editDisabled() {
        return (this.service.id === null) || this.addDisabled
      },
      paymentDisabled() {
        return (this.service.id === null) && (this.managerId === null)
      }
    },
    watch: {},
    methods: {
      refresh() {
        let request = this.axios({
          method: 'GET',
          url: `${this.$store.state.Main.apiLink}/managers`
        })
          .then(response => {
            this.managers = response.data
          })

        this.$makeRequest(this, request)

        this.reloadTable()
      },
      reloadTable() {
        this.manager = {
          id: null,
          name: ''
        }

        this.table.data = []

        let request = this.axios({
          method: 'GET',
          url: `${this.$store.state.Main.apiLink}/services`
        })
          .then(response => {
            function createColumns(managers, app) {
              let columns = [
                {
                  title: 'id',
                  key: 'id',
                  width: 70,
                  align: 'center',
                  sortable: true
                },
                {
                  title: 'Код',
                  key: 'code',
                  width: 90,
                  align: 'center',
                  sortable: true,
                },
                {
                  title: 'Название',
                  key: 'name',
                  width: 500,
                  sortable: true,
                },
                {
                  title: 'В работе',
                  key: 'active',
                  width: 100,
                  align: 'center',
                  sortable: true,
                  render: (h, params) => {
                    return h('div', [
                      h('Icon', {
                        props: {
                          type: params.row.active ? 'checkmark-round' : 'ios-circle-outline',
                          size: 'large'
                        }
                      })
                    ])
                  },
                },
                {
                  title: 'Хирургия',
                  key: 'surgery',
                  width: 100,
                  align: 'center',
                  sortable: true,
                  render: (h, params) => {
                    return h('div', [
                      h('Icon', {
                        props: {
                          type: params.row.surgery ? 'checkmark-round' : 'ios-circle-outline',
                          size: 'large'
                        }
                      })
                    ])
                  }
                }]

              managers.forEach(manager => {
                columns.push({
                  title: manager.name,
                  key: manager.name,
                  width: 130,
                  align: 'center',
                  render: (h, params) => {
                    params.value = params.row[params.column.title]

                    return h('div', {
                      on: {
                        click: () => {
                          app.managerId = app._.find(app.managers, {name: params.column.title}).id
                          app.paymentValue = params.value === '-' ? 0.00 : params.value
                        }
                      }
                    }, [h('span', params.value)
                    ])
                  }
                })
              })

              columns.push({className: 'invisible-column'})

              return columns
            }

            let table = response.data.table

            this.table.columns = createColumns(table.managers, this)
            this.table.data = table.data
          })

        this.$makeRequest(this, request)
      },
      selectRow(curRow) {
        this.service = {
          id: curRow.id,
          code: curRow.code,
          name: curRow.name,
          surgery: curRow.surgery === 1,
          active: curRow.active === 1
        }
      },
      addService() {
        let params = this.service

        let request = this.axios({
          method: 'POST',
          url: `${this.$store.state.Main.apiLink}/services`,
          data: params
        })
          .then(response => {
            this.service = {
              id: null,
              code: '',
              name: '',
              surgery: false,
              active: true
            }

            this.$Message.success('Успешно добавлено!')
            this.reloadTable()
          })

        this.$makeRequest(this, request)
      },
      updateService() {
        let params = this.service

        let request = this.axios({
          method: 'PATCH',
          url: `${this.$store.state.Main.apiLink}/services`,
          data: params
        })
          .then(response => {
            this.$Message.success('Обновление успешно выполнено!')
            this.reloadTable()
          })

        this.$makeRequest(this, request)
      },
      updatePayment() {
        if (this.paymentDisabled) {
          return false
        }

        let params = {
          serviceId: this.service.id,
          managerId: this.managerId,
          value: this.paymentValue
        }

        let request = this.axios({
          method: 'PUT',
          url: `${this.$store.state.Main.apiLink}/payments`,
          params: params
        })
          .then(response => {
            this.$Message.success('Обновление успешно выполнено!')
            // ОПТИМИСТИЧНОЕ ОБНОВЛЕНИЕ
            let updatedIndex = this._.findIndex(this.table.data, {id: this.service.id}),
              updatedmanager = this._.find(this.managers, {id: this.managerId}).name

            this.table.data[updatedIndex][updatedmanager] = this.paymentValue
          })

        this.$makeRequest(this, request)
      }
    },
    created() {
      this.refresh()
    }
  }
</script>

<style scoped>

</style>
