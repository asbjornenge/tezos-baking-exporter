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
var fetch = require('node-fetch')
var {
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
} = require('./metrics')
var {
  setupLabels,
  getCurrentGaugeValue 
} = require('./utils')

// Validate args

if (!args.baker) throw new Error('Missing baker arg')

// Variables

var baseUri = `${args['node-proto']}://${args['node-host']}:${args['node-port']}`
var labels = setupLabels(args)

var last_block_processed = 0
var last_cycle_processed = 0
var query = async () => {

  // Head block

  let head = await fetch(`${baseUri}/chains/main/blocks/head`)
    .then(res => res.json())
    .catch(e => { console.error(e.message) })
  let head_block = head.header.level
  if (head_block === last_block_processed)
    return
  let cycle = head.metadata.level.cycle
  let resetCycle = false
  if (cycle > last_cycle_processed) {
    last_cycle_processed = cycle
    resetCycle = true
  }
  console.log(`Processing block ${head_block} for cycle ${cycle}`)
  last_block_processed = head_block

  // Bakes 

  let baker = head.metadata.baker
  if (baker === args.baker) {
    blocks_baked_total.increment(labels)
    let cycle_value = resetCycle ? 0 : getCurrentGaugeValue(blocks_baked_cycle)
    blocks_baked_cycle.set(labels, cycle_value+1)
  } 

  let bakingRights = await fetch(`${baseUri}/chains/main/blocks/${head_block}/helpers/baking_rights?delegate=${args.baker}&level=${head_block}&all`)
    .then(res => res.json())
    .catch(err => console.error(err.message))

  let shouldHaveBaked = 0
  bakingRights.forEach(br => {
    if (br.priority === 0)
      shouldHaveBaked++
  })
  if (shouldHaveBaked > 0 && baker !== args.baker)
    blocks_missed_total.increment(labels)
  if (shouldHaveBaked === 0 && baker === args.baker)
    blocks_stolen_total.increment(labels)

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
  if (endorsements) {
    operation_endorsements.increment(labels, endorsements)
    let cycle_value = resetCycle ? 0 : getCurrentGaugeValue(operation_endorsements_cycle) 
    operation_endorsements_cycle.set(labels, cycle_value+1)
  }

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
