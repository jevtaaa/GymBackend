const db = require("../db/index");
const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const security = require('../security/jwt');

router.use(bodyParser());

//klijent koristi
router.get('/', security.verifyToken, security.validateTokenClient, (req, res) => { 
    this.client_id = req.res.locals.id;
    
    let sql = "select date, training_id, comment from history where client_id = $1 order by date";

    db.query(sql, [client_id], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).send({ 'msg': err });
        }
        res.send(result.rows);
    });
});

//klijent koristi za dodavanje istorije
router.put('/add-history', security.verifyToken, security.validateTokenClient, (req, res) => {
    let client_id = req.res.locals.id;
    let training_id = req.body.training_id;
    let date = new Date();
    let comment = req.body.comment;

    if(this.comment == undefined){
        this.comment = "No comment";
    }
 
    let sql = "insert into history values ($1, $2, $3, $4)";

    db.query(sql, [date, client_id, training_id, comment], (err) => {
        if (err) {
            console.log(err);
            return res.status(500).send({ 'msg': err });
        }
        let sql1 = "select date, training_id, comment from history where client_id = $1";
        db.query(sql1, [client_id], (err, result) => {
            if(err){
                console.log(err);
                return res.status(500).send({'msg': err});
            }          
            res.status(200).send(result.rows);
        });       
    });
});

//trener koristi
router.get('/client-history/:id', security.verifyToken, security.validateToken, (req, res) => { 
    let client_id = req.params.id;
    
    let sql = "select date, training_id, comment from history where client_id = $1 order by date";

    db.query(sql, [client_id], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).send({ 'msg': err });
        }
        res.send(result.rows);
    });
});

module.exports = router;