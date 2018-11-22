module.exports = function makeRequest(app, promise, showLoading = true) {
  app.$Loading.start()
  if ((app.loading === false) && (showLoading)) app.loading = true

  promise
    .then(() => {
      app.$Loading.finish()
      if (app.loading) app.loading = false
      // console.log(app)
    })
    .catch(err => {
      if (app.loading) app.loading = false
      let modalError

      console.error(err)

      if (err.response === undefined) {
        modalError = {
          code: "",
          error: "",
          message: err.message
        }
      } else {
        console.log(err.response.data)

        modalError = {
          code: err.response.data.statusCode,
          error: err.response.data.error,
          message: err.response.data.message
        }
      }

      app.$Loading.error()

      app.$Modal.error({
        title: `Ошибка ${modalError.code}: ${modalError.error} `,
        content: modalError.message
      })
    })
}
