'use strict'

var express = require('express');
var carreraController = require('../controllers/carrera');

var api = express.Router();

api.post('/newCarrera', carreraController.newCarrera);
api.get('/getCarreras', carreraController.getCarreras);
api.get('/getCarrera/:id', carreraController.getCarrera);
api.post('/updateCarrera/:id', carreraController.updateCarrera);
api.post('/deletecarrera/:id', carreraController.deleteCarrera);

module.exports = api;