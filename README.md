# lowdb-server-multiple-databases

Using a combination of lowdb and json-server to server multiple databases with routes.

## Usage

```sh
npm start -- --port 3001 --middlewares auth.js --db db1.json db2.json
```

## Add middlewares

You can add your middlewares using `--middlewares` option:

```js
// hello.js
module.exports = (req, res, next) => {
  res.header('X-Hello', 'World')
  next()
}
```

```bash
node index.js --middlewares ./hello.js --db db.json
node index.js --middlewares ./first.js ./second.js --db db1.json db2.json
```

## Add database(s) routes

You can add your multiple database files using `--db` option:

```bash
node index.js --db ./db1.json
node index.js --db ./db1.json ./db2.json
```

## Routes

Based on the previous `db.json` file, here are all the default routes.

### Single Database Plural routes

```
GET    /1/posts
GET    /1/posts/1
POST   /1/posts
PUT    /1/posts/1
PATCH  /1/posts/1
DELETE /1/posts/1
```

### Single Database Singular routes

```
GET    /1/profile
POST   /1/profile
PUT    /1/profile
PATCH  /1/profile
```

### Multiple Database Plural routes based on --db db1.json db2.json

```
GET    /1/posts
GET    /2/posts
GET    /1/posts/1
GET    /2/posts/1
POST   /1/posts
POST   /2/posts
PUT    /1/posts/1
PUT    /2/posts/1
PATCH  /1/posts/1
PATCH  /2/posts/1
DELETE /1/posts/1
DELETE /2/posts/1
```

### Multiple Database Singular routes based on --db db1.json db2.json

```
GET    /1/profile
GET    /2/profile
POST   /1/profile
POST   /2/profile
PUT    /1/profile
PUT    /2/profile
PATCH  /1/profile
PATCH  /2/profile
```

## Links
- [typicode/json-server](https://github.com/typicode/json-server)
- [typicode/lowdb](https://github.com/typicode/lowdb)

## License
MIT