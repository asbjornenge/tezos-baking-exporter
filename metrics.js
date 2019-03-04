var Prometheus = require('prometheus-client')

var prom = new Prometheus()

// Baking metrics

var blocks_baked_total = prom.newCounter({
  namespace: 'tezos_baker',
  name: 'blocks_baked_total',
  help: '# Blocks baked'
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
var blocks_baked_cycle = prom.newGauge({
  namespace: 'tezos_baker',
  name: 'blocks_baked_cycle',
  help: '# Blocks baked cycle'
})
var blocks_missed_cycle = prom.newGauge({
  namespace: 'tezos_baker',
  name: 'blocks_missed_cycle',
  help: '# Blocks missed cycle'
})
var blocks_stolen_cycle = prom.newGauge({
  namespace: 'tezos_baker',
  name: 'blocks_stolen_cycle',
  help: '# Blocks missed cycle'
})

// Endorsement metrics

var operation_endorsements_total = prom.newCounter({
  namespace: 'tezos_baker',
  name: 'operation_endorsements_total',
  help: '# Endorsements made'
})
var operation_endorsements_missed_total = prom.newCounter({
  namespace: 'tezos_baker',
  name: 'operation_endorsements_missed_total',
  help: '# Endorsements missed'
})
var operation_endorsements_stolen_total = prom.newCounter({
  namespace: 'tezos_baker',
  name: 'operation_endorsements_stolen_total',
  help: '# Endorsements stolen'
})
var operation_endorsements_cycle = prom.newGauge({
  namespace: 'tezos_baker',
  name: 'operation_endorsements_cycle',
  help: '# Endorsements made current cycle'
})
var operation_endorsements_missed_cycle = prom.newGauge({
  namespace: 'tezos_baker',
  name: 'operation_endorsements_missed_cycle',
  help: '# Endorsements missed current cycle'
})
var operation_endorsements_stolen_cycle = prom.newGauge({
  namespace: 'tezos_baker',
  name: 'operation_endorsements_stolen_cycle',
  help: '# Endorsements stolen current cycle'
})

// Balance metrics

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

// Head metrics

var head_block = prom.newGauge({
  namespace: 'tezos_baker',
  name: 'head_block',
  help: '# Current block'
})
var head_cycle = prom.newGauge({
  namespace: 'tezos_baker',
  name: 'head_cycle',
  help: '# Current cycle'
})

module.exports = {
  prom,
  blocks_baked_total,
  blocks_missed_total,
  blocks_stolen_total,
  blocks_baked_cycle,
  blocks_missed_cycle,
  blocks_stolen_cycle,
  operation_endorsements_total,
  operation_endorsements_missed_total,
  operation_endorsements_stolen_total,
  operation_endorsements_cycle,
  operation_endorsements_missed_cycle,
  operation_endorsements_stolen_cycle,
  balance_total,
  balance_spendable,
  balance_frozen,
  balance_rewards,
  head_block,
  head_cycle
}
