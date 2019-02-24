<template lang="pug">
  Card(:dis-hover="true", id="card")
    p(slot='title') Врачи
    Button(slot="extra", icon="refresh",  @click="refresh", type='text', shape="circle", class="refresh-card-button")
    Form(:labelWidth="50", inline)
      FormItem(:labelWidth="1")
        Input(v-model.trim="medic.name", size='small', placeholder="ФИО", style="width: 225px")
          span(slot="prepend") id: {{medic.id}}
      FormItem(:labelWidth="60", label="Менеджер")
        Select(v-model="medic.manager_id", size="small", style="width:150px")
          Option(v-for="item in managers", :value="item.id", :key="item.name")  {{item.name}}
      FormItem(:labelWidth="5")
        Checkbox(v-model="medic.enabled") В работе
      FormItem(:labelWidth="1")
        Button(type='primary', size="small", icon="plus-round", @click="add", shape="circle", :disabled="addDisabled")
      FormItem(:labelWidth="1")
        Button(type='success', size="small", icon="edit", @click="update", shape="circle", :disabled="editDisabled")
    Table(border, size='small', :columns="table.columns", :data="table.data", height="490", width="650",
    @on-row-click="selectMedic",  highlight-row, :loading="loading")
      span(slot="footer") Всего: {{recCount}}
</template>

<script>
  export default {
    components: {},
    data() {
      return {
        medic: {
          id: null,
          name: '',
          enabled: true,
          manager_id: null,
        },
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
        return !this.medic.name || !this.medic.manager_id
      },
      editDisabled() {
        return !this.medic.id && this.addDisabled
      },
    },
    watch: {},
    methods: {
      async refresh() {
        const cb = async () => this.axios({
          method: 'GET',
          url: `managers`,
        })

        this.managers = await this.$makeRequest(this, cb)

        this.reloadTable()
      },
      async reloadTable() {
        this.medic = {
          id: null,
          name: '',
          enabled: true,
          manager_id: null,
        }

        const cb = async () => this.axios({
          method: 'GET',
          url: `medics`,
        })

        this.table.data = (await this.$makeRequest(this, cb))
          .map(item => ({
            ...item,
            manager_name: item.manager.name,
            manager_id: item.manager.id
          }))
      },
      selectMedic(row) {
        this.medic.id = row.id
        this.medic.name = row.name
        this.medic.enabled = Boolean(row.enabled)
        this.medic.manager_id = row.manager.id
        this.medic.manager_name = row.manager.name
      },
      async add() {
        const cb = async () => {
          await this.axios({
            method: 'POST',
            url: `medics`,
            data: this.medic,
          })

          this.reloadTable()
          this.$Message.success('Успешно добавлено!')
        }

        this.$makeRequest(this, cb)
      },
      async update() {
        const cb = async () => {
          await this.axios({
            method: 'PATCH',
            url: `medics/${this.medic.id}`,
            data: this.medic,
          })

          this.reloadTable()
          this.$Message.success('Обновление успешно выполнено!')
        }

        this.$makeRequest(this, cb)
      },
    },
    created() {
      this.table.columns = [
        {
          title: 'id',
          key: 'id',
          width: 70,
          align: 'center',
          sortable: true,
        },
        {
          title: 'ФИО',
          key: 'name',
          width: 300,
          sortable: true,
        },
        {
          title: 'Менеджер',
          key: 'manager_name',
          width: 150,
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
        { className: 'invisible-column' },
      ]

      this.refresh()
    },
  }
</script>

<style scoped>

</style>
