const express = require('express')
const cors = require('cors')
const methodOverride = require('method-override')
const _ = require('lodash')
const lodashId = require('lodash-id')
const low = require('lowdb')
const Memory = require('lowdb/adapters/Memory')
const FileSync = require('lowdb/adapters/FileSync')
const FileAsync = require('lowdb/adapters/FileAsync')
const bodyParser = require('./router/body-parser')
const validateData = require('./router/validate-data')
const plural = require('./router/plural')
const nested = require('./router/nested')
const singular = require('./router/singular')
const mixins = require('./router/mixins')

module.exports = (db, middlewares, argv, app, opts) => {
  let useAsync = argv.useAsync
  let host = argv.host
  let port = argv.port
  let file = db
  opts = Object.assign({ foreignKeySuffix: 'Id', _isFake: false }, opts)
  if (typeof db === 'string') {
    // Async
    if (useAsync) {
      // Create database instance and start server
      const adapter = new FileAsync(db)
      return low(adapter)
        .then(db => {
          // Create router
          const router = express.Router()
          router.use(cors());

          // Add middlewares
          router.use(methodOverride())
          router.use(bodyParser)

          validateData(db.getState())

          // Add lodash-id methods to db
          db._.mixin(lodashId)

          // Add specific mixins
          db._.mixin(mixins)

          // Expose database
          router.db = db

          // Export file json
          router.file = file

          // Expose render
          router.render = (req, res) => {
            res.jsonp(res.locals.data)
          }

          // Middlewares
          if (middlewares) {
            router.use(middlewares);
          }

          // Handle /:parent/:parentId/:resource
          router.use(nested(opts))

          // Create routes
          db.forEach((value, key) => {
            if (_.isPlainObject(value)) {
              router.use(`/${key}`, singular(db, key, opts))
              return
            }

            if (_.isArray(value)) {
              router.use(`/${key}`, plural(db, key, opts))
              return
            }

            var sourceMessage = ''
            // if (!_.isObject(source)) {
            //   sourceMessage = `in ${source}`
            // }

            const msg =
              `Type of "${key}" (${typeof value}) ${sourceMessage} is not supported. ` +
              `Use objects or arrays of objects.`

            throw new Error(msg)
          }).value()

          router.use((req, res) => {
            console.log(`request to ${req.originalUrl}`)
            if (!res.locals.data) {
              res.status(404)
              res.locals.data = {}
            }

            router.render(req, res)
          })

          router.use((err, req, res, next) => {
            console.error(err.stack)
            res.status(500).send(err.stack)
          })

          return router
        })
    } else {
      db = low(new FileSync(db))
      // Create router
      const router = express.Router()
      router.use(cors());

      // Add middlewares
      router.use(methodOverride())
      router.use(bodyParser)

      validateData(db.getState())

      // Add lodash-id methods to db
      db._.mixin(lodashId)

      // Add specific mixins
      db._.mixin(mixins)

      // Expose database
      router.db = db

      // Expose render
      router.render = (req, res) => {
        res.jsonp(res.locals.data)
      }

      // Middlewares
      if (middlewares) {
        router.use(middlewares);
      }

      // Handle /:parent/:parentId/:resource
      router.use(nested(opts))

      // Create routes
      db.forEach((value, key) => {
        if (_.isPlainObject(value)) {
          router.use(`/${key}`, singular(db, key, opts))
          return
        }

        if (_.isArray(value)) {
          router.use(`/${key}`, plural(db, key, opts))
          return
        }

        var sourceMessage = ''
        // if (!_.isObject(source)) {
        //   sourceMessage = `in ${source}`
        // }

        const msg =
          `Type of "${key}" (${typeof value}) ${sourceMessage} is not supported. ` +
          `Use objects or arrays of objects.`

        throw new Error(msg)
      }).value()

      router.use((req, res) => {
        console.log(`request to ${req.originalUrl}`)
        if (!res.locals.data) {
          res.status(404)
          res.locals.data = {}
        }

        router.render(req, res)
      })

      router.use((err, req, res, next) => {
        console.error(err.stack)
        res.status(500).send(err.stack)
      })

      return router
    }
  } else if (!_.has(db, '__chain__') || !_.has(db, '__wrapped__')) {
    db = low(new Memory()).setState(db)
  }

}
