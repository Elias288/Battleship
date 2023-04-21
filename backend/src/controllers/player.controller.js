const Joi = require("joi")
const { joiPasswordExtendCore } = require('joi-password')
const joiPassword = Joi.extend(joiPasswordExtendCore)

const playerService = require('../services/player.service')
const { tryCatch } = require('../tryCatch')
const AppError = require('../middleware/AppError')
const { ALREADY_CREATE } = require("../middleware/errorCodes")

const validEmails = ['com', 'net', 'co', 'uy']

const createPlayerSchema = Joi.object({
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

const loginPlayerSchema = Joi.object({
    email: Joi.string()
        .email({ minDomainSegments: 2, tlds: { allow: validEmails } }),
    username: Joi.string(),
    password: joiPassword
        .string()
        .required(),
}).xor('email', 'username')

exports.create = tryCatch(async (req, res) => {
    const { username, email, password, repeat_password } = req.body

    if (!process.env.DEV) {
        const { error } = createPlayerSchema.validate({ username, email, password, repeat_password })
        if (error) throw error
    }

    const data = await playerService.savePlayer(username, email, password)
    if (data.isError) throw new AppError(data.errorCode, data.details, data.statusCode)

    res.status(200).send({ message: 'Usuario creado existosamente' })
})

 exports.login = tryCatch(async (req, res) => {
    const { username, email, password } = req.body,
    {error} = loginPlayerSchema.validate({ email, username, password })
    if (error) throw error

    const data = await playerService.login(username, email, password)
    if (data.isError) throw new AppError(data.errorCode, data.details, data.statusCode)

    res.status(200).send(data)
})

exports.getPlayer = tryCatch(async ( req, res ) => {
    const { tokenData } = req

    const data = await playerService.getPlayerByid(tokenData.id)
    if (data.isError) throw new AppError(data.errorCode, data.details, data.statusCode)

    const { _id, username, email, score } = data
    return res.status(200).send({ _id, username, email, score }) 
})

exports.existPlayer = tryCatch(async (req, res) => {
    const { username } = req.params

    const data = await playerService.getPlayerByUsername(username)
    if (!data.isError) throw new AppError(ALREADY_CREATE, 'Username invalido', 401)

    res.status(200).send({ message: true })
})