<template lang="pug">
  div(id="app")
    Tabs(v-model="selTab", size='small')
      TabPane(label="Логин", name='login', icon="log-in", v-if="!loggedIn")
        login
      TabPane(label="Направления", name="tickets", icon="edit", v-if="loggedIn")
        tickets-list(v-if="loggedIn")
      TabPane(label="Отчет по направлениям", name="ticketsReport", icon="ios-list-outline", v-if="isAdmin")
        tickets-report(v-if="isAdmin")
      <!--TabPane(label="Отчет по выплатам", name="paymentsReport", icon="ios-list", v-if="isAdmin")-->
        <!--PaymentsReport(v-if="isAdmin")-->
      TabPane(label="Администрирование", name="admin", icon="settings", v-if="isAdmin")
        Admin(v-if="isAdmin")
</template>

<script>
  import Login from './packs/components/Login.vue'
  import TicketsList from './packs/components/TicketsList.vue'
  import TicketsReport from './packs/components/TicketsReport.vue'
  import PaymentsReport from './packs/components/PaymentsReport.vue'
  import Admin from './packs/components/Admin.vue'

  export default {
    name: 'part-timers',
    components: {
      Login,
      TicketsList,
      TicketsReport,
      PaymentsReport,
      Admin,
    },
    computed: {
      loggedIn() {
        return this.$store.state.Main.loggedIn
      },
      isAdmin() {
        return this.$store.state.Main.admin
      }
    },
    data() {
      return {
        admin: false,
        selTab: 'login',
      }
    },
    methods: {
    },
    async created() {
      this.$Loading.config({
        height: 5,
      })

      this.axios.defaults.baseURL = `${location.origin}/api`
      this.axios.defaults.headers.common['Content-Type'] = 'application/json';
      this.axios.defaults.headers.common['Accept'] = 'application/json';
    },
  }
</script>

<style>
  @import './packs/assets/layout.css';
  @import './packs/assets/card.css';
  @import './packs/assets/form.css';
  @import './packs/assets/table.css';

  #tabs-admin .ivu-tabs-nav {
    padding: 0 5px !important;
  }

  .ivu-tabs-tab-disabled {
    visibility: hidden;
  }

  .ivu-tabs-bar {
    height: 35px;
  }
</style>
