const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Joi = require("joi")
const { joiPasswordExtendCore } = require('joi-password')
const joiPassword = Joi.extend(joiPasswordExtendCore)

const { getPlayerByName, getPlayerByUid, savePlayer } = require('../services/player.service')
const { tryCatch } = require('../tryCatch')
const AppError = require('../AppError')

const validEmails = ['com', 'net', 'co', 'uy']

const createUserSchema = Joi.object({
    username: Joi.string()
        .required(),
    email: Joi.string()
        .email({ minDomainSegments: 2, tlds: { allow: validEmails } })
        .required(),
    password: joiPassword.string()
        .minOfSpecialCharacters(1)
        .minOfLowercase(1)
        .minOfUppercase(1)
        .minOfNumeric(2)
        .noWhiteSpaces()
        .onlyLatinCharacters()
        .messages({
            'password.minOfUppercase': '{#label} debe contener al menos {#min} mayúsculas',
            'password.minOfSpecialCharacters': '{#label} debe contener al menos {#min} caracter especial',
            'password.minOfLowercase': '{#label} debe contener al menos {#min} minúsculas',
            'password.minOfNumeric': '{#label} debe contener al menos {#min} números',
            'password.noWhiteSpaces': '{#label} no debe contener espacios',
            'password.onlyLatinCharacters': '{#label} debe contener solo caracteres latínos',
        })
        .required(),
    repeat_password: Joi.ref('password')
})

exports.create = tryCatch(async (req, res) => {
    const { username, email, password, repeat_password } = req.body

    if (!process.env.DEV) {
        const { error } = createUserSchema.validate({ username, email, password, repeat_password })
        if (error) throw error
    }

    const data = await savePlayer(username, email, password)
    if (data.isError) throw new AppError(data.details, data.statusCode)

    res.status(200).send({ message: 'Usuario creado existosamente' })
})

/* exports.login = async (req, res) => {
    const { name, uid, password, anonymous } = req.body
    // console.log(req.body)

    if (!name) return res.status(400).json({ error: 'Name is required' })
    if (!uid) return res.status(400).json({ error: 'Uid is required' })
    if (anonymous == undefined) return res.status(400).json({ error: 'anonymous is required' })
    let player

    if (anonymous){
        player = await getPlayerByName(name)
        if (!player) return res.status(404).json({ error: 'user not found'})
        if (!password) return res.status(400).json({ error: 'Invalid password'})
        const pwd = await bcrypt.compare(password, player.password)
        if (!pwd) return res.status(401).send({ error: 'Wrong credentials' })
    } else {
        player = await getPlayerByUid(uid)
        if (!player) return res.status(404).json({ error: 'user not found'})
    }


    var token = jwt.sign({
        id: player._id,
        name: player.name,
        uid: player.uid
    }, process.env.TOKEN_SECRET,{
        expiresIn: 7200
    })

    return res.status(201).send({
        id: player.id,
        name: player.name,
        uid: player.uid,
        email: player.email,
        score: player.score,
        token
    })
}

exports.getUser = ( req, res ) => {
    const token = req.headers['x-access-token']
    jwt.verify(token, process.env.TOKEN_SECRET, async (err, decoded) => {
        if (err) return res.status(500).send({ error: 'Authentication Error' })
        
        const player = await getPlayerByUid(decoded.uid)
        if (!player) return res.status(500).send({ error: "Error, user not found" })
        
        return res.status(200).send({
            id: player.id,
            name: player.name,
            uid: player.uid,
            email: player.email,
            score: player.score,
        })
    })
    
}  */