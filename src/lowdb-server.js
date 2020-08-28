
const express = require('express');
const app = express();
const path = require('path')
const chalk = require('chalk')
const lowdbRouter = require('./lowdb-router')

module.exports = {
  start: (argv) => {
    let port = argv.port
    let host = argv.host

    // Load middlewares ie. authorizations
    let middlewares
    if (argv.middlewares) {
      middlewares = argv.middlewares.map(function (m) {
        console.log(chalk.gray('  Loading middleware', m))
        return require(path.resolve(m))
      })
    }

    // Load routes for databases
    let databaseId = 0
    if (argv.databases) {
       argv.databases.map(function (m) {
        databaseId++
        console.log(chalk.gray(`  Loading route '/${databaseId}' for ${m}`))
        app.use(`/${databaseId}`, lowdbRouter(databaseId, path.join(__dirname, `../${m}`), middlewares))
      })
    }

    app.listen(port, () => {
      console.log(`Example app listening at http://${host}:${port}`)
    })
  }
}
