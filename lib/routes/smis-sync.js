const express = require('express');
const winston = require('winston')
const https = require('https');
const mediatorConfig = require('../../config/mediator')
const utils = require('./../utils')

var router = express.Router();

router.get('/sync/:dx/:ou/:pe', function (req, res) {

  winston.info('Route to sync KPI info from SMIS, User trigered sync.')

  winston.info(`extracted parameter from openhim request`)
  winston.info(`${req.params.dx}`)
  winston.info(`${req.params.ou}`)
  winston.info(`${req.params.pe}`)
  winston.info(`############################################################`)

  var responseBody = 'responseBody';
  var headers = {'content-type': 'application/json'}

  // add logic to alter the request here

  // capture orchestration data
  var orchestrationResponse = {statusCode: 200, headers: headers}
  let orchestrations = []
  winston.info(`responseBody 000000000`)

  orchestrations.push(utils.buildOrchestration('Primary Route', new Date().getTime(), req.method, req.url, req.headers, req.body, orchestrationResponse, responseBody))

  // set content type header so that OpenHIM knows how to handle the response
  res.set('Content-Type', 'application/json+openhim')

  // construct return object
  var properties = {property: 'Primary Route'}
  winston.info(`responseBody 9876 `)
  res.json(utils.buildReturnObject(mediatorConfig.urn, 'Successful', 200, headers, responseBody, orchestrations, properties))

//    res.send(utils.buildReturnObject(mediatorConfig.urn, 'Successful', 200, headers, responseBody, orchestrations, properties))
})

module.exports = router;

