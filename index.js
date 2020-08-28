const yargs = require('yargs')
const pkg = require('./package.json')
const { start } = require('./src/lowdb-server')


const argv = yargs
  .config('config')
  .usage('$0 [options] <source>')
  .options({
    port: {
      alias: 'p',
      description: 'Set port',
      default: 3000
    },
    host: {
      alias: 'H',
      description: 'Set host',
      default: 'localhost'
    },
    middlewares: {
      alias: 'm',
      array: true,
      description: 'Paths to middleware files'
    },
    databases: {
      alias: 'db',
      array: true,
      description: 'Paths to multiple db files'
    }
  })
  .help('help')
  .alias('help', 'h')
  .version(pkg.version)
  .alias('version', 'v')
  .demandOption(['db']).argv

start(argv)
