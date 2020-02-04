const express = require('express')
const winston = require('winston')
const csv = require('csv-parser')
const fs = require('fs')
var request = require('requestretry')

const mediatorConfig = require('../../config/mediator')
const utils = require('./../utils')
const helper = require('./../helper/helper')

var router = express.Router()

var kpiVal = {}
var responseBody = {}

const OrgUnitMappingInfo = './mappingInfo/orgUnitMapping/orgUnit.csv'
const KPIMappingInfo = './mappingInfo/kpiMapping/kpi.csv'

/**
 * This midleware does nothing but for syncronization perposes
 * Gets the organization Unit id of DHIS2 from the maappingFile
 */
router.use('/sync', function (req, res, next) {
  winston.info('See')
  fs.createReadStream(OrgUnitMappingInfo)
    .pipe(csv({ delimiter: ':' }))
    .on('data', (row) => {
      if (req.query.ou === row.SMISId) {
        responseBody.OrgUnitMappingInfoData = row.DHIS2Id
        next()
      }
    })
    .on('error', function (err) {
      winston.info(err.message)
      //      onComplete(err, null)
    })
    .on('end', () => {
      winston.info('CSV file successfully processed')
    })
})

/**
 * This midleware does nothing but for syncronization perposes
 * Gets the KPI id of DHIS2 from the maappingFile
 */
router.use('/sync', function (req, res, next) {
  winston.info('See')
  fs.createReadStream(KPIMappingInfo)
    .pipe(csv({ delimiter: ':' }))
    .on('data', (row) => {
      if (req.query.dx === row.SMISId) {
        responseBody.KPIMappingInfoData = row.DHIS2Id
        next()
      }
    })
    .on('error', function (err) {
      winston.info(err.message)
    })
    .on('end', () => {
      winston.info('CSV file successfully processed')
    })
})

/**
 * Collect KPI value from DHIS2 this middleware is used for synchronization perposes
 */
router.use('/sync', function (req, res, next) {
  // extracted parameter from openhim request
  const dx = responseBody.KPIMappingInfoData
  const ou = responseBody.OrgUnitMappingInfoData
  const pe = req.query.pe
  const api = `${mediatorConfig.config.dhis2.url}?dimension=dx:${dx}&dimension=pe:${pe}&dimension=ou:${ou}`
  winston.info('API URL: ' + api)

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
    },
    // The below parameters are specific to request-retry
    maxAttempts: 10, // (default) try 5 times
    retryDelay: 5000, // (default) wait for 5s before trying again
    retryStrategy: request.RetryStrategies.HTTPOrNetworkError // (default) retry on 5xx or network errors

  }
  request(options, (err, res, body) => {
    // this callback will only be called when the request succeeded or after maxAttempts or on err
    if (err) {
      winston.info('Problem communicating to DHIS2' + err.toString())
    } else {
      if (res) {
        console.log('The number of request attempts: ' + res.attempts)
      }

      kpiVal = JSON.parse(body)
      winston.info('USE: DHIS2 RESULT : ' + JSON.stringify(kpiVal))
      next()
    }
  })
})

router.get('/sync', function (req, res) {
// Route to sync KPI info from SMIS, User trigered sync

  /***
   * TODO -
   * @type kpiVal|body
   * DHIS2 response body should be parsed and single value should be calculated
   */
  var agregationFlag = req.query.agregationFlag
  var rows = kpiVal.rows
  var kpiValue = helper.getKpiValue(agregationFlag, rows)
  if (kpiValue !== false) {
    responseBody.kpiValue = kpiValue
  } else {
    responseBody.kpiValue = { error: 'NEED AGREGATION FLAG' }
  }

  var headers = { 'content-type': 'application/json' }

  // capture orchestration data
  var orchestrationResponse = { statusCode: 200, headers: headers }
  const orchestrations = []

  orchestrations.push(utils.buildOrchestration('Get DHIS2 KPI value ', new Date().getTime(), req.method, req.url, req.headers, req.body, orchestrationResponse, JSON.stringify(responseBody)))

  // set content type header so that OpenHIM knows how to handle the response
  res.set('Content-Type', 'application/json+openhim')

  // construct return object
  var properties = {
    npmVersion: '6.13.6',
    nodeVersion: '12.13.1',
    openhimMediatorSmisDhis2Sync: '1.0.0'

  }
  res.json(utils.buildReturnObject(mediatorConfig.urn, 'Successful', 200, headers, JSON.stringify(responseBody), orchestrations, properties))
})

module.exports = router
