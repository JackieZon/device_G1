import Vue from 'vue'

Vue.filter('s_toStr', function (val) {
  if (!val) { return '暂无' }
  return String(val)
})

Vue.filter('s_isFun', function (val) {
  if (!val) {
    const isFun = function () {
      console.log('这个方法没定义!')
    }
    return isFun
  }
  return val
})

Vue.filter('s_toNum', function (val) {
  if (typeof (val) === 'number') {
    return val
  } else {
    return Number(val)
  }
})

Vue.filter('s_toQty', function (val) {
  if (!val) { return '' }
  return val.toFixed(2)
})

Vue.filter('s_arrLength', function (val) {
  if (!val) { return 0 }
  if (JSON.stringify(val) === '[]') { return 0 }
  if (JSON.stringify(val) === '{}') { return 0 }
  return val.length
})

Vue.filter('s_dateStr', function (val) {
  if (!val) { return '暂无' }
  var vals = val
  val = val.split('T').join(' ')
  val = val.split('-').join('/')

  if (Date.parse(vals) <= Date.parse('2001/1/1')) {
    return ''
  }

  return val
})

Vue.filter('s_toDate', function (val) {
  if (!val) { return '暂无' }
  val = val.split('T').join(' ')
  val = val.split('-').join('/')

  if (Date.parse(val) <= Date.parse('2001/1/1')) {
    return ''
  }

  return val.split('/').join('-')
})

Vue.filter('s_toDates', function (val) {
  if (!val) { return '暂无' }
  if (val.indexOf(' ') > 0) {
    return val.split(' ')[0]
  }
  val = val.split('T')
  if (Date.parse(val.join(' ')) <= Date.parse('2001/1/1')) {
    return '暂无'
  }

  return val[0]
})
