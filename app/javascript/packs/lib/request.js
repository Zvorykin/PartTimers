export default async (app, cb, showLoading = true) => {
  app.$Loading.start()
  if ((app.loading === false) && (showLoading)) app.loading = true

  try {
    await cb()

    app.$Loading.finish()
  } catch (err) {
    console.error(err)

    app.$Loading.error()

    const {statusText: error, status: code, body: message, data} = err.response || {}

    console.dir(err)

    app.$Modal.error({
      title: `Ошибка ${code || ''}: ${error || ''}`,
      content: `${data} \n
       ${err.exception || ''} ${message || ''} ${err.stack || err.message}`.trim(),
    })
  }

  if (app.loading) app.loading = false
}
