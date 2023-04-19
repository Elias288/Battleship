const { getPlayerByName, getPlayerByUid, savePlayer } = require('../services/player.service')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

exports.createPlayer = async (req, res) => {
    const { name, email, uid, password, anonymous } = req.body

    if (!name) return res.status(400).json({ error: 'Name is required' })
    if (!uid) return res.status(400).json({ error: 'Uid is required' })
    if (anonymous == undefined) return res.status(400).json({ error: 'anonymous is required' })

    if (anonymous) {
        if (!password) return res.status(400).json({ error: 'Invalid password'})
        const hashedPassword = await bcrypt.hashSync(password, 8) 
        if (await getPlayerByName(name)) return res.status(400).json({ error: 'User already register' })

        const newPlayer = await savePlayer(name, uid, null, hashedPassword)
        return res.status(201).send({
            name: newPlayer.name,
            uid: newPlayer.uid
        })
    }

    if (await getPlayerByUid(uid)) return res.status(400).json({ error: 'User already register' })
    const newPlayer = await savePlayer(name, uid, email, null)
    await newPlayer.save()

    return res.status(201).send({
        name: newPlayer.name,
        uid: newPlayer.uid
    })
}

exports.login = async (req, res) => {
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
        });
    })
    
} 