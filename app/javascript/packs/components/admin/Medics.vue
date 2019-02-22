<template lang="pug">
  Card(:dis-hover="true", id="card")
    p(slot='title') Врачи
    Button(slot="extra", icon="refresh",  @click="refresh", type='text', shape="circle", class="refresh-card-button")
    Form(:labelWidth="50", inline)
      FormItem(:labelWidth="1")
        Input(v-model.trim="medic.name", size='small', placeholder="ФИО", style="width: 225px")
          span(slot="prepend") id: {{medic.id}}
      FormItem(:labelWidth="60", label="Менеджер")
        Select(v-model="medic.managerId", size="small", style="width:150px")
          Option(v-for="item in managers", :value="item.id", :key="item.name")  {{item.name}}
      FormItem(:labelWidth="5")
        Checkbox(v-model="medic.active") В работе
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
          active: true,
          managerId: null,
        },
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
        return (this.medic.name.length === 0) || (this.medic.managerId === null)
      },
      editDisabled() {
        return (this.medic.id === null) && this.addDisabled
      }
    },
    watch: {},
    methods: {
      refresh() {
        let managersRequest = this.axios({
          method: 'GET',
          url: `${this.$store.state.Main.apiLink}/managers/active`
        })
          .then(response => {
            this.managers = response.data.filter(item => {
              return item.name !== 'Медик'
            })
          })

        this.$makeRequest(this, managersRequest)

        this.reloadTable()
      },
      reloadTable() {
        this.medic = {
          id: null,
          name: '',
          active: true,
          // managerId: null,
        }

        let request = this.axios({
          method: 'GET',
          url: `${this.$store.state.Main.apiLink}/medics`
        })
          .then(response => {
            this.table.data = response.data
          })

        this.$makeRequest(this, request)
      },
      selectMedic(row) {
        this.medic.id = row.id
        this.medic.name = row.name
        this.medic.active = (row.active === 1)
        this.medic.managerId = this._.find(this.managers, {name: row.manager}).id
      },
      add() {
        let params = this.medic

        let request = this.axios({
          method: 'POST',
          url: `${this.$store.state.Main.apiLink}/medics`,
          data: params
        })
          .then(response => {
            this.reloadTable()
            this.$Message.success('Успешно добавлено!')
          })

        this.$makeRequest(this, request)
      },
      update() {
        let params = this.medic

        let request = this.axios({
          method: 'PATCH',
          url: `${this.$store.state.Main.apiLink}/medics`,
          data: params
        })
          .then(response => {
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
              width: 300,
              sortable: true,
            },
            {
              title: 'Менеджер',
              key: 'manager',
              width: 150,
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
