'use strict'

var mongoose = require('mongoose');
var FAQ = require('../model/FAQ');
var mongoosePaginate = require('mongoose-pagination');
//encriptar contraseña
var bcrypt = require('bcrypt-nodejs');

var jwt = require('../services/jwt');

var md_auth = require('../middleware/authenticated');

//Crear nuevo usuario
function newFAQ(req, res) {
    var params = req.body; //Toma todos los campos que llegan por req en body, y los pone en params
    var Faq = new FAQ();
    if (params.comentario && params.idCongreso) {
        //Seguir con el video jeje
        Faq.idUsuario = params.idUsuario;
        Faq.comentario = params.comentario;
        Faq.respuesta = params.respuesta;
        Faq.idCongreso = params.idCongreso;

        FAQ.find({}).sort({ $natural: -1 }).exec(function(err, doc) { //Checar, posible error
            if (err) {
                res.status(200).send({ message: 'No se guardo la pregunta', success: false });
            }

            Faq.save((err, faqStored) => {
                if (err) {
                    return res.status(200).send({ message: 'Error al insertar la nueva pregunta ' + err, success: false })
                }
                if (faqStored) {
                    res.status(200).send({ message: "Se creo la pregunta correctamente", success: true });
                } else {
                    res.status(200).send({ message: 'No se ha registrado la nueva pregunta', success: false });
                }
            });
        });


    } else {
        res.status(200).send({
            message: "Hubo un problema al recibir los datos.",
            success: false
        });
    }
}

//Consultar usuarios
function getFaq(req, res) {
    var faqId = req.params.id;

    FAQ.findById(faqId, (err, faq) => {
        if (err) return res.status(200).send({ message: 'Error en la peticion' });

        if (!faq) return res.status(200).send({ message: 'La pregunta no existe' });

        return res.status(200).send({ faq });
    });
}

//Consultar usuarios por paginas
function getFaqs(req, res) {

    FAQ.find((err, faqs, total) => {
        if (err) return res.status(200).send({ message: 'Error en la peticion', success: false });

        if (!faqs) return res.status(200).send({ message: 'No hay preguntas disponibles', success: false });

        return res.status(200).send({
            faqs
        });
    }).sort('_id').populate({path:'idCongreso'});

}

//Consultar preguntas por idCongreso
//Consultar usuarios por paginas
function getFaqsCongreso(req, res) {

    var congresoId = req.params.id;

    FAQ.find({idCongreso:congresoId},(err, faqs) => {
        if (err) return res.status(200).send({ message: 'Error en la peticion', success: false });

        if (!faqs) return res.status(200).send({ message: 'No hay preguntas disponibles', success: false });

        return res.status(200).send({
            faqs
        });
    }).sort('_id').populate({path:'idCongreso'});

}
//updateFaq
function updateFaq(req, res) {
    var faqId = req.params.id;
    var update = req.body;

    if (req.user.tipoUsuario != 0) {
        return res.status(200).send({ message: 'No tienes permisos para esto', success: false });
    }

    FAQ.findByIdAndUpdate(faqId, update, { new: true }, (err, faqUpdated) => {
        if (err) return res.status(200).send({ message: 'Error en la peticion', success: false });

        if (!faqUpdated) return res.status(200).send({ message: 'No se ha podido actualizar', success: false });

        return res.status(200).send({
            message: "Se edito la pregunta correctamente",
            success: true
        });
    });
}

//Borrar usuario
function deleteFaq(req, res) {
    var tipoUsuario = req.user.tipoUsuario;
    var faq = req.params.id;

    if (tipoUsuario != 0) {
        return res.status(200).send({ message: 'No tienes permisos para esto', success: false });
    }

    FAQ.deleteOne({ _id: faq }, err => {
        if (err) return res.status(200).send({ message: 'Error al eliminar la pregunta', success: false });

        return res.status(200).send({ message: 'Pregunta Eliminado', success: true });
    });
}

module.exports = {
    newFAQ,
    getFaq,
    getFaqs,
    updateFaq,
    deleteFaq,
    getFaqsCongreso
}