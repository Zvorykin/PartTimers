<template lang="pug">
  Card(:dis-hover="true")
    p(slot='title') Добавить направление
    Button(slot="extra", icon="refresh",  @click="refresh", type='text', shape="circle", class="refresh-card-button")
    Form(:labelWidth="50" inline)
      FormItem(label='Врач', :labelWidth="40")
        Select(v-model="talon.medicId", size="small", transfer, style="width:300px", filterable)
          Option(v-for="item in medics", :value="item.id", :key="item.name")  {{item.name}}
      FormItem(label='Дата талона', :labelWidth="80")
        Date-picker(v-model="talon.date", format="dd.MM.yyyy", placement='bottom-end', type="date", size="small",
          :clearable="false")
      FormItem(:labelWidth="5")
        Input(v-model.trim='talon.patientName', placeholder='ФИО пациента', size='small')
      FormItem(:labelWidth="5")
        Checkbox(v-model="saveAfterSubmit") сохранять поля
      FormItem(:labelWidth="10")
        Button(type='primary', size="small", icon="plus", @click.native="createTicket", :disabled="createDisabled") Создать направление
    Row(type="flex" justify="end")
      Form(inline)
        FormItem(label='Услуги', :labelWidth="40")
          Select(v-model="talon.services", size="small", transfer, style="width:1210px", multiple, filterable, label-in-value)
              Option(v-for="item in services", :value="item.id", :key="item.name") {{item.code}} - {{item.name}}
</template>

<script>
  let moment = require('moment')

  export default {
    components: {},
    data() {
      return {
        talon: {
          medicId: undefined,
          patientName: '',
          date: new Date,
          services: []
        },
        services: [],
        medics: [],
        saveAfterSubmit: false
      }
    },
    computed: {
      createDisabled() {
        let selServices = []

        this.talon.services.forEach(item => {
          let foundService = this._.find(this.services, {id: item})
          if (foundService) {
            selServices.push(foundService)
          }
        })

        let includesSurgery = this._.find(selServices, {surgery: 1}) !== undefined

        return (!this.talon.medicId || this.talon.services.length === 0) ||
          (this.talon.patientName.length === 0 && includesSurgery)
      }
    },
    watch: {},
    methods: {
      async refresh() {
        let medicsRequest = this.axios({
            method: 'GET',
            url: `${this.$store.state.Main.apiLink}/medics/user`
          }),
          servicesRequest = this.axios({
            method: 'GET',
            url: `${this.$store.state.Main.apiLink}/services/user`
          })

        let results = await Promise.all([medicsRequest, servicesRequest])

        this.medics = results[0].data
        this.services = results[1].data
      },
      createTicket() {
        let request = this.axios({
          method: 'POST',
          url: `${this.$store.state.Main.apiLink}/tickets`,
          data: this.talon
        })
          .then(response => {
            if (!this.saveAfterSubmit) {
              this.talon.medicId = undefined
              this.talon.patientName = ''
              this.talon.services = []
            }

            this.$Message.success('Направление успешно создано!');
            this.$emit('reloadTicketList')
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
