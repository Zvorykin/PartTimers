<template lang="pug">
  Card(:dis-hover="true", id="card")
    Form(:labelWidth="60", inline)
      FormItem(label='Время с')
        Date-picker(v-model="dateFrom", :format="datePickerFormat", placement='bottom-start', type="date", size="small",
          :clearable="false", @on-change="setReportTypeNull")
      FormItem(label='по', :labelWidth="20")
        Date-picker(v-model="dateBy", :format="datePickerFormat", placement='bottom-start', type="date", size="small",
          :clearable="false", @on-change="setReportTypeNull")
      FormItem(label='Менеджер', :labelWidth="70")
        Select(v-model="managerId", size="small", style="width:150px" label-in-value @on-change="showReport")
          Option(v-for="item in managers", :value="item.id", :key="item.name") {{item.name}}
      FormItem(label='Тип отчета', :labelWidth="70")
        RadioGroup(v-model="reportType", :disabled='showDisabled', @on-change="showReport")
          Radio(label="medics") Врачи
          Radio(label="managers") Менеджеры
          Radio(label="clinic") Врачи поликлиники
      FormItem(:labelWidth="5")
        Button(type='success', size="small", icon='ios-download', :disabled='saveDisabled', @click="saveReport") Открыть как электронную таблицу
    Table(border, size='small', :columns="table.columns", :data="table.data", height="550", width="1280", disabled-hover,
      :loading="loading")
      span(slot="footer") Итого: {{total}}
</template>

<script>
  export default {
    components: {},
    data() {
      return {
        datePickerFormat: this.$FORMATS.shortLocalDate,
        dateFrom: this.$moment().startOf('month').toDate(),
        dateBy: this.$moment().startOf('month').add(1, 'months').toDate(),
        reportType: '',
        managerId: undefined,
        table: this.$getConst('EMPTY_TABLE'),
        loading: false,
        managers: [],
      }
    },
    computed: {
      total() {
        return 0
      },
      saveDisabled() {
        return !this.table.data || !this.table.data.length || !this.reportType
      },
      showDisabled() {
        return !this.reportType
      },
    },
    watch: {
      dateFrom() {
        if (this.$moment(this.dateFrom).isAfter(this.$moment(this.dateBy))) this.dateBy = this.dateFrom
      },
    },
    methods: {
      async refresh() {
        const cb = async () => {
          const res = await this.axios({
            method: 'GET',
            url: `managers`,
            params: {
              include_medic: false,
            },
          })

          this.managers = [{ id: 0, name: 'Все' }, ...res.data]
          this.managerId = 0
        }

        await this.$makeRequest(this, cb)
      },
      setReportTypeNull() {
        this.reportType = null
      },
      showReport() {
        if (!this.reportType) return false

        this.table.data = []

        const cb = async () => {
          const res = await this.axios({
            method: 'GET',
            url: 'reports/payments',
            params: {
              date_from: this.$moment(this.dateFrom).format(),
              date_by: this.$moment(this.dateBy).format(),
              report_type: this.reportType,
              manager_id: this.managerId
            },
          })

          // let managerColumnNo = this._.find(this.table.columns, { key: 'manager' })

          // if ((this.reportType === 'medics') && (!managerColumnNo)) {
          //   this.table.columns.splice(1, 0, {
          //     title: 'Менеджер',
          //     key: 'manager',
          //     width: 120,
          //     sortable: true,
          //   })
          // } else if ((this.reportType === 'managers') && (managerColumnNo)) {
          //   this.table.columns.splice(1, 1)
          // }

          this.table.data = res.data.rows

          // response.data.table.data.forEach(item => {
            // item.createdAt = this.$moment(item.createdAt).format('Y-MM-DD HH:mm:ss')
            // this.table.data.push(item)
          // })
        }

        this.$makeRequest(this, cb)
      },
      saveReport() {
        //   let data = {
        //     dateFrom: this.$moment(this.dateFrom).format(),
        //     dateBy: this.$moment(this.dateBy).format(),
        //     columns: this.table.columns,
        //     rows: this.table.data,
        //     reportType: this.reportType,
        //     total: this.total
        //   }
        //
        //   let request = this.axios({
        //     method: 'POST',
        //     url: `${this.$store.state.Main.apiLink}/payments/report`,
        //     data: data
        //   })
        //     .then(response => {
        //       this.$Message.success('Успешно сохранено!')
        //     })
        //
        //   this.$makeRequest(this, request)
        // }
      },
    },
    created() {
      if (process.env.NODE_ENV === 'development') {
        this.dateFrom = this.$moment('2019-02-01').toDate()
        this.reportType = 'medics'
      }

      const subcolumns = [
        {
          title: 'Услуга',
          key: 'name',
          width: 565,
        },
        {
          title: 'Кол-во',
          key: 'amount',
          width: 35,
        },
        {
          title: 'Выплата',
          key: 'payment',
          width: 55,
        },
        {
          title: 'Сумма',
          key: 'summary',
          width: 55,
        }
      ]

      this.table.columns = [
        {
          title: 'ФИО',
          key: 'name',
          width: 220,
          sortable: true,
        }, {
          title: 'Услуги',
          key: 'services',
          width: 800,
          render: (h, params) => {
            function rowClassName(row, index) {
              if (index === params.row.services.length - 1) return 'no-bottom-border'
              else return ''
            }

            return h('Table', {
              props: {
                columns: subcolumns,
                data: params.row.services,
                "show-header": false,
                "row-class-name": rowClassName,
              },
              "class": 'subtable',
            })
          },
        }, {
          title: 'Всего',
          key: 'summary',
          width: 100,
          sortable: true,
          align: 'center',
        },
        { className: 'invisible-column' },
      ]

      this.refresh()

//      this.showReport()
    },
  }
</script>

<style scoped>
  #card {
    min-width: 1100px;
  }
</style>
