'use strict'

var mongoose = require('mongoose');

var Carrera = require('../model/carrera');
var Congreso = require('../model/congreso');
//encriptar contraseña

//Crear nueva Carrera
function newCarrera(req, res) {
    var params = req.body; //Toma todos los campos que llegan por req en body, y los pone en params
    var carrera = new Carrera();
    if (params.nombre && params.centro) {

        carrera.nombre = params.nombre;
        carrera.centro = params.centro;

        Carrera.find({}).sort({ $natural: -1 }).exec(function(err, doc) {
            if (err) {
                res.status(404).send({ message: 'No se ha registrado la carrera' });
            }
            carrera.idCarrera = 0;
            carrera.save((err, carreraStored) => {
                if (err) {
                    return res.status(500).send({ message: 'Error al insertar la carrera ' + err })
                }
                if (carreraStored) {
                    res.status(200).send({ carrera : carreraStored });
                } else {
                    res.status(404).send({ message: 'No se ha registrado la carrera' });
                }
            });
        });
    } else {
        res.status(200).send({
            message: "Hubo un problema al recibir los datos."
        });
    }
}

//Actualizar carrera
function updateCarrera(req,res){
    var carreraId = req.params.id;
    var update = req.body;

    Carrera.findByIdAndUpdate(carreraId, update, { new: true }, (err, carreraUpdated) => {
        if (err) return res.status(500).send({ message: 'Error en la peticion', success: false });

        if (!carreraUpdated) return res.status(200).send({ message: 'No se ha podido actualizar', success: false });

        return res.status(200).send({
            message: "Se edito la carrera correctamente",
            success: true
        });
    });
}

//get carreras
function getCarreras(req, res){
    Carrera.find((err, carreras) => {
        if (err) return res.status(500).send({ message: 'Error en la peticion' ,success:false});

        if (!carreras) return res.status(200).send({ message: 'No hay carreras disponibles' ,success:false});

        return res.status(200).send({
            carreras
        });
    }).sort('_id');
}

//get Carrera por id
function getCarrera(req,res) {
    var carreraId = req.params.id;

    Carrera.findById(carreraId, (err, carrera) => {
        if (err) return res.status(500).send({ message: 'Error en la peticion' ,success:false});

        if (!carrera) return res.status(404).send({ message: 'La carrera no existe' ,success:false});

        return res.status(200).send({ carrera });
    });
}

//Borrar Carrera
function deleteCarrera(req, res) {
    var carrera = req.carrera.sub;

    var congresos = Congreso.find({idCarrera:carrea}).count();

    if(congresos >= 1)
    {
        return res.status(200).send({message:"No se puede borrar la carrera, por que tiene congresos asignados",success:false});
    }

    Carrera.findById(carrera).remove(err => {
        if (err) return res.status(500).send({ message: 'Error al eliminar usuario', success: false });

        return res.status(200).send({ message: 'Carrera Eliminada', success: true });
    });
}


module.exports = {
    newCarrera,
    getCarreras,
    getCarrera,
    updateCarrera,
    deleteCarrera
}