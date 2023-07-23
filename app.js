require('dotenv').config();
const express = require("express");
const expresslayout = require('express-ejs-layouts');
const methodOverride = require('method-override');
const cookieparser = require('cookie-parser');
const MongoStore = require('connect-mongo');
const connectDB = require('./server/config/db');
const session = require('express-session');
const app = express();
const port = process.env.PORT || 5000;

// connect database
connectDB();

// adding middleware for get post data from form
app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(cookieparser());
app.use(session({
    secret:"keyboardd cat",
    resave: false,
    saveUninitialized:true,
    store:MongoStore.create({
        mongoUrl:process.env.MONGODB_URI
    }),
}))

// static file setup
app.use(express.static('public'));

// template engine
app.use(expresslayout);
app.set('layout','./layouts/main');
app.set('view engine','ejs');

app.use('/',require('./server/routes/main'))
app.use('',require('./server/routes/admin'))


app.listen(port,()=>{
    console.log(`NodejsBlog is listening on http://localhost:${port}/`);
})