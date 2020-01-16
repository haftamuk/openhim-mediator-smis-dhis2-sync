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
router.use('/sync/:dx/:ou/:pe', async function (req, res, next) {
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
    url: `https://play.dhis2.org/2.30/api/analytics?dimension=dx:${req.params.dx}&dimension=pe:${req.params.pe}&dimension=ou:${req.params.ou}`,
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
      console.log(err.toString())
    }
    kpiVal = body
    console.log("USE: DHIS2 RESULT : " + body)
    next()
  })

})



router.get('/sync/:dx/:ou/:pe', function (req, res) {
  winston.info('Route to sync KPI info from SMIS, User trigered sync.')

  /***
   * TODO - 
   * @type kpiVal|body
   * DHIS2 response body should be parsed and single value should be calculated
   */
  var responseBody = kpiVal

  var headers = {'content-type': 'application/json'}

  // add logic to alter the request here

  // capture orchestration data
  var orchestrationResponse = {statusCode: 200, headers: headers}
  let orchestrations = []

  orchestrations.push(utils.buildOrchestration('Primary Route', new Date().getTime(), req.method, req.url, req.headers, req.body, orchestrationResponse, responseBody))

  // set content type header so that OpenHIM knows how to handle the response
  res.set('Content-Type', 'application/json+openhim')

  // construct return object
  var properties = {property: 'Primary Route'}
  res.json(utils.buildReturnObject(mediatorConfig.urn, 'Successful', 200, headers, responseBody, orchestrations, properties))

//    res.send(utils.buildReturnObject(mediatorConfig.urn, 'Successful', 200, headers, responseBody, orchestrations, properties))
})

module.exports = router

