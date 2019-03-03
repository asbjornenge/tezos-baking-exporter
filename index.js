#!/usr/bin/env node
var args = require('minimist')(process.argv.slice(2), {
  default: {
    host         : process.env['HOST'] || 'localhost',
    port         : process.env['PORT'] || 9090,
    'node-proto' : process.env['NODE_PROTO'] || 'http',
    'node-host'  : process.env['NODE_HOST'] || 'localhost',
    'node-port'  : process.env['NODE_PORT'] || 8732,
    baker        : process.env['BAKER'],
    interval     : process.env['QUERY_INTERVAL'] || 30000
  }
})
var Prometheus = require('prometheus-client')
var fetch = require('node-fetch')
var baseUri = `${args['node-proto']}://${args['node-host']}:${args['node-port']}`

// Validate args

if (!args.baker) throw new Error('Missing baker arg')

var prom = new Prometheus()
var blocks_baked = prom.newCounter({
  namespace: 'tezos_baker',
  name: 'blocks_baked',
  help: '# Blocks baked'
})
var blocks_missed = prom.newCounter({
  namespace: 'tezos_baker',
  name: 'blocks_missed',
  help: '# Blocks missed'
})
var blocks_stolen = prom.newCounter({
  namespace: 'tezos_baker',
  name: 'blocks_stolen',
  help: '# Blocks stolen'
})
var operation_endorsement_success = prom.newCounter({
  namespace: 'tezos_baker',
  name: 'operation_endorsement_success',
  help: '# Endorsements made'
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

// endorsements, accusations?, balances, rewards

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

var last_block_processed = 0
var query = async () => {
  let head = await fetch(`${baseUri}/chains/main/blocks/head`)
    .then(res => res.json())
    .catch(e => { console.error(e.message) })
  let head_block = head.header.level
  if (head_block === last_block_processed)
    return
  last_block_processed = head_block

  // Blocks

  let baker = head.metadata.baker
  if (baker === args.baker) blocks_baked.increment(labels) 

  // Endorsements

  let endorsements = 0
  head.operations.forEach(oplist => {
    oplist.forEach(op => {
      op.contents.forEach(c => {
        if (c.kind === 'endorsement' && c.metadata.delegate === args.baker)
          endorsements++
      })
    })
  })
  if (endorsements) operation_endorsement_success.increment(labels, endorsements) 

  // Balance

  let cbal = await fetch(`${baseUri}/chains/main/blocks/${head_block}/context/contracts/${args.baker}/balance`)
    .then(res => res.text())
    .then(txt => parseInt(txt.replace(/"/g,'')))
    .catch(e => { console.error(e.message) })
  let dbal = await fetch(`${baseUri}/chains/main/blocks/${head_block}/context/delegates/${args.baker}/balance`)
    .then(res => res.text())
    .then(txt => parseInt(txt.replace(/"/g,'')))
    .catch(e => { console.error(e.message) })
  let fbal = await fetch(`${baseUri}/chains/main/blocks/${head_block}/context/delegates/${args.baker}/frozen_balance`)
    .then(res => res.text())
    .then(txt => parseInt(txt.replace(/"/g,'')))
    .catch(e => { console.error(e.message) })
  let sbal = await fetch(`${baseUri}/chains/main/blocks/${head_block}/context/delegates/${args.baker}/staking_balance`)
    .then(res => res.text())
    .then(txt => parseInt(txt.replace(/"/g,'')))
    .catch(e => { console.error(e.message) })

  balance_total.set(labels, dbal)
  balance_spendable.set(labels, cbal)
  balance_frozen.set(labels, fbal)
  balance_rewards.set(labels, dbal-sbal)
}

setInterval(query, args.interval)
prom.listen(args.port)
console.log(`Exposing metrics on http://${args.host}:${args.port}/metrics`)
