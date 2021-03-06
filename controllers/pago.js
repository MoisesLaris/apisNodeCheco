'use strict'

var mongoose = require('mongoose');

var Pago = require('../model/pago');
//var ActividadUsuarioFecha = require('../model/actividadUsuarioFecha');
//encriptar contraseña

//Nueva Pago
function newPago(req, res) {
    var params = req.body; //Toma todos los campos que llegan por req en body, y los pone en params
    var pago = new Pago();
    if (params.idUsuario && params.idTipoPago && params.cantidad && params.status) {

        pago.idUsuario = params.idUsuario;        
        pago.cantidad = params.cantidad;
        pago.status = params.status;
        pago.idTipoPago = params.idTipoPago;

            pago.idPago = 0;
            pago.save((err, pagoStored) => {
                if (err) {
                    return res.status(200).send({ message: 'Error al insertar el pago ' + err,success:false })
                }
                if (pagoStored) {
                    res.status(200).send({ message:'Se registro el pago correctamente', success:true });
                } else {
                    res.status(200).send({ message: 'No se ha registrado el pago' ,success:false});
                }
            });
    } else {
        res.status(200).send({
            message: "Hubo un problema al recibir los datos.",
            success: false
        });
    }
}

//get Pago
function getPago(req,res) {
    var pagoId = req.params.id;

    Pago.findById(pagoId, (err, pago) => {
        if (err) return res.status(200).send({ message: 'Error en la peticion' ,success:false});

        if (!pago) return res.status(200).send({ message: 'El pago no existe' ,success:false});

        return res.status(200).send({ pago });
    });
}

//get pagos con id usuario
function getPagosUsuario(req, res){
    var idUsuario = req.params.id;
    Pago.find({idUsuario:idUsuario},(err, pagos) => {
        if (err) return res.status(200).send({ message: 'Error en la peticion' ,success:false});

        if (!pagos) return res.status(200).send({ message: 'No hay pagos disponibles' ,success:false});

        return res.status(200).send({
            pagos
        });
    }).sort('_id');
}

//get pagos con id tipo pago
function getPagosTipoPago(req, res){
    var tipoPagoId = req.params.id;
    Pago.find({idTipoPago:tipoPagoId},(err, pagos) => {
        if (err) return res.status(200).send({ message: 'Error en la peticion' ,success:false});

        if (!pagos) return res.status(200).send({ message: 'No hay pagos disponibles' ,success:false});

        return res.status(200).send({
            pagos
        });
    }).sort('_id').populate([{path:'idTipoPago'},{path:'idUsuario'}]);
}

//get pagos con id congreso
function getPagosCongreso(req, res){
    var congresoId = req.params.id;
    Pago.find({idCongreso:congresoId},(err, pagos) => {
        if (err) return res.status(200).send({ message: 'Error en la peticion' ,success:false});

        if (!pagos) return res.status(200).send({ message: 'No hay pagos disponibles' ,success:false});

        return res.status(200).send({
            pagos
        });
    }).sort('_id');
}

//Actualizar Pago
function updatePago(req,res){
    var pagoId = req.params.id;
    var update = req.body;

    Pago.findByIdAndUpdate(pagoId, update, { new: true }, (err, pagoUpdated) => {
        if (err) return res.status(200).send({ message: 'Error en la peticion', success: false });

        if (!pagoUpdated) return res.status(200).send({ message: 'No se ha podido actualizar', success: false });

        return res.status(200).send({
            message: "Se edito el pago correctamente",
            success: true
        });
    });
}

//Borrar Actividad
/*
async function deleteActividad(req, res) {
    var actividadId = req.params.id;

   var actividadesUsuarioFecha = await getActividadesUsuarioFecha(actividadId);

    if(actividadesUsuarioFecha >= 1)
    {
        return res.status(200).send({message:"No se puede borrar la actividad, por que tiene actividades asignadas",success:false});
    }

    Actividad.findById(actividadId).remove(err => {
        if (err) return res.status(500).send({ message: 'Error al eliminar la actividad', success: false });

        return res.status(200).send({ message: 'Actividad eliminada', success: true });
    });
}

async function getActividadesUsuarioFecha(actividadId)
{
    var actividades = await ActividadUsuarioFecha.countDocuments({idActividad: actividadId}, function(err, c) {
        if(err) return handleError(err);
        console.log('Count is ' + c);
        return c;
    });
    return actividades;
}*/

module.exports = {
    newPago,
    getPago,
    getPagosCongreso,
    getPagosTipoPago,
    getPagosUsuario,
    updatePago
}