
const fs = require('fs')
const express = require('express');
const jph = require('json-parse-helpfulerror')
const _ = require('lodash')
const app = express();
const cors = require('cors')
const path = require('path')
const chalk = require('chalk')
const lowdbRouter = require('./lowdb-router')

module.exports = {
  start: (argv) => {
    let useAsync = argv.useAsync
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
    if (argv.databases) {
      argv.databases.map(function (m) {
        console.log(chalk.gray(`  Loading route '/${m.id}' for ${m.file}`))

        if (useAsync) {
          lowdbRouter(`${m.file}`, middlewares, argv, app).then((router) => {
            // Watch files
            if (argv.watch) {
              console.log(chalk.gray('  Watching...'))
              console.log()
              const source = m.file
              // Watch .js or .json file
              // Since lowdb uses atomic writing, directory is watched instead of file
              const watchedDir = path.dirname(source)
              let readError = false
              fs.watch(watchedDir, (event, file) => {
                // https://github.com/typicode/json-server/issues/420
                // file can be null
                if (file) {
                  const watchedFile = path.resolve(watchedDir, file)
                  if (watchedFile === path.resolve(source)) {
                    let obj
                    try {
                      obj = jph.parse(fs.readFileSync(watchedFile))
                      if (readError) {
                        console.log(chalk.green(`  Read error has been fixed :)`))
                        readError = false
                      }
                    } catch (e) {
                      readError = true
                      console.log(chalk.red(`  Error reading ${watchedFile}`))
                      console.error(e.message)
                      return
                    }

                    // Compare .json file content with in memory database
                    const isDatabaseDifferent = !_.isEqual(obj, router.db.getState())
                    if (isDatabaseDifferent) {
                      console.log(
                        chalk.gray(`  ${source} has changed, reloading...`)
                      )
                      router.db.setState(obj)
                    }
                  }
                }
              })
            }
            // CORS-enabled
            app.use(cors())
            app.use(`/${m.id}`, router)
            console.log(`FileAsync`)
            //console.log(`Server listening at http://${host}:${port}`)
            //app.listen(port, () => console.log('listening on port 3000'))
          })
        } else {
          // CORS-enabled
          app.use(cors())
          app.use(`/${m.id}`, lowdbRouter(`${m.file}`, middlewares, argv))
          console.log(`FileSync`)
        }
      })
    }

    app.listen(port, () => {
      console.log(`Server listening at http://${host}:${port}`)
    })
  }
}
