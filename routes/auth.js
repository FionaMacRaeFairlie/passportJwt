const express = require('express');
const router  = express.Router();

const jwt      = require('jsonwebtoken');
const passport = require('passport');

/* POST login. */
router.post('/login', function (req, res, next) {
   
    passport.authenticate('local', {session: false}, (err, user, info) => {
      
        if (err || !user) {
            return res.status(400).json({
                message: info ? info.message : 'Login failed',
                user   : user
            });
        }

        req.login(user, {session: false}, (err) => {
            if (err) {
                res.send(err);
            }
            console.log(info)
            const token = jwt.sign(user[0] ,'your_jwt_secret');
            res.cookie("jwt", token);
            return res.json({info, token});
        
        });
       
    })
    (req, res);

});

router.get("/logout", function (req, res) {
    res.clearCookie("jwt").status(200).redirect("/");
  });

module.exports = router;