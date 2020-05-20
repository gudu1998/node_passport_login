const LocalStrategy = require('passport-local').Strategy
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

// Load User model
const User = require('../models/User')

module.exports = function (passport) {
    passport.use(
        new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
            // Match user
            User.findOne({ email: email }, (err, user) => {
                if (err) throw err

                if (!user) {
                    return done(null, false, { message: 'Email is not registered' })
                }

                // Match Password
                bcrypt.compare(password, user.password, (err, isMatch) => {
                    if (err) throw err

                    if (isMatch) {
                        return done(null, user)
                    } else {
                        return done(null, false, { message: 'Password incorrect' })
                    }
                })
            })
        })
    )

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser((id, done) => {
        User.findById(id, (err, user) => {
            done(err, user);
        });
    });
}
