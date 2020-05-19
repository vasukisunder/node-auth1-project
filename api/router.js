const bcryptjs = require('bcryptjs');
const router = require("express").Router();
const db = require("../data/db");
const { isValid , restricted } = require('./services');

router.post("/register", (req, res) => {
    const credentials = req.body;

    if (isValid(credentials)){
        const rounds = process.env.BCRYPT_ROUNDS || 8;
    const hash = bcryptjs.hashSync(credentials.password, rounds);

    credentials.password = hash;

    db("users").insert(credentials)
    .then(id => {
        console.log(id);

        db("users").where({id: id[0] })
        .then(post => {
            req.session.loggedIn = true;
            req.session.user = post;
            res.status(201).json(post);
        })
        .catch(err => {
            res.json(err);
        })
    })
    .catch(err => {
        res.json(err);
    })
    }
    else {
        res.status(400).json({msg: 'please provide username and password - must be string'})
    }
    
})     


router.get("/users", restricted, (req, res) => {
    db("users")
    .then(data => {
        res.json(data);
    })
    .catch(err => {
        res.status(500).json(err);
    })
})

router.post("/login", (req, res) => {
    const {username, password} = req.body;

    if (isValid(req.body)){
        db("users").where({ username }).first()
    .then(user => {
        console.log(user);
        if (user && bcryptjs.compareSync(password, user.password)) {

            req.session.loggedIn = true;
            req.session.user = user;

            res.status(200).json({ message: `Welcome ${user.username}!` });
          } else {
            res.status(401).json({ message: 'Invalid Credentials' });
          }
        })
        .catch(error => {
          res.status(500).json(error);
        });

    }
    else {
        res.status(400).json({msg: 'please provide username and password - must be string'})
    }

    
    }); 

router.get('/logout', (req, res) => {
    if (req.session) {
        req.session.destroy(err => {
            if (err){
                res.status(500).json({msg: "could not log out"})
            }
            else {
                res.status(204).end();
            }
        })
    }
    else {
        res.status(204).end();
    }
})

module.exports = router;