<template>
  <div id="app">
    <h1>{{ message }}</h1>
  </div>
</template>

<script>
  export default {
    data: function () {
      return {
        message: "Hello Vue11111111111",
      }
    },
  }
</script>

<style scoped>
  p {
    font-size: 2em;
    text-align: center;
  }

  #app {
    border: 2px firebrick dashed;
    height: 500px;
  }
</style>
