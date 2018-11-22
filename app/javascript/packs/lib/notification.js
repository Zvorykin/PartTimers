module.exports = function showMessage(app, type, message, title) {
  app.$Message.config({
    // top: 50,
    duration: 3.5
  })

  switch (type) {
    case 'success':
      app.$Message.success({content: message})
      break
    case 'error-notification':
      app.$Message.error({content: message})
      break
  }
}
