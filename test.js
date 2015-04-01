var connectLogin = require('./index');
var chai = require('chai');
var expect = chai.expect;


function mkReq(){
    return {
        session: {}
    };
}

function mkManager(){
    var manager = connectLogin();
    manager.userLoader(function(user_id, next){
        next(null, {username: user_id});
    });
    manager.userSerializer(function(user){
        return user.username;
    });

    return manager;

}

describe("connect-login", function(){

    describe("requireLogin", function(){
        it("should redirect to the login page if the user is not given", function(done){
            var manager = mkManager();
            var req=mkReq();
            var res={locals:{}, redirect: function(path){
                expect(path).to.equal('/login?next=')
                done();
            }};

            manager(req, res, function(err){
                if (err) return done(err);
                connectLogin.loginRequired(req, res, function(err){
                    if (err) return done(err);
                    done(new Error("Should have redirected!"));
                });
            });

        });

        it("should render the view if the user is logged in", function(done){
            var manager = mkManager();
            var req = mkReq();
            req.session = { userid: 'user1', fresh: true };
            var res = {locals:{}};

            manager(req, res, function(err){
                if (err) return done(err);
                connectLogin.loginRequired(req, res, function(err){
                    if (err) return done(err);
                    done();
                });
            });

        });

    });

    describe("the login manager", function(){
        it("should set the user to null if anonymousUser is not set", function(done){
            var manager = mkManager();
            var req=mkReq();
            var res={locals:{}};

            manager(req, res, function(err){
                if (err) return done(err);

                expect(req.user).to.equal(null);
                done();
            });

        });

        it("should set the user to object if anonymousUser is given", function(done){
            var manager = mkManager();
            manager.anonymousUser(function(){
                return {username: null, foo:true};
            });
            var req=mkReq();
            var res={locals:{}};

            manager(req, res, function(err){
                if (err) return done(err);

                expect(req.user).to.deep.equal({username: null, foo:true});
                done();
            });

        });

    });


    describe("the request object", function(){
        it("should have the expect properties", function(done){
            var manager = mkManager();
            var req=mkReq();
            var res={locals:{}};

            manager(req, res, function(err){
                if (err) return done(err);

                expect(req).to.have.property('login');
                expect(req).to.have.property('logout');
                expect(req).to.have.property('user');
                expect(req).to.have.property('loginManager');

                done();
            })
        });

        it("shoud log the user in when req.login is called", function(done){
            var manager = mkManager();
            var req=mkReq();
            var res={locals:{}};

            manager(req, res, function(err){
                if (err) return done(err);

                req.login({username:"user1"});
                expect(req.session).to.deep.equal({ userid: 'user1', fresh: true });

                done();
            });
        });

        it("shoud log the user out when req.logout is called", function(done){
            var manager = mkManager();
            var req=mkReq();
            req.session = { userid: 'user1', fresh: true };
            var res={locals:{}};

            manager(req, res, function(err){
                if (err) return done(err);

                req.logout();
                expect(req.session).to.deep.equal({});

                done();
            });
        });

    });
});
