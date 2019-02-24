<template lang="pug">
  Tabs(v-model="selTab", size='small', type="card", id="tabs-admin")
    TabPane(label="Персонал", name='personnel', icon="person")
      personnel
    TabPane(label="Услуги", name='services', icon="ios-pricetag")
      services
    <!--TabPane(label="Настройки", name='settings', icon="android-settings")-->
      <!--settings-->
</template>

<script>
  import Personnel from './admin/Personnel.vue'
  import Services from './admin/Services.vue'
  import Settings from './admin/Settings.vue'

  export default {
    components: {Personnel, Services, Settings},
    data() {
      return {
        selTab: 'personnel'
      }
    },
    computed: {},
    watch: {},
    methods: {}
  }
</script>

<style scoped>

</style>