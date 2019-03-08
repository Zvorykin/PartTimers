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
        Checkbox(v-model="service.enabled") В работе
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
          enabled: true,
        },
        managerId: null,
        paymentValue: 0,
        managers: [],
        table: this.$getConst('EMPTY_TABLE'),
        loading: false,
      }
    },
    computed: {
      recCount() {
        return this.table.data ? this.table.data.length : 0
      },
      addDisabled() {
        return !this.service.name || !this.service.name.length ||
          !this.service.code || !this.service.code.length
      },
      editDisabled() {
        return !this.service.id || this.addDisabled
      },
      paymentDisabled() {
        return !this.service.id && !this.managerId
      },
    },
    watch: {},
    methods: {
      async refresh() {
        const cb = async () => {
          const res = await this.axios({
            method: 'GET',
            url: `managers`,
            params: {
              include_medic: true,
            },
          })

          this.managers = res.data
          this.reloadTable()
        }

        await this.$makeRequest(this, cb)
      },
      async reloadTable() {
        this.manager = {
          id: null,
          name: '',
        }

        this.table = this.$getConst('EMPTY_TABLE')

        const cb = async () => {
          function createColumns(managers, app) {
            let columns = [
              {
                title: 'id',
                key: 'id',
                width: 70,
                align: 'center',
                sortable: true,
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
                width: 350,
                sortable: true,
              },
              {
                title: 'В работе',
                key: 'enabled',
                width: 100,
                align: 'center',
                sortable: true,
                render: (h, params) => {
                  return h('div', [
                    h('Icon', {
                      props: {
                        type: params.row.enabled ? 'checkmark-round' : 'ios-circle-outline',
                        size: 'large',
                      },
                    }),
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
                        size: 'large',
                      },
                    }),
                  ])
                },
              },
            ]

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
                          app.managerId = (app.managers.find(({ name }) => name === params.column.title)).id
                          app.paymentValue = params.value || 0.00
                        },
                      },
                    },
                    [h('span', params.value || '-')],
                  )
                },
              })
            })

            columns.push({ className: 'invisible-column' })

            return columns
          }

          const res = await this.axios({
            method: 'GET',
            url: `payments`,
          })

          let { data, managers } = res.data

          this.table.columns = createColumns(managers, this)
          this.table.data = data
        }

        this.$makeRequest(this, cb)
      },
      selectRow(curRow) {
        this.service = {
          id: curRow.id,
          code: curRow.code,
          name: curRow.name,
          surgery: Boolean(curRow.surgery),
          enabled: Boolean(curRow.enabled),
        }
      },
      async addService() {
        const cb = async () => {
          await this.axios({
            method: 'POST',
            url: `services`,
            data: this.service,
          })

          this.service = {
            id: null,
            code: '',
            name: '',
            surgery: false,
            enabled: true,
          }

          this.$Message.success('Успешно добавлено!')
          this.reloadTable()
        }

        this.$makeRequest(this, cb)
      },
      async updateService() {
        const cb = async () => {
          await this.axios({
            method: 'PATCH',
            url: `services/${this.service.id}`,
            data: this.service,
          })

          this.$Message.success('Обновление успешно выполнено!')
          this.reloadTable()
        }

        this.$makeRequest(this, cb)
      },
      updatePayment() {
        if (this.paymentDisabled) {
          return false
        }

        const cb = async () => {
          await this.axios({
            method: 'PUT',
            url: `services/${this.service.id}/managers/${this.managerId}/payment`,
            data: {
              value: this.paymentValue,
            },
          })

          const updatedRow = this.table.data.find(({id}) => id === this.service.id),
            updatedRowIndex = this.table.data.indexOf(updatedRow),
            updatedManagerName = this.managers.find(({id}) => id === this.managerId).name

          this.table.data[updatedRowIndex][updatedManagerName] = this.paymentValue

          this.$Message.success('Обновление успешно выполнено!')
        }

        this.$makeRequest(this, cb)
      },
    },
    created() {
      this.refresh()
    },
  }
</script>

<style scoped>

</style>
