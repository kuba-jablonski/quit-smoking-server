const winston = require('winston')
const app = require('./index')

let port = process.env.PORT || 3000
app.listen(port, () => winston.info(`Listening on port ${port}...`))
