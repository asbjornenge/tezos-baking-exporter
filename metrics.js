var Prometheus = require('prometheus-client')

var prom = new Prometheus()
var blocks_baked_total = prom.newCounter({
  namespace: 'tezos_baker',
  name: 'blocks_baked_total',
  help: '# Blocks baked'
})
var blocks_baked_cycle = prom.newGauge({
  namespace: 'tezos_baker',
  name: 'blocks_baked_cycle',
  help: '# Blocks baked cycle'
})
var blocks_missed_total = prom.newCounter({
  namespace: 'tezos_baker',
  name: 'blocks_missed_total',
  help: '# Blocks missed'
})
var blocks_stolen_total = prom.newCounter({
  namespace: 'tezos_baker',
  name: 'blocks_stolen_total',
  help: '# Blocks stolen'
})
var operation_endorsements = prom.newCounter({
  namespace: 'tezos_baker',
  name: 'operation_endorsements',
  help: '# Endorsements made'
})
var operation_endorsements_cycle = prom.newGauge({
  namespace: 'tezos_baker',
  name: 'operation_endorsements_cycle',
  help: '# Endorsements made current cycle'
})
var operation_endorsements_missed = prom.newCounter({
  namespace: 'tezos_baker',
  name: 'operation_endorsements_missed',
  help: '# Endorsements missed'
})
var operation_endorsements_stolen = prom.newCounter({
  namespace: 'tezos_baker',
  name: 'operation_endorsements_stolen',
  help: '# Endorsements stolen'
})
var balance_total = prom.newGauge({
  namespace: 'tezos_baker',
  name: 'balance_total',
  help: '# Total balance'
})
var balance_spendable = prom.newGauge({
  namespace: 'tezos_baker',
  name: 'balance_spendable',
  help: '# Spendable balance'
})
var balance_frozen = prom.newGauge({
  namespace: 'tezos_baker',
  name: 'balance_frozen',
  help: '# Frozen balance'
})
var balance_rewards = prom.newGauge({
  namespace: 'tezos_baker',
  name: 'balance_rewards',
  help: '# Pending rewards'
})

module.exports = {
  prom,
  blocks_baked_total,
  blocks_baked_cycle,
  blocks_missed_total,
  blocks_stolen_total,
  operation_endorsements,
  operation_endorsements_cycle,
  operation_endorsements_missed,
  operation_endorsements_stolen,
  balance_total,
  balance_spendable,
  balance_frozen,
  balance_rewards
}
