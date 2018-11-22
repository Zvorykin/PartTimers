<template lang="pug">
  div(id="app")
    Tabs(v-model="selTab", size='small')
      TabPane(label="Логин", name='login', icon="log-in", v-if="!loggedIn")
        login(v-on:loginUser="login('user')", v-on:loginMaster="login('master')")
      TabPane(label="Направления", name="tickets", icon="edit", )
        tickets-list(v-if="loggedIn")
      TabPane(label="Отчет по направлениям", name="ticketsReport", icon="ios-list-outline", )
        tickets-report(v-if="masterLogin")
      TabPane(label="Отчет по выплатам", name="paymentsReport", icon="ios-list", )
        PaymentsReport(v-if="masterLogin")
      TabPane(label="Администрирование", name="admin", icon="settings",)
        Admin(v-if="masterLogin")
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
    data() {
      return {
        loggedIn: false,
        masterLogin: false,
        selTab: 'login',
      }
    },
    methods: {
      login(userType) {
        this.$store.commit('UPDATE_APILINK', `${location.origin}/api`)

        this.loggedIn = true
        this.selTab = 'tickets'

        if (userType === 'master') {
          this.masterLogin = true
          this.$store.commit('UPDATE_MASTERLOGIN')
        }
      },
    },
    created() {
      this.$Loading.config({
        height: 5,
      })

      this.$store.commit('UPDATE_APILINK', `${location.origin}/api`)
    },
    mounted() {
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
