# Start

```
cd c:/folder/path
npm i
node .
```

## url

by default, go to http://localhost/


# Database explain

## userTable

where `table = db.table` and `db = require('quick.db')`

### Contains information about the user with his UUID:

```
new table("user").get(userUUID)

=>

{
    username,
    password,
    email,
    uuid
}
```

## emailTable

### Contains user UUID by their email:

```
new table("email").get(email)

=>

"userUUID"
```

## usernameTable

### Contains user UUID by their username:

```
new table("username").get(username)

=>

"userUUID"
```
