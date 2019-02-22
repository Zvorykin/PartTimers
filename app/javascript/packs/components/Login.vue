<template lang="pug">
  div(class="login-container", v-on:submit.prevent="loginMaster")
    Card(class="login-card")
      p(slot='title') Логин
      Form
        Row(type="flex", justify="center")
          Col(span="12")
            FormItem
              Button(type='primary', :long="true", @click="login(false)") Войти с обычными правами доступа
          Col(span="10")
            FormItem(:label-width="5")
              Button(type='success', :long="true", @click="login(true)") Войти, используя мастер-пароль
          Col(span="2")
            FormItem(:label-width="5")
              Input(v-model='password', type="password", autofocus)
</template>

<script>
  export default {
    components: {},
    data() {
      return {
        password: "",
      }
    },
    computed: {},
    watch: {},
    methods: {
      async login(isAdmin = false) {
        const cb = async () => {
          const response = await this.axios({
            method: 'POST',
            url: 'login',
            data: {
              isAdmin,
              password: this.password,
            },
          })

          if (response.data.result) {
            this.$store.commit('LOGIN')
            if (isAdmin) {
              this.axios.defaults.headers.common['Master'] = true
              this.$store.commit('UPDATE_ADMIN')
            }
            this.$Message.success('Авторизация прошла успешно!')
          } else {
            this.$Message.error('Пароль набран неверно!')
          }
        }

        await this.$makeRequest(this, cb)
      },
    },
    mounted() {
      //this.loginMaster()
    },
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
