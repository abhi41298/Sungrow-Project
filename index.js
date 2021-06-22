'use strict'
require('dotenv').config()
const path = require('path')
const mongoose = require('mongoose')
const express = require("express")
const adminRoute = require('./routers/adminRoute')
const userRoute = require('./routers/userRoute')
const searchRoute = require('./routers/searchRoute')
const addRoute = require('./routers/addRoute')
const bodyParser = require('body-parser')
const passport = require('passport');
const session = require('express-session');
const hbs = require('hbs')
const flash = require('connect-flash');

require('./passport')(passport);

const app = express()
mongoose.connect(process.env.CONNECT_URL, { useNewUrlParser: true })
const PORT = process.env.PORT || 3000
app.use(express.static(path.join(__dirname, './public')))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.set("view engine", 'hbs')
hbs.registerPartials(path.join(__dirname, 'views/partials'))
app.use(
    session({
        secret: 'SunGrowLife',
        resave: true,
        saveUninitialized: true
    })
);
app.use(passport.initialize());

app.use(passport.session());

app.use(flash());


app.use(function(req, res, next) {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
});

app.use("/", userRoute)
app.use("/admin", adminRoute)
app.use("/moderator", adminRoute)
app.use("/admin/search", searchRoute)
app.use("/moderator/search", searchRoute)
app.use("/admin/add", addRoute)
app.use("/moderator/add", addRoute)

app.get('*', (req, res) => {
    res.status(404)
    res.render('404')
})


app.listen(PORT, () => {
    console.log("Thanku For Choosing Node")
});