<template lang="pug">
  Card(:dis-hover="true", id="card")
    p(slot='title') Менеджеры
    Button(slot="extra", icon="refresh",  @click="refresh", type='text', shape="circle", class="refresh-card-button")
    Form(:labelWidth="50", inline)
      FormItem(:labelWidth="1")
        Input(v-model="manager.name", size='small', placeholder="ФИО", style="width: 175px")
          span(slot="prepend") id: {{manager.id}}
      FormItem(:labelWidth="5")
        Checkbox(v-model="manager.active") В работе
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
          active: true,
        },
        table: this.$getConst('EMPTY_TABLE'),
        loading: false
      }
    },
    computed: {
      recCount() {
        return this.table.data.length
      },
      addDisabled() {
        return this.manager.name.length === 0
      },
      editDisabled() {
        return this.manager.id === null
      }
    },
    watch: {},
    methods: {
      async refresh() {
        this.reloadTable()
      },
      reloadTable() {
        this.manager = {
          id: null,
          name: '',
          active: true,
        }

        let request = this.axios({
          method: 'GET',
          url: `${this.$store.state.Main.apiLink}/managers`
        })
          .then(response => {
            this.table.data = response.data
          })

        this.$makeRequest(this, request)
      },
      rowClassName(row, index) {
        if (row.name === 'Медик') {
          return 'disabled-row'
        }
        return ''
      },
      selectRow(row) {
        if (row.id !== 1) {
          this.manager.id = row.id
          this.manager.name = row.name
          this.manager.active = (row.active === 1)
        }
      },
      add() {
        let params = this.manager

        let request = this.axios({
          method: 'POST',
          url: `${this.$store.state.Main.apiLink}/managers`,
          data: params
        })
          .then(response => {
            this.reloadTable()
            this.$emit('refreshMedicsForm')
            this.$Message.success('Успешно добавлено!')
          })

        this.$makeRequest(this, request)
      },
      update() {
        let params = this.manager

        let request = this.axios({
          method: 'PATCH',
          url: `${this.$store.state.Main.apiLink}/managers`,
          data: params
        })
          .then(response => {
            this.$emit('refreshMedicsForm')
            this.reloadTable()
            this.$Message.success('Обновление успешно выполнено!')
          })

        this.$makeRequest(this, request)
      }
    },
    created() {
      this.table.columns = [
        {
          title: 'id',
          key: 'id',
          width: 70,
          align: 'center',
          sortable: true
        },
        {
          title: 'ФИО',
          key: 'name',
          width: 220,
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
          }
        },
        {className: 'invisible-column'}]

      this.refresh()
    }
  }
</script>

<style scoped>

</style>
