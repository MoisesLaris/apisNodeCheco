'use strict'

var mongoose = require('mongoose');
var TipoPago = require('../model/tipoPago');
var Actividad = require('../model/actividad');
var mongoosePaginate = require('mongoose-pagination');
//encriptar contraseña
var bcrypt = require('bcrypt-nodejs');

var jwt = require('../services/jwt');

var md_auth = require('../middleware/authenticated');

//Nuevo Congreso
function newTipoPago(req, res) {
    var params = req.body; //Toma todos los campos que llegan por req en body, y los pone en params
    var tipoPago = new TipoPago();
    if (params.nombre && params.descripcion && params.precio) {

        tipoPago.nombre = params.nombre;
        tipoPago.idCarrera = params.idCarrera;

        TipoPago.find({nombre:tipoPago.nombre}).sort({ $natural: -1 }).exec(function(err, doc) {
            if (err) {
                res.status(404).send({ message: 'No se ha registrado el tipo pago' });
            }
            tipoPago.idTipoPago = 0;
            tipoPago.save((err, tipoPagoStored) => {
                if (err) {
                    return res.status(500).send({ message: 'Error al insertar el tipo pago ' + err })
                }
                if (tipoPagoStored) {
                    res.status(200).send({ congreso : tipoPagoStored });
                } else {
                    res.status(404).send({ message: 'No se ha registrado el tipo pago' });
                }
            });
        });
    } else {
        res.status(200).send({
            message: "Hubo un problema al recibir los datos."
        });
    }
}

//get Congreso
function getTipoPago(req,res) {
    var tipoPagoId = req.params.id;

    TipoPago.findById(tipoPagoId, (err, tipoPago) => {
        if (err) return res.status(500).send({ message: 'Error en la peticion' ,success:false});

        if (!tipoPago) return res.status(404).send({ message: 'El tipo pago no existe' ,success:false});

        return res.status(200).send({ tipoPago });
    });
}

//get congresos
function getTipoPagos(req, res){
    TipoPago.find((err, tipoPagos) => {
        if (err) return res.status(500).send({ message: 'Error en la peticion' ,success:false});

        if (!congresos) return res.status(200).send({ message: 'No hay tipos pagos disponibles' ,success:false});

        return res.status(200).send({
            tipoPagos
        });
    }).sort('_id');
}

//Actualizar Congreso
function updateTipoPago(req,res){
    var tipoPagoId = req.params.id;
    var update = req.body;

    TipoPago.findByIdAndUpdate(tipoPagoId, update, { new: true }, (err, tipoPagoUpdated) => {
        if (err) return res.status(500).send({ message: 'Error en la peticion', success: false });

        if (!tipoPagoUpdated) return res.status(200).send({ message: 'No se ha podido actualizar', success: false });

        return res.status(200).send({
            message: "Se edito el tipo pago correctamente",
            success: true
        });
    });
}

//Borrar Congreso
async function deleteTipoPago(req, res) {
    var pagoId = req.params.id;

   var pagos = await getPagos(pagoId);

    if(pagos >= 1)
    {
        return res.status(200).send({message:"No se puede borrar el congreso, por que tiene pagos asignados",success:false});
    }

    Congreso.findById(congresoId).remove(err => {
        if (err) return res.status(500).send({ message: 'Error al eliminar el tipo pago', success: false });

        return res.status(200).send({ message: 'Tipo pago eliminado', success: true });
    });
}

async function getPagos(tipoPagoId)
{
    var pagos = await Actividad.countDocuments({idTipoPago: tipoPagoId}, function(err, c) {
        if(err) return handleError(err);
        console.log('Count is ' + c);
        return c;
    });
    return pagos;
}

module.exports = {
    newTipoPago,
    getTipoPago,
    getTipoPagos,
    updateTipoPago,
    deleteTipoPago
}