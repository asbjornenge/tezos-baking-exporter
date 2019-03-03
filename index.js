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
var operation_endorsements = prom.newCounter({
  namespace: 'tezos_baker',
  name: 'operation_endorsements',
  help: '# Endorsements made'
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
  console.log(`Processing block ${head_block}`)
  last_block_processed = head_block

  // Bakes 

  let baker = head.metadata.baker
  if (baker === args.baker) blocks_baked.increment(labels) 

  let bakingRights = await fetch(`${baseUri}/chains/main/blocks/${head_block}/helpers/baking_rights?delegate=${args.baker}&level=${head_block}&all`)
    .then(res => res.json())
    .catch(err => console.error(err.message))

  let shouldHaveBaked = 0
  bakingRights.forEach(br => {
    if (br.priority === 0)
      shouldHaveBaked++
  })
  if (shouldHaveBaked > 0 && baker !== args.baker)
    blocks_missed.increment(labels)
  if (shouldHaveBaked === 0 && baker === args.baker)
    blocks_stolen.increment(labels)

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
  if (endorsements) operation_endorsements.increment(labels, endorsements) 

  let endorsingRights = await fetch(`${baseUri}/chains/main/blocks/${head_block}/helpers/endorsing_rights?delegate=${args.baker}&level=${head_block}`)
    .then(res => res.json())
    .catch(err => console.error(err.message))

  let shouldHaveEndorsed = 0
  endorsingRights.forEach(er => {
    if (er.slots.indexOf(0) >= 0)
      shouldHaveEndorsed++
  })
  if (shouldHaveEndorsed > endorsements)
    operation_endorsements_missed.increment(labels)
  if (shouldHaveEndorsed < endorsements) 
    operation_endorsements_stolen.increment(labels)

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
