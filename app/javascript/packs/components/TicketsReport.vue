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
        // dateFrom: this.$moment().startOf('month').toDate(),
        dateFrom: this.$moment('2019-02-01').toDate(),  // для разработки
        dateBy: this.$moment().startOf('month').add(1, 'months').toDate(),
        table: this.$getConst('EMPTY_TABLE'),
        loading: false,
      }
    },
    computed: {
      total() {
        return this.table.data.reduce((acc, row) => {
          acc += row.summary || 0
          return acc
        }, 0)
      },
      saveDisabled() {
        return (this.table.data.length === 0)
      },
    },
    watch: {
      dateFrom() {
        if (this.$moment(this.dateFrom).isAfter(this.$moment(this.dateBy))) this.dateBy = this.dateFrom
      },
    },
    methods: {
      getFormattedDates() {
        return {
          dateFrom: this.$moment(this.dateFrom).format(),
          dateBy: this.$moment(this.dateBy).format(),
        }
      },
      async showReport() {
        const { dateFrom, dateBy } = this.getFormattedDates()

        const cb = async () => this.axios({
          method: 'GET',
          url: `reports/tickets`,
          params: {
            date_from: dateFrom,
            date_by: dateBy,
          },
        })

        this.table = this.$getConst('EMPTY_TABLE')
        let { data, columns } = await this.$makeRequest(this, cb)

        if (data && data.length && columns && columns.length) {
          this.table.data = data

          columns = columns.map(value => ({
            key: value,
            title: value,
            width: 80,
            align: 'center',
          }))

          columns.unshift({
            title: 'Врач',
            key: 'name',
            width: 250,
            sortable: true,
            fixed: 'left',
          })

          columns.push({
            title: 'Всего',
            key: 'summary',
            width: 80,
            align: 'center',
            sortable: true,
            fixed: 'right',
          })

          this.table.columns = columns
        }
      },
      async saveReport() {
        const { dateFrom, dateBy } = this.getFormattedDates()

        const cb = async () => {
          await this.axios({
            method: 'POST',
            url: `reports/tickets`,
            data: {
              date_from: dateFrom,
              date_by: dateBy,
              columns: this.table.columns,
              rows: this.table.data,
            },
          })
          this.$Message.success('Успешно сохранено!')
        }

        await this.$makeRequest(this, cb)
      },
    },
    created() {
//      this.showReport()
    },
  }
</script>

<style scoped>
  #card {
    min-width: 1100px;
  }
</style>
