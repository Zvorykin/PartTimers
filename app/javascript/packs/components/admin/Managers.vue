<template lang="pug">
  Card(:dis-hover="true", id="card")
    p(slot='title') Менеджеры
    Button(slot="extra", icon="refresh",  @click="refresh", type='text', shape="circle", class="refresh-card-button")
    Form(:labelWidth="50", inline)
      FormItem(:labelWidth="1")
        Input(v-model="manager.name", size='small', placeholder="ФИО", style="width: 175px")
          span(slot="prepend") id: {{manager.id}}
      FormItem(:labelWidth="5")
        Checkbox(v-model="manager.enabled") В работе
      FormItem(:labelWidth="1")
        Button(type='primary', size="small", icon="plus-round", @click="add", shape="circle", :disabled="addDisabled")
      FormItem(:labelWidth="1")
        Button(type='success', size="small", icon="edit", @click="update", shape="circle", :disabled="editDisabled")
    Table(border, size='small', :columns="table.columns", :data="table.data", height="490", width="420",
    @on-row-click="selectRow",  highlight-row, :row-class-name="rowClassName", :loading="loading")
      span(slot="footer") Всего: {{recCount}}
</template>

<script>
  export default {
    components: {},
    data() {
      return {
        manager: {
          id: null,
          name: '',
          enabled: true,
        },
        table: this.$getConst('EMPTY_TABLE'),
        loading: false,
      }
    },
    computed: {
      recCount() {
        return this.table.data ? this.table.data.length : 0
      },
      addDisabled() {
        return !this.manager.name.length
      },
      editDisabled() {
        return !this.manager.id
      },
    },
    watch: {},
    methods: {
      async refresh() {
        this.reloadTable()
      },
      async reloadTable() {
        this.manager = {
          id: null,
          name: '',
          enabled: true,
        }

        const cb = async () => this.axios({
          method: 'GET',
          url: `managers`,
        })

        this.table.data = await this.$makeRequest(this, cb)
      },
      rowClassName(row, index) {
        if (row.name === 'Медик') {
          return 'disabled-row'
        }
        return ''
      },
      selectRow(row) {
        if (row.name !== 'Медик') {
          this.manager.id = row.id
          this.manager.name = row.name
          this.manager.enabled = Boolean(row.enabled)
        }
      },
      async add() {
        const cb = async () => {
          await this.axios({
            method: 'POST',
            url: `managers`,
            data: this.manager,
          })

          this.reloadTable()
          this.$emit('refreshMedicsForm')
          this.$Message.success('Успешно добавлено!')
        }

        this.$makeRequest(this, cb)
      },
      update() {
        const cb = async () => {
          await this.axios({
            method: 'PATCH',
            url: `managers/${this.manager.id}`,
            data: this.manager,
          })

          this.$emit('refreshMedicsForm')
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
          width: 220,
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
