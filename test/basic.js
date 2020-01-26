'use strict'
const tap = require('tap')
const mediatorMock = require('../lib/index')
const helper = require('../lib/helper/helper')

const openhimMock = require('./openhim-mock')

const rows = [
  ['ReUHfIn0pTQ', '2018', 'O6uvpzGd5pu', '35.7'],
  ['ReUHfIn0pTQ', '2018', 'Rp268JB6Ne4', '3.6']
]
const mulformedrows = [
  ['ReUHfIn0pTQ', '2018', '35.7'],
  ['ReUHfIn0pTQ', '2018', '3.6']
]

tap.test('Test Helper Functions: Test cases for normal execution', (t) => {
  // Always call as (found, wanted) by convention
  t.equal(helper.getKpiValue('SUM', rows), (35.7 + 3.6), 'SUM of KPI values with multiple row')
  t.equal(helper.getKpiValue('AVERAGE', rows), (35.7 + 3.6) / 2, 'AVERAGE of KPI values with multiple row')
  t.equal(helper.getKpiValue('LAST', rows), 3.6, 'LAST element of KPI values with multiple row')
  t.equal(helper.getKpiValue('FIRST', rows), 35.7, 'FIRST element of KPI values with multiple row')
  t.equal(helper.getKpiValue('NONE', rows), false, 'Unknown agregation flag.')
  t.end()
})

tap.test('Test Helper Functions: Test cases for abnormal execution', (t) => {
  // Always call as (found, wanted) by convention
  t.equal(helper.getKpiValue('SUM', []), false, 'SUM of KPI values with empty row')
  t.equal(helper.getKpiValue('AVERAGE', []), false, 'AVERAGE of KPI values with empty row')
  t.equal(helper.getKpiValue('LAST', []), false, 'LAST element of KPI values with empty row')
  t.equal(helper.getKpiValue('FIRST', []), false, 'FIRST element of KPI values with empty row')
  t.equal(helper.getKpiValue('NONE', []), false, 'Unknown agregation flag.')
  t.end()
})

tap.test('Test Helper Functions: Test cases for mulformed json row records(Expected 4 elements)', (t) => {
  // Always call as (found, wanted) by convention
  t.equal(helper.getKpiValue('SUM', mulformedrows), false, 'Mulformed rows detected')
  t.equal(helper.getKpiValue('AVERAGE', mulformedrows), false, 'Mulformed rows detected')
  t.equal(helper.getKpiValue('LAST', mulformedrows), false, 'Mulformed rows detected')
  t.equal(helper.getKpiValue('FIRST', mulformedrows), false, 'Mulformed rows detected')
  t.equal(helper.getKpiValue('NONE', mulformedrows), false, 'Unknown agregation flag.')
  t.end()
})

tap.test('Test server start', (t) => {
  openhimMock.start(() => {
    mediatorMock.start((mediatorServer) => {
      t.ok(mediatorServer, 'Mediator service is running')
      mediatorServer.close(() => {
        openhimMock.stop(() => {
          t.end()
        })
      })
    })
  })
})
