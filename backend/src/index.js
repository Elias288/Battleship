const app = require('./app')

app.set('port', process.env.PORT || 3001)
app.set('json spaces', 2)

app.listen(app.get('port'), () => {
	console.log(`escuchando en *${app.get('port')}`)
})