const express = require('express')
const winston = require('winston')
const mediatorConfig = require('../../config/mediator')
const utils = require('./../utils')

var router = express.Router();

router.get('/smis/kpi/list', function (req, res) {
    winston.info('Route to get all list of KPIs from SMIS')
})

router.get('/smis/kpi/:id', function (req, res) {
    winston.info('Route to get a single KPI from SMIS')
})

module.exports = router;

