const prom = require('prom-client')

const labelSet = ['baker', 'network', 'protocol']

// Baking metrics

var blocks_baked_total = new prom.Counter({
  name: 'tezos_baker_blocks_baked_total',
  help: '# Blocks baked',
  labelNames: labelSet 
})
var blocks_missed_total = new prom.Counter({
  name: 'tezos_baker_blocks_missed_total',
  help: '# Blocks missed',
  labelNames: labelSet 
})
var blocks_stolen_total = new prom.Counter({
  name: 'tezos_baker_blocks_stolen_total',
  help: '# Blocks stolen',
  labelNames: labelSet 
})
var blocks_baked_cycle = new prom.Gauge({
  name: 'tezos_baker_blocks_baked_cycle',
  help: '# Blocks baked cycle',
  labelNames: labelSet 
})
var blocks_missed_cycle = new prom.Gauge({
  name: 'tezos_baker_blocks_missed_cycle',
  help: '# Blocks missed cycle',
  labelNames: labelSet 
})
var blocks_stolen_cycle = new prom.Gauge({
  name: 'tezos_baker_blocks_stolen_cycle',
  help: '# Blocks missed cycle',
  labelNames: labelSet 
})

// Endorsement metrics

var operation_endorsements_total = new prom.Counter({
  name: 'tezos_baker_operation_endorsements_total',
  help: '# Endorsements made',
  labelNames: labelSet 
})
var operation_endorsements_missed_total = new prom.Counter({
  name: 'tezos_baker_operation_endorsements_missed_total',
  help: '# Endorsements missed',
  labelNames: labelSet 
})
var operation_endorsements_stolen_total = new prom.Counter({
  name: 'tezos_baker_operation_endorsements_stolen_total',
  help: '# Endorsements stolen',
  labelNames: labelSet 
})
var operation_endorsements_cycle = new prom.Gauge({
  name: 'tezos_baker_operation_endorsements_cycle',
  help: '# Endorsements made current cycle',
  labelNames: labelSet 
})
var operation_endorsements_missed_cycle = new prom.Gauge({
  name: 'tezos_baker_operation_endorsements_missed_cycle',
  help: '# Endorsements missed current cycle',
  labelNames: labelSet 
})
var operation_endorsements_stolen_cycle = new prom.Gauge({
  name: 'tezos_baker_operation_endorsements_stolen_cycle',
  help: '# Endorsements stolen current cycle',
  labelNames: labelSet 
})

// Balance metrics

var balance_total = new prom.Gauge({
  name: 'tezos_baker_balance_total',
  help: '# Total balance',
  labelNames: labelSet 
})
var balance_spendable = new prom.Gauge({
  name: 'tezos_baker_balance_spendable',
  help: '# Spendable balance',
  labelNames: labelSet 
})
var balance_frozen = new prom.Gauge({
  name: 'tezos_baker_balance_frozen',
  help: '# Frozen balance',
  labelNames: labelSet 
})
var balance_rewards = new prom.Gauge({
  name: 'tezos_baker_balance_rewards',
  help: '# Pending rewards',
  labelNames: labelSet 
})

// Head metrics

var head_block = new prom.Gauge({
  name: 'tezos_baker_head_block',
  help: '# Current block',
  labelNames: labelSet 
})
var head_cycle = new prom.Gauge({
  name: 'tezos_baker_head_cycle',
  help: '# Current cycle',
  labelNames: labelSet 
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
