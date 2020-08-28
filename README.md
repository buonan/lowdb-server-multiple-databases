### Add middlewares

You can add your middlewares from the CLI using `--middlewares` option:

```js
// hello.js
module.exports = (req, res, next) => {
  res.header('X-Hello', 'World')
  next()
}
```

```bash
node index.js --middlewares ./hello.js
node index.js --middlewares ./first.js ./second.js
```

### Add database(s) routes

You can add your middlewares from the CLI using `--db` option:

```bash
node index.js --db ./db1.json
node index.js --db ./db1.json ./db2.json
```