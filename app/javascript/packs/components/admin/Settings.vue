<template lang="pug">
  Card(:dis-hover="true", id="card")
    p(slot='title') Настройки программы
    Button(slot="extra", icon="refresh",  @click="refresh", type='text', shape="circle", class="refresh-card-button")
    Form(:labelWidth="50", inline)
      FormItem(:labelWidth="1")
        Input(v-model="setting.key", size='small', placeholder="Ключ", style="width: 300px")
      FormItem(:labelWidth="1")
        Input(v-model="setting.value", size='small', placeholder="Значение", style="width: 370px")
      FormItem(:labelWidth="1")
        Button(type='primary', size="small", icon="plus-round", @click="add", shape="circle", :disabled="addDisabled")
      FormItem(:labelWidth="1")
        Button(type='success', size="small", icon="edit", @click="update", shape="circle", :disabled="editDisabled")
      FormItem(:labelWidth="1")
        Button(type='error', size="small", icon="minus-round", @click="deleteSetting", shape="circle", :disabled="editDisabled")
    Table(border, size='small', :columns="table.columns", :data="table.data", height="490", width="800",
    @on-row-click="selectRow",  highlight-row, :loading="loading")
      span(slot="footer") Всего: {{recCount}}
</template>

<script>
  export default {
    components: {},
    constants: {
      EMPTY_SETTINGS: {
        key: '',
        value: '',
      }
    },
    data() {
      return {
        setting: this.EMPTY_SETTINGS,
        table: this.$getConst('EMPTY_TABLE'),
        loading: false
      }
    },
    computed: {
      recCount() {
        return this.table.data.length
      },
      addDisabled() {
        return (this.setting.key.length === 0) || (this.setting.value.length === 0)
      },
      editDisabled() {
        return this._.find(this.table.data, {key: this.setting.key}) === undefined
      }
    },
    watch: {},
    methods: {
      refresh() {
        this.reloadTable()
      },
      reloadTable() {
        this.setting = this.EMPTY_SETTINGS
        this.table.data = []

        let request = this.axios({
          method: 'GET',
          url: `${this.$store.state.Main.apiLink}/settings`
        })
          .then(response => {
            this.table.data = response.data
          })

        this.$makeRequest(this, request)
      },
      selectRow(curRow) {
        this.setting = {
          key: curRow.key,
          value: curRow.value,
        }
      },
      add() {
        let params = this.setting

        let request = this.axios({
          method: 'POST',
          url: `${this.$store.state.Main.apiLink}/settings`,
          data: params
        })
          .then(response => {
            this.$Message.success('Успешно добавлено!')
            this.reloadTable()
          })

        this.$makeRequest(this, request)
      },
      update() {
        let params = this.setting

        let request = this.axios({
          method: 'PATCH',
          url: `${this.$store.state.Main.apiLink}/settings`,
          data: params
        })
          .then(response => {
            this.$Message.success('Обновление успешно выполнено!')
            this.reloadTable()
          })

        this.$makeRequest(this, request)
      },
      deleteSetting() {
        let params = this.setting

        let request = this.axios({
          method: 'DELETE',
          url: `${this.$store.state.Main.apiLink}/settings`,
          data: params
        })
          .then(response => {
            this.$Message.success('Удаление успешно выполнено!')
            this.reloadTable()
          })

        this.$makeRequest(this, request)
      },
    },
    created() {
      this.table.columns = [
        {
          title: 'Ключ',
          key: 'key',
          width: 300,
          sortable: true,
        },
        {
          title: 'Значение',
          key: 'value',
          width: 450,
          sortable: true,
        },
        {className: 'invisible-column'}]

      this.refresh()
    }
  }
</script>

<style scoped>

</style>
