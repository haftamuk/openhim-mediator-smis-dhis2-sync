const express = require('express')
const winston = require('winston')

var router = express.Router()

router.get('/smis/kpi/list', function (req, res) {
  winston.info('Route to get all list of KPIs from SMIS')
})

router.get('/smis/kpi/:id', function (req, res) {
  winston.info('Route to get a single KPI from SMIS')
})

module.exports = router
