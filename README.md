# node-connect-login


## Install

```
npm install --save connect-login
```

## Usage

You can allso see a full example [here](https://github.com).
```
var connectLogin = require('connect-login');

loginManager = connectLogin();

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

