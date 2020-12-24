const express = require('express');
const Usuario = require('../models/Usuario');
const bcrypt = require('bcryptjs');
const { generarJWT } = require('../helpers/jwt');


const crearUsuario = async(req, res = express.response) => {
    
    const { name, email, password } = req.body;

    try {
        let usuario = await Usuario.findOne({ email });

        if ( usuario ) {
            return res.status(400).json({
                ok:false,
                msg: 'Ya existe un usuario registrado con ese correo'
            });
        }
        usuario = new Usuario( req.body );

        // encriptar contraseña
        const salt = bcrypt.genSaltSync();
        usuario.password = bcrypt.hashSync( password , salt );

        await usuario.save();

        // Generar JWT
        const token = await generarJWT( usuario.id, usuario.name );


        res.status(201).json({
            ok:true,
            uid: usuario.id,
            name: usuario.name,
            token
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok:false,
            msg: 'Error en el servidor...'
        });
    }
    
}

const loginUsuario = async(req, res = express.response) => {
    
    const { email, password } = req.body;

    try {

        const usuario = await Usuario.findOne({ email });

        if ( !usuario ) {
            return res.status(400).json({
                ok:false,
                msg: 'Los datos no son correctos'
            });
        }

        // Confirmar password
        const validPassword = bcrypt.compareSync( password, usuario.password );

        if ( !validPassword ) {
            return res.status(400).json({
                ok:false,
                msg: 'Password incorrecto'
            });
        }

        // Generar JWT
        const token = await generarJWT( usuario.id, usuario.name );

        res.json({
            ok: true,
            uid: usuario.id,
            name: usuario.name,
            token
        })
        
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok:false,
            msg: 'Error en el servidor...'
        });
    }

    res.json({
        ok:true,
        msg: 'login',
        email,
        password
    })
}

const revalidarToken = async (req, res = express.response) => {
    
    const { uid, name } = req;
    
    // generar un nuevo JWT y retornarlo
    const token = await generarJWT( uid, name );
    
    res.json({
        ok:true,
        token
    })
}


module.exports = {
    crearUsuario,
    loginUsuario,
    revalidarToken
}