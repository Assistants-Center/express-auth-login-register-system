const express = require('express');
const app = express();
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const bodyParser = require('body-parser');
const config = require('./config.js');

app.set('view engine', 'ejs');
app.use('*', express.static('static'));
let twhour = 3600000 * 12;
app.use(session({
    secret: '48738924783gdsgdgdgddgs7482737dgsdg42398747238gdgsgds',
    resave: true,
    saveUninitialized: true,
    cookie: {
        expires: new Date(Date.now() + twhour),
        maxAge: twhour
    },
    store: new FileStore
}));
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());

app.use('/auth', require('./routes/auth'));

app.get('/login', (req,res) => {
  if(req.session.user)return res.redirect('/');
  res.render('login', {req});
});

app.get('/register', (req,res) => {
  if(req.session.user)return res.redirect('/');
  res.render('register', {req});
});

app.get('/logout', (req,res) => {
  req.session.destroy();
  res.redirect('/');
});

app.get('*', (req,res) => {
  res.render('index', {req});
})

app.listen(config.port, () => {
  console.log(`Listening on port ${config.port}!`);
}); 
