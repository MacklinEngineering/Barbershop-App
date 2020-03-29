module.exports = function(app, passport, db) {

// normal routes ===============================================================
//        1st Get
    // Order Page
    app.get('/', function(req, res) {
        res.render('login&order.ejs');
    });
//          2nd Get
    // Barista Profile =========================
    app.get('/vieworders', isLoggedIn, function(req, res) {
        db.collection('orders').find().toArray((err, result) => {
          if (err) return console.log(err)
          res.render('vieworders.ejs', {
            user : req.user,
            orders: result
          })
        })
    });
//        3rd Get
    // LOGOUT ==============================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

    app.get('/listOrders', function(req, res) {
      db.collection('orders').find().toArray((err, result) => {
        if (err) return console.log(err)
        res.send({          
          user : req.user,
          orders: result
        })
      })
  });

// 1st Post Request     =================================================
    // Order Form ROute
    app.post('/vieworders', (req, res) => {
      db.collection('orders').save({name: req.body.name, order: req.body.order, complete: false, barista: null}, (err, result) => {
        if (err) return console.log(err)
        console.log('saved to database')
        res.redirect('/vieworders')
      })
    })
// Update Order Complete By Barista ==========================================
//      1st Put request
    app.put('/orders', (req, res) => {
      db.collection('orders')
      .findOneAndUpdate({name: req.body.name, order: req.body.order,}, {
        $set: {
          complete: true,
          barista: req.body.barista
          
        }
      }, {
        sort: {_id: -1},
        upsert: true
      }, (err, result) => {
        if (err) return res.send(err)
        res.send(result)
      })
    })

    // app.put('/thumbDown', (req, res) => {
    //   db.collection('messages')
    //   .findOneAndUpdate({name: req.body.name, msg: req.body.msg}, {
    //     $set: {
    //       thumbUp:req.body.thumbUp - 1
    //     }
    //   }, {
    //     sort: {_id: -1},
    //     upsert: true
    //   }, (err, result) => {
    //     if (err) return res.send(err)
    //     res.send(result)
    //   })
    // })

    // app.delete('/messages', (req, res) => {
    //   db.collection('messages').findOneAndDelete({name: req.body.name, msg: req.body.msg}, (err, result) => {
    //     if (err) return res.send(500, err)
    //     res.send('Message deleted!')
    //   })
    // })

// =============================================================================
// AUTHENTICATE (FIRST LOGIN) ==================================================
// =============================================================================

    // locally --------------------------------
        // LOGIN ===============================
        // show the login form
        app.get('/login', function(req, res) {
            res.render('login.ejs', { message: req.flash('loginMessage') });
        });

        // process the login form
        app.post('/login', passport.authenticate('local-login', {
            successRedirect : '/vieworders', // redirect to the secure profile section
            failureRedirect : '/login', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

        // SIGNUP =================================
        // show the signup form
        app.get('/signup', function(req, res) {
            res.render('signup.ejs', { message: req.flash('signupMessage') });
        });

        // process the signup form
        app.post('/signup', passport.authenticate('local-signup', {
            successRedirect : '/vieworders', // redirect to the secure profile section
            failureRedirect : '/signup', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

// =============================================================================
// UNLINK ACCOUNTS =============================================================
// =============================================================================
// used to unlink accounts. for social accounts, just remove the token
// for local account, remove email and password
// user account will stay active in case they want to reconnect in the future

    // local -----------------------------------
    app.get('/unlink/local', isLoggedIn, function(req, res) {
        var user            = req.user;
        user.local.email    = undefined;
        user.local.password = undefined;
        user.save(function(err) {
            res.redirect('/vieworders');
        });
    });

};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.redirect('/');
}
