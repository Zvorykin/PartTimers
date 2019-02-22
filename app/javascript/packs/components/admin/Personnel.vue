<template lang="pug">
  div(v-on:submit.prevent="")
    Medics(ref="medics")
    Managers(ref="managers", v-on:refreshMedicsForm="refreshMedicsForm")
</template>

<script>
  import Managers from './Managers.vue'
  import Medics from './Medics.vue'

  export default {
    components: {Managers, Medics},
    data() {
      return {}
    },
    computed: {
    },
    watch: {},
    methods: {
      refreshMedicsForm() {
        this.$refs.medics.refresh()
      }
    },
  }
</script>

<style scoped>
  #card {
    /*min-width: 700px;*/
  }
</style>
