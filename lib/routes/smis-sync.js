const express = require('express')
const winston = require('winston')
const request = require('request')

const mediatorConfig = require('../../config/mediator')
const utils = require('./../utils')

var router = express.Router()

var kpiVal = {}
/**
 * Collect KPI value from DHIS2 this middleware is used to create syncronized 
 * execution of callbacks
 */
router.use('/sync/:agregationFlag/:dx/:ou/:pe', async function (req, res, next) {
  winston.info(`extracted parameter from openhim request`)
  winston.info(`USE: DX: ${req.params.dx}`)
  winston.info(`USE: OU: ${req.params.ou}`)
  winston.info(`USE: PE: ${req.params.pe}`)

  const dx = req.params.dx
  const ou = req.params.ou
  const pe = req.params.pe
  const api = `https://play.dhis2.org/2.30/api/analytics?dimension=dx:${dx}&dimension=pe:${pe}&dimension=ou:${ou}`

  winston.info(`############################################################`)
  winston.info(`API-URL : ` + api)
  winston.info(`############################################################`)
  /***
   * TODO - Validation of parameters and redirects to error page shoild be considered
   */
  const options = {
    url: api,
    method: `GET`,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'User-Agent': 'Request',
      'X-platform': 'Node'
    },
    auth: {
      username: mediatorConfig.config.dhis2.username,
      password: mediatorConfig.config.dhis2.password
    }
  };
  await request(options, (err, res, body) => {
    if (err) {
      winston.info(err.toString())
    }
    kpiVal = JSON.parse(body)
    winston.info("USE: DHIS2 RESULT : " + JSON.stringify(kpiVal))
    next()
  })

})



router.get('/sync/:agregationFlag/:dx/:ou/:pe', function (req, res) {
  winston.info('Route to sync KPI info from SMIS, User trigered sync.')

  /***
   * TODO - 
   * @type kpiVal|body
   * DHIS2 response body should be parsed and single value should be calculated
   */
  const agregationFlag = req.params.agregationFlag
  var responseBody = {}
  winston.info(`############################################################`)
  winston.info(`####################### DHIS2 Response Rows ###########################`)
  winston.info(`############################################################`)

  winston.info(JSON.stringify(kpiVal.rows))
  var rows = kpiVal.rows
  winston.info("value:" + JSON.stringify(rows));

  if (agregationFlag == 'SUM') {
    var sum = 0
    for (var i = 0; i < rows.length; i++)
    {
      var row = rows[i];
      winston.info("row value:" + JSON.stringify(row));
      for (var j = 0; j < row.length; j++) {
        var value = row[j];
        if (j == 3)
          sum += parseFloat(value);
        winston.info(`single value ${j} : ` + value);
      }
    }
    responseBody.kpiValue = sum
  } else if (agregationFlag == 'AVERAGE') {

    var sum = 0
    for (var i = 0; i < rows.length; i++)
    {
      var row = rows[i];
      winston.info("row value:" + JSON.stringify(row));
      for (var j = 0; j < row.length; j++) {
        var value = row[j];
        if (j == 3)
          sum += parseFloat(value);
        winston.info(`single value ${j} : ` + value);
      }
    }
    responseBody.kpiValue = sum / rows.length
  } else if (agregationFlag == 'LAST') {
    var row = rows[rows.length];
    winston.info("row value:" + JSON.stringify(row));
    var value = row[3];
    responseBody.kpiValue = value
  } else if (agregationFlag == 'FIRST') {
    var row = rows[0];
    winston.info("row value:" + JSON.stringify(row));
    var value = row[3];
    responseBody.kpiValue = value
  } else {
    responseBody = {error: 'NEED AGREGATION FLAG'}
  }

  winston.info(`KPI SUM VALUE IS : ${JSON.stringify(responseBody)}`)
  winston.info(`############################################################`)

  var headers = {'content-type': 'application/json'}

  // add logic to alter the request here

  // capture orchestration data
  var orchestrationResponse = {statusCode: 200, headers: headers}
  let orchestrations = []

  orchestrations.push(utils.buildOrchestration('Primary Route', new Date().getTime(), req.method, req.url, req.headers, req.body, orchestrationResponse, JSON.stringify(responseBody)))

  // set content type header so that OpenHIM knows how to handle the response
  res.set('Content-Type', 'application/json+openhim')

  // construct return object
  var properties = {property: 'Primary Route'}
  res.json(utils.buildReturnObject(mediatorConfig.urn, 'Successful', 200, headers, JSON.stringify(responseBody), orchestrations, properties))

//    res.send(utils.buildReturnObject(mediatorConfig.urn, 'Successful', 200, headers, responseBody, orchestrations, properties))
})

module.exports = router

