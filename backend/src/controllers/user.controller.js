const Joi = require("joi")
const { joiPasswordExtendCore } = require('joi-password')
const joiPassword = Joi.extend(joiPasswordExtendCore)

const userService = require('../services/player.service')
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

const loginUserSchema = Joi.object({
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
        const { error } = createUserSchema.validate({ username, email, password, repeat_password })
        if (error) throw error
    }

    const data = await userService.savePlayer(username, email, password)
    if (data.isError) throw new AppError(data.details, data.statusCode)

    res.status(200).send({ message: 'Usuario creado existosamente' })
})

 exports.login = tryCatch(async (req, res) => {
    const { username, email, password } = req.body,
    {error} = loginUserSchema.validate({ email, username, password })
    if (error) throw error

    const data = await userService.login(username, email, password)
    if (data.isError) throw new AppError(data.details, data.statusCode)

    res.status(200).send(data)
})

/*exports.getUser = ( req, res ) => {
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