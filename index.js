var querystring = require('querystring');
var debug = require('debug')('connect-login');

module.exports = function (options){

    options = options || {};

    var loginManager = function (req, res, next){

        if (req.session === undefined){
            return next(new Error("session middleware is required to use connect-login"));
        }

        if (loginManager._userLoader === undefined){
            return next(new Error("The connect-login module requires a user loader function"));
        }

        if (loginManager._userSaver === undefined){
            return next(new Error("The connect-login module requires a user serializer function"));
        }


        req.loginManager = loginManager;

        req.login = function(user, rememberMe){
            debug("req.login username: " + user.username);

            req.user = user;
            var userid = loginManager._userSaver(user);

            if (!userid){
                throw Error("serializeUser() returned an empty value");
            }

            req.session.userid = userid;
            req.session.fresh = true;

            if (rememberMe){

                if (rememberMe === true){
                    rememberMe = {};
                }

                rememberMe.signed = true;

                if (rememberMe.maxAge === undefined){
                    rememberMe.maxAge = 360 * 24 * 60 * 60 * 1000;
                }
                if (rememberMe.httpOnly === undefined){
                    rememberMe.httpOnly = true;
                }
                if (rememberMe.path === undefined){
                    rememberMe.path = '/';
                }

                res.cookie('userid', userid, rememberMe);
            }
        };

        var signedCookies = req.signedCookies || {};

        req.logout = function(){

            delete req.session.userid;
            if (signedCookies.userid){
                debug("logoug username:", signedCookies.userid);
                res.clearCookie('userid');
            }

        };

        var userid = req.session.userid || signedCookies.userid;
        if (userid){
            debug("Load User user_id: " + userid);
            loginManager._userLoader(userid, function(err, user){
                req.user = user;
                next(err);
            });
        } else {
            if (loginManager._userCreator){
                debug("Load Anonymous User");
                res.locals.user = req.user = loginManager._userCreator();
            }
            next();
        }
    };

    loginManager.loadUser = loginManager.userLoader = function(userLoader){
        loginManager._userLoader = userLoader;
        debug("userLoader was set");
    };

    loginManager.serializeUser = loginManager.userSerializer = function(userSaver){
        loginManager._userSaver = userSaver;
        debug("userSerializer was set");
    };
    loginManager.anonymousUser = function(userCreator){
        loginManager._userCreator = userCreator;
        debug("anonymousUser creator was set");
    };

    loginManager.loginPath = options.loginPath || '/login';
    return loginManager;
};


module.exports.loginRequired = function(req, res, next){
    var user  = req.user;
    if (!user || !user.username) {
        var url = req.loginManager.loginPath + '?' + querystring.stringify({next: req.path});
        return res.redirect(url);
    } else {
        next();
    }
};

module.exports.loginRequiredWS = function(req, res, next){
    var user  = req.user;
    if (!user || !user.username) {
        next(new Error("Login is required for this websocked upgrade"));
        return;
    } else {
        next();
    }
};
