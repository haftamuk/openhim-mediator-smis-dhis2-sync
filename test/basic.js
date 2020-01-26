'use strict'
const tap = require('tap')
const mediatorMock = require('../lib/index')
const helper = require('../lib/helper/helper')

const openhimMock = require('./openhim-mock')

const rows = [
  ['ReUHfIn0pTQ', '2018', 'O6uvpzGd5pu', '35.7'],
  ['ReUHfIn0pTQ', '2018', 'Rp268JB6Ne4', '3.6']
]

tap.test('Test server start', (t) => {
  openhimMock.start(() => {
    mediatorMock.start((mediatorServer) => {
      t.ok(mediatorServer, 'Mediator service is running')

      // Always call as (found, wanted) by convention
      t.equal(helper.getKpiValue('SUM', rows), (35.7 + 3.6), 'SUM of KPI values with multiple row')
      t.equal(helper.getKpiValue('AVERAGE', rows), (35.7 + 3.6) / 2, 'AVERAGE of KPI values with multiple row')
      t.equal(helper.getKpiValue('LAST', rows), 3.6, 'LAST element of KPI values with multiple row')
      t.equal(helper.getKpiValue('FIRST', rows), 35.7, 'FIRST element of KPI values with multiple row')
      t.equal(helper.getKpiValue('NONE', rows), false, 'Unknown agregation flag.')

      mediatorServer.close(() => {
        openhimMock.stop(() => {
          t.end()
        })
      })
    })
  })
})
