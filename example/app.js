var connectLogin = require('../index');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');


// Express JS boilerplate code

app = express();
app.engine('jade', require('jade').__express);
app.set('views', path.resolve(__dirname, '.'));
app.set('view engine', 'jade')


app.use(session({
    secret: 'keyboard cat',
    saveUninitialized: false,
    resave: false,
}));


app.use(bodyParser.urlencoded({ extended: false }))


// Create the Login Manager


var loginManager = connectLogin({loginPath: '/'});

loginManager.anonymousUser(function(){
    return {username: null};
});


loginManager.userLoader(function(user_id, next){
    var user = {username: user_id};
    next(null, user);

});


loginManager.userSerializer(function(user){

    return user.username;
});

// use the loginManager as middleware
app.use(loginManager);

// Create the routes!
app.get('/', function(req, res){
    return res.render('index', {next: req.query.next, user: req.user});
});


app.post('/', function(req, res){
    var user = {username: req.body.username};
    req.login(user);

    // the next param may be set by loginRequired
    res.redirect(req.query.next || '/');
});


app.get('/restricted', connectLogin.loginRequired, function(req, res){
    return res.render('restricted', {user: req.user});
});

app.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
});

// Start the server!

var port = 8808;
app.listen(port, function(){
    console.log("listening on port %s", port);
});



