var getCurrentGaugeValue = (gauge, labels) => {
  return gauge._getValue(labels)
}

var setupLabels = (args) => {
  var labels = {
    baker: args.baker
  }
  if (args.label) {
    if (typeof args.label === 'string') args.label = [args.label]
    let argLabels = {}
    args.label.forEach(l => {
      let _l = l.split('=')
      argLabels[_l[0]] = _l[1]   
    }) 
    labels = Object.assign(labels, argLabels)
  }
  return labels
}

module.exports = {
  getCurrentGaugeValue,
  setupLabels
}
