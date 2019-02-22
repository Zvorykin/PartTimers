import CONSTANTS from './constants'
// import objectLookup from './objectLookup'

let _ = require('lodash')

const getConst = {
  install(Vue, options) {
    Vue.prototype.$getConst = (path) => {
      let request = _.get(CONSTANTS, path),
          // objectLookup(CONSTANTS, path),
        result = {}

        // console.log(_.get(CONSTANTS, path))

      if (_.isObject(request) && !Array.isArray(request)) {
        Object
          .keys(request)
          .forEach(key => {
            result[key] = request[key]
          })
      } else {
        result = request
      }

      return result
    }
  }
}

export default getConst