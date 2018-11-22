<template lang="pug">
  Card(:dis-hover="true", id="card")
    Form(:labelWidth="70", inline)
      FormItem(label='Время с')
        Date-picker(v-model="dateFrom", format="dd.MM.yyyy", placement='bottom-start', type="date", size="small",
        :clearable="false")
      FormItem(label='по', :labelWidth="20")
        Date-picker(v-model="dateBy", format="dd.MM.yyyy", placement='bottom-start', type="date", size="small",
        :clearable="false")
      FormItem(:labelWidth="5")
        Button(type='primary', size="small", @click="showReport") Сформировать
      FormItem(:labelWidth="5")
        Button(type='success', size="small", icon='ios-download', :disabled='saveDisabled', @click="saveReport") Открыть как электронную таблицу
    Table(border, size='small', :columns="table.columns", :data="table.data", height="550", width="1280", :loading="loading")
      span(slot="footer") Итого: {{total}}
</template>

<script>
  export default {
    components: {},
    data() {
      return {
        dateFrom: this.$moment().startOf('month'),
//        dateFrom: this.$moment('2017-09-01'),  // для разработки
        dateBy: this.$moment().startOf('month').add(1, 'months'),
        table: this.$getConst('EMPTY_TABLE'),
        loading: false
      }
    },
    computed: {
      total() {
        let total = 0
        if (this.table.data.length > 0) {
          this.table.data.forEach(row => {
            total += row.summary
          })
        }
        return total
      },
      saveDisabled() {
        return (this.table.data.length === 0)
      }
    },
    watch: {
      dateFrom() {
        if (this.$moment(this.dateFrom).isAfter(this.$moment(this.dateBy))) this.dateBy = this.dateFrom
      }
    },
    methods: {
      showReport() {
        let dateFrom = this.$moment(this.dateFrom).format(),
          dateBy = this.$moment(this.dateBy).format(),
          params = {
            dateFrom: dateFrom,
            dateBy: dateBy
          }

        this.table = this.$getConst('EMPTY_TABLE')

        let request = this.axios({
          method: 'GET',
          url: `${this.$store.state.Main.apiLink}/tickets/report`,
          params: params
        })
          .then(response => {
            this.table = response.data.table
          })

        this.$makeRequest(this, request)
      },
      saveReport() {
        let dateFrom = this.$moment(this.dateFrom).format(),
          dateBy = this.$moment(this.dateBy).format(),
          data = {
            dateFrom: dateFrom,
            dateBy: dateBy,
            columns: this.table.columns,
            rows: this.table.data,
          }

        let request = this.axios({
          method: 'POST',
          url: `${this.$store.state.Main.apiLink}/tickets/report`,
          data: data
        })
          .then(response => {
            this.$Message.success('Успешно сохранено!')
          })

        this.$makeRequest(this, request)
      }
    },
    created() {
//      this.showReport()
    }
  }
</script>

<style scoped>
  #card {
    min-width: 1100px;
  }
</style>
