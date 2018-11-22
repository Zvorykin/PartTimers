<template lang="pug">
  div(class="login-container", v-on:submit.prevent="loginMaster")
    Card(class="login-card")
      p(slot='title') Логин
      Form
        Row(type="flex", justify="center")
          Col(span="12")
            FormItem
              Button(type='primary', :long="true", @click="loginUser") Войти с обычными правами доступа
          Col(span="10")
            FormItem(:label-width="5")
              Button(type='success', :long="true", @click="loginMaster") Войти, используя мастер-пароль
          Col(span="2")
            FormItem(:label-width="5")
              Input(v-model='password', type="password", autofocus)
</template>

<script>
  export default {
    components: {},
    data() {
      return {
        password: ""
      }
    },
    computed: {},
    watch: {},
    methods: {
      loginUser() {
        let request = this.axios({
          method: 'GET',
          url: `${this.$store.state.Main.apiLink}/login/user`
        })
          .then(response => {
            this.$Message.success('Авторизация прошла успешно!')
            this.$emit('loginUser')
          })

        this.$makeRequest(this, request)
      },
      loginMaster() {
        let request = this.axios({
          method: 'GET',
          url: `${this.$store.state.Main.apiLink}/login/master`,
          params: {password: this.password}
        })
          .then(response => {
            if (response.data === 'Wrong password') {
              this.$Message.error('Пароль набран неверно!')
            } else {
              this.$Message.success('Авторизация прошла успешно!')
              this.$emit('loginMaster')
            }
          })

        this.$makeRequest(this, request)
      },
    },
    mounted() {
      //this.loginMaster()
    }
  }
</script>

<style scoped>
  .login-container {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .login-card {
    width: 650px;
  }
</style>
