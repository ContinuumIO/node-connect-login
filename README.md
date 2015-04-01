# node-connect-login


## Install

```
npm install --save connect-login
```

## Usage

You can allso see a full example [here](https://github.com/srossross/node-connect-login/blob/master/example/app.js).

```
var connectLogin = require('connect-login');
var loginManager = connectLogin();

loginManager.anonymousUser(function(){
	return {username: null};
});


loginManager.userLoader(function(user_id, next){
	myDB.lookup(user_id, function(err, user){
		next(err, user);
	});
});

loginManager.userSerializer(function(user){
   return user.username;
});


app.use(loginManager);

```

Connect Login middleware for NodeJS

# API

## User objects

When configuring `connect-login` the user argument must
only have one property `user.username`
if `user.username` is null or undefined, the user is assumed to be anonymous.


## `connectLogin(options)

```
var connectLogin = require('connect-login');
var loginManager = connectLogin(options);
```

### `options.loginPath`

Url to redirect users to when a login is required. defaults to `/login`

## `loginManager`

The login manager is middleware that must be used by the app.


### `loginManager.userLoader(loadFunction)`

The `loadFunction` function must accept the arguments
`loadFunction(user_id, callback)` and where callack must be called with
`callback(err, user)`

### `loginManager.userSerializer(storeFunction)`

The `storeFunction` function must user object from the `userLoader`
and return a user_id that can be used to store in a session cookie `user_id = storeFunction(user)`


### `loginManager.anonymousUser(anonymousFunction)`

anonymousUser allows an anonymous user to be created and used when a user is not logged in.

`anonUser = anonymousFunction()`



## `connectLogin.loginRequired`

This middleare can be used in a route to require that the user be logged in
to view it. If the user is not logged in a redirect to `options.loginPath` is sent


```
app.get('/private', connectLogin.loginRequired, function(req, res){
	res.send("Shhh!");
});
```

## Added functions to the `req` object

Once the `loginManager` is used. all req objects will have the following methods


### `req.login(user, rememberMe)`


This can be used from within a `/login` route so you can set a user as being logged in.

```
var user = myUserLoader(some_username);
req.login(user);
```

### `req.logout()`

Log out the current user

### `req.user`

The currently logged in user


### `req.loginManager`

The current login manager


