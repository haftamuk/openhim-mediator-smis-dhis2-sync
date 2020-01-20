const express = require('express')
const winston = require('winston')
const request = require('request')
const csv = require('csv-parser')
const fs = require('fs')

const mediatorConfig = require('../../config/mediator')
const utils = require('./../utils')

var router = express.Router()

var kpiVal = {}
var responseBody = {}

const OrgUnitMappingInfo = './mappingInfo/orgUnitMapping/orgUnit.csv'
const KPIMappingInfo = './mappingInfo/kpiMapping/kpi.csv'

/**
 * This function does nothing but for syncronization perposes
 */
router.use('/sync/:agregationFlag/:dx/:ou/:pe', function (req, res, next) {
  winston.info('See')
  fs.createReadStream(OrgUnitMappingInfo)
    .pipe(csv({ delimiter: ':' }))
    .on('data', (row) => {
      if (req.params.ou === row.SMISId) {
        console.log('########################## Org Unit ###########################')
        console.log('SMISId : ' + row.SMISId)
        console.log('DHIS2Id : ' + row.DHIS2Id)
        console.log('#####################################################')
        responseBody.OrgUnitMappingInfoData = row.DHIS2Id
        next()
      }
    })
    .on('error', function (err) {
      console.log(err.message)
      //      onComplete(err, null)
    })
    .on('end', () => {
      console.log('CSV file successfully processed')
    })
})
/**
 * This function does nothing but for syncronization perposes
 */
router.use('/sync/:agregationFlag/:dx/:ou/:pe', function (req, res, next) {
  winston.info('See')
  fs.createReadStream(KPIMappingInfo)
    .pipe(csv({ delimiter: ':' }))
    .on('data', (row) => {
      if (req.params.dx === row.SMISId) {
        responseBody.KPIMappingInfoData = row.DHIS2Id
        console.log('########################## KPI ###########################')
        console.log('SMISId : ' + row.SMISId)
        console.log('DHIS2Id : ' + row.DHIS2Id)
        console.log('#####################################################')
        next()
      }
    })
    .on('error', function (err) {
      console.log(err.message)
    })
    .on('end', () => {
      console.log('CSV file successfully processed')
    })
})

/**
 * Collect KPI value from DHIS2 this middleware is used to create syncronized
 * execution of callbacks
 */
router.use('/sync/:agregationFlag/:dx/:ou/:pe', async function (req, res, next) {
  winston.info('See')

  // extracted parameter from openhim request
  const dx = responseBody.KPIMappingInfoData
  const ou = responseBody.OrgUnitMappingInfoData
  const pe = req.params.pe
  const api = `https://play.dhis2.org/2.30/api/analytics?dimension=dx:${dx}&dimension=pe:${pe}&dimension=ou:${ou}`
  winston.info(api)

  /***
   * TODO - Validation of parameters and redirects to error page shoild be considered
   */
  const options = {
    url: api,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'User-Agent': 'Request',
      'X-platform': 'Node'
    },
    auth: {
      username: mediatorConfig.config.dhis2.username,
      password: mediatorConfig.config.dhis2.password
    }
  }
  await request(options, (err, res, body) => {
    if (err) {
      winston.info(err.toString())
    }
    kpiVal = JSON.parse(body)
    winston.info('USE: DHIS2 RESULT : ' + JSON.stringify(kpiVal))
    next()
  })
})

router.get('/sync/:agregationFlag/:dx/:ou/:pe', function (req, res) {
// Route to sync KPI info from SMIS, User trigered sync

  /***
   * TODO -
   * @type kpiVal|body
   * DHIS2 response body should be parsed and single value should be calculated
   */
  const agregationFlag = req.params.agregationFlag
  var rows = kpiVal.rows
  var sum = 0
  var i = 0
  var j = 0
  if (agregationFlag === 'SUM') {
    for (i = 0; i < rows.length; i++) {
      var rowSum = rows[i]
      for (j = 0; j < rowSum.length; j++) {
        var valueToAdd = rowSum[j]
        if (j === 3) { sum += parseFloat(valueToAdd) }
      }
    }
    responseBody.kpiValue = sum
  } else if (agregationFlag === 'AVERAGE') {
    for (i = 0; i < rows.length; i++) {
      var rowAverage = rows[i]
      for (j = 0; j < rowAverage.length; j++) {
        var valueAverage = rowAverage[j]
        if (j === 3) { sum += parseFloat(valueAverage) }
      }
    }
    responseBody.kpiValue = sum / rows.length
  } else if (agregationFlag === 'LAST') {
    var rowLast = rows[rows.length - 1]
    var valueLast = rowLast[3]
    responseBody.kpiValue = valueLast
  } else if (agregationFlag === 'FIRST') {
    var rowFirst = rows[0]
    var valueFirst = rowFirst[3]
    responseBody.kpiValue = valueFirst
  } else {
    responseBody = { error: 'NEED AGREGATION FLAG' }
  }

  var headers = { 'content-type': 'application/json' }

  // capture orchestration data
  var orchestrationResponse = { statusCode: 200, headers: headers }
  const orchestrations = []

  orchestrations.push(utils.buildOrchestration('Primary Route', new Date().getTime(), req.method, req.url, req.headers, req.body, orchestrationResponse, JSON.stringify(responseBody)))

  // set content type header so that OpenHIM knows how to handle the response
  res.set('Content-Type', 'application/json+openhim')

  // construct return object
  var properties = { property: 'DHIS2 KPI Value' }
  res.json(utils.buildReturnObject(mediatorConfig.urn, 'Successful', 200, headers, JSON.stringify(responseBody), orchestrations, properties))
})

module.exports = router
