'use strict'

var mongoose = require('mongoose');

//var ObjectId = mongoose.Types.ObjectId();

var ObjectId = require('mongodb').ObjectID;

var User = require('../model/user');
var mongoosePaginate = require('mongoose-pagination');
var Pago = require('../model/pago');
//encriptar contraseña
var bcrypt = require('bcrypt-nodejs');

var jwt = require('../services/jwt');

var md_auth = require('../middleware/authenticated');

//Metodo de prueba
function home(req, res) {
    res.status(200).send({
        message: "Pruebas en nodeJs",
    });
}

//Metodos de prueba
function pruebas(req, res) {
    console.log(req.body);
    res.status(200).send({
        message: "Pruebas en nodeJs -> post",
    });
}

//Crear nuevo usuario
function newUser(req, res) {
    var params = req.body; //Toma todos los campos que llegan por req en body, y los pone en params
    var user = new User();
    if (params.nombre && params.apellidos && params.correo && params.password && params.semestre && params.grupo && params.idCarrera) {
        //Seguir con el video jeje

        user.nombre = params.nombre;
        user.apellidos = params.apellidos;
        user.tipoUsuario = 0;//cambiar a 1
        user.correo = params.correo.toLowerCase();
        user.semestre = params.semestre;
        user.grupo = params.grupo;
        user.idCarrera = params.idCarrera;

        //Controlar los usuarios repetidos por correo
        User.findOne({ correo: user.correo.toLowerCase() }).exec((err, users) => {
            if (err) return res.status(500).send({ message: "Error en la busqueda", success: false })
            if (users) {
                return res.status(200).send({
                    message: "El correo ya esta siendo usado por otro usuario.",
                    success: false
                });
            } else {
                bcrypt.hash(params.password, null, null, (err, hash) => {
                    if (err) return res.status(500).send({ message: "Error al encryptar la contraseña", success: false })
                    user.password = hash;
                    User.find({}).sort({ $natural: -1 }).exec(function(err, doc) {
                        if (err) {
                            res.status(200).send({ message: 'No se ha registrado el usuario', success: false });
                        }
                        //var x = doc[0].idUsuario + 1;
                        user.idUsuario = 0;
                        //user.tipoUsuario = 0;//Quitar en el front
                        user.save((err, userStored) => {
                            if (err) {
                                return res.status(200).send({ message: 'Error al insertar el usuario ' + err, success: false })
                            }
                            if (userStored) {
                                res.status(200).send({ message: "Se creo el usuario correctamente", success: true });
                            } else {
                                res.status(200).send({ message: 'No se ha registrado el usuario', success: false });
                            }
                        });
                    });

                    //res.status(200).send({message:'Simon ' + valor.toString});
                });
            }
        });


    } else {
        res.status(200).send({
            message: "Hubo un problema al recibir los datos.",
            success: false
        });
    }
}

//Log In
function loginUser(req, res) {
    var params = req.body;

    var email = params.correo;
    var password = params.password;

    User.findOne({ correo: email }, (err, user) => {
        if (err) return res.status(500).send({ message: 'Error en la peticion', success: false });
        //return res.status(200).send({message: 'Recibi esto '+params.correo + ' ' + params.password});
        if (user) {

            bcrypt.compare(password, user.password, (err, check) => {
                if (err) return res.status(200).send({ message: 'Correo o contraseña incorrecta', success: false });
                //console.log(user);
                if (check) {
                    var userReturn = user;
                    userReturn.password = undefined;
                    return res.status(200).send({
                        token: jwt.createToken(user),
                        success: true,
                        tipoUsuario: user.tipoUsuario,
                        message: "Se inicio sesion correctamente",
                        user: userReturn
                    });

                } else {
                    return res.status(200).send({ message: 'Correo o contraseña incorrecta', success: false });
                }
            });
        } else {
            return res.status(200).send({ message: 'El usuario no existe', success: false });
        }
    });
}

//Consultar usuarios
function getUser(req, res) {
    var userId = req.params.id;

    User.findById(userId, (err, user) => {
        if (err) return res.status(500).send({ message: 'Error en la peticion', success: false });

        if (!user) return res.status(404).send({ message: 'El usuario no existe', success: false });

        return res.status(200).send({ user });
    });
}

//Consultar usuarios por paginas
function getUsers(req, res) {
    var identity_user_id = req.user.sub;

    var page = 1;

    if (req.params.page) {
        page = req.params.page;
    }

    var itemsPerPage = 5;

    User.find((err, users, total) => {
        if (err) return res.status(500).send({ message: 'Error en la peticion', success: false });

        if (!users) return res.status(404).send({ message: 'No hay usuarios disponibles', success: false });

        return res.status(200).send({
            users
        });
    }).sort('_id');
}

//Get congresos en los que esta inscrito el usuario
function getUserCongresos(req, res)
{
    var usuarioId = req.user.sub;//Lo tomamos de el token de JWT
    //var usuarioId = req.params.id;

    Pago.aggregate([//Sobre la coleccion de pago, puede ser cualquier otra
        { "$match": {idUsuario: ObjectId(/*"5ee3bbf17853d008ffed8e01"*/usuarioId)}},//Este es como el where
        {"$lookup"://Join, une dos tablas
            {
                //En est parte se une pago con usuario
              from: "usuario",
              localField: "idUsuario",
              foreignField:"_id",
              as: "usuario"
            }},{
                "$unwind": "$usuario"//Para regresar solo uno, no un array
              },
              //En esta parte se une pago con tipoPago
              {"$lookup":
            {
              from: "idTipoPago",
              localField: "idTipoPago",
              foreignField:"_id",
              as: "tipoPago"
            }},{"$group":{
                _id: "$tipoPago._id",
                idCongreso : {"$first":"$tipoPago.idCongreso"},
                total: {"$first":"$tipoPago.precio"},
                pagado: {"$sum":"$cantidad"}
            }},
            {"$lookup":
            {
              from: "congreso",
              localField: "idCongreso",
              foreignField:"_id",
              as: "congreso"
            }},
            {
                "$unwind": {"path":"$congreso", "preserveNullAndEmptyArrays":true}//Para regresar solo uno, no un array
            },
            
    ]).exec((err,result) => {
        console.log(`result`,result);
        console.log(`err`,err);

        var congresos_filtrados = [];

        
        result.forEach((congr) => {
            if(congr.pagado >= congr.total)
            {
                congresos_filtrados.push(congr);
            }
        });

        return res.status(200).send({
            message: "Se edito el usuario correctamente",
            success: true,
            congresos: congresos_filtrados
        });
    });

    //5ee9676e740b93e92c2e1430 -> idtipoPago
    //5ee9676e740b93e92c2e1430 -> deluxe

    //5ee3bbf17853d008ffed8e01 -> idUsuario

    //5ee51fd2988f5e0a903d0d91 -> mauricio

    /*Pago.find({idUsuario:usuarioId},(err, pagos) =>
        if (err) return res.status(500).send({ message: 'Error en la peticion', success: false });

        if (!pagos) return res.status(404).send({ message: 'No hay usuarios disponibles', success: false });

        var tiposPago = [];

        var suma = 0.0;
        var currentTipoPago = "";

        pagos.forEach((pago) => {
            if(pago.idTipoPago._id == "")
            {
                suma = 0.0;
                currentTipoPago = pago.idTipoPago._id;
            }
            var suma = suma + pago.cantidad;
            if(suma == pago.idTipoPago.total)
                tiposPago.push(pago.idTipoPago);
        });

        return listaCongresos(tiposPagos);

    }).sort('idTipoPago').populate({path:'idTipoPago'});*/
}

//Actualizar usuario
function updateUser(req, res) {
    var userId = req.params.id;
    var update = req.body;

    //borrar propiedad password
    delete update.password;

    if (req.user.tipoUsuario != 0) {
        return res.status(200).send({ message: 'No tienes permisos para esto', success: false });
    }

    User.findByIdAndUpdate(userId, update, { new: true }, (err, userUpdated) => {
        if (err) return res.status(500).send({ message: 'Error en la peticion', success: false });

        if (!userUpdated) return res.status(200).send({ message: 'No se ha podido actualizar', success: false });

        return res.status(200).send({
            message: "Se edito el usuario correctamente",
            success: true
        });
    });
}

//Borrar usuario
function deleteUser(req, res) {
    var tipoUsuario = req.user.tipoUsuario;
    //var usuario = req.user.sub;

    var usuario = req.params.id;

    if (tipoUsuario != 0) {
        return res.status(200).send({ message: 'No tienes permisos para esto', success: false });
    }

    User.deleteOne({ _id: usuario }, err => {
        if (err) return res.status(200).send({ message: 'Error al eliminar el usuario', success: false });

        return res.status(200).send({ message: 'Usuario Eliminada', success: true });
    });
}


function getUserByToken(req, res) {
    var userReturn = req.user;
    userReturn.password = undefined;
    return res.status(200).send({
        token: req.headers.authorization,
        success: true,
        tipoUsuario: userReturn.tipoUsuario,
        message: "Informacion de usuario",
        user: userReturn
    });
}

module.exports = {
    home,
    pruebas,
    newUser,
    loginUser,
    getUser,
    getUsers,
    updateUser,
    deleteUser,
    getUserByToken,
    getUserCongresos
}