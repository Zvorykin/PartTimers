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
        const talonServices = this.talon.services.reduce((acc, item) => {
          const foundService = this.services.find(service => service.id === item)
          if (foundService) {
            acc.push(foundService)
          }

          return acc
        }, [])

        const includesSurgery = talonServices.some(value => value.surgery)

        return !this.talon.medicId || talonServices.length === 0 ||
          this.talon.patientName.length === 0 || includesSurgery
      }
    },
    watch: {},
    methods: {
      async refresh() {
        let medicsRequest = this.axios({
              method: 'GET',
              url: 'medics',
              params: {
                enabled: true,
              }
            }),
            servicesRequest = this.axios({
              method: 'GET',
              url: 'services',
              params: {
                enabled: true,
              }
            })

        let [medicsRes, servicesRes] = await Promise.all([medicsRequest, servicesRequest])

        this.medics = medicsRes.data
        this.services = servicesRes.data
      },
      async createTicket() {
        const cb = async () => {
          await this.axios({
            method: 'POST',
            url: `tickets`,
            data: {
              ticket: {
                date: this.talon.date,
                patient_name: this.talon.patientName,
                services: this.talon.services,
                medic_id: this.talon.medicId
              },
            }
          })

          if (!this.saveAfterSubmit) {
            this.talon.medicId = undefined
            this.talon.patientName = ''
            this.talon.services = []
          }

          this.$Message.success('Направление успешно создано!');
          this.$emit('reloadTicketList')
        }

        await this.$makeRequest(this, cb)
      }
    },
    created() {
      this.refresh()
    }
  }
</script>

<style scoped>

</style>
