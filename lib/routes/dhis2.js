const express = require('express')
const winston = require('winston')

var router = express.Router()

router.get('/kpi/list', function (req, res) {
  winston.info('Route to get all list of KPIs from DHIS2')
})

router.get('/kpi/:id', function (req, res) {
  winston.info('Route to get asingle KPIs from DHIS2')
})

module.exports = router
