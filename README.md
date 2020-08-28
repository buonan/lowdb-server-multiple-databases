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
json-server db.json --middlewares ./hello.js
json-server db.json --middlewares ./first.js ./second.js
```

### Add routes

You can add your middlewares from the CLI using `--routes` option:

```bash
json-server db.json --routes ./db1.json
json-server db.json --routes ./db1.json ./db2.json
```