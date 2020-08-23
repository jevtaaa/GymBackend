const db = require("../db/index");
const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const security = require('../security/jwt');

router.use(bodyParser());

router.get('/', security.verifyToken, security.validateToken, (req, res) => {
    var sql = "select client_id, name, surname, email, username, bio, training_id, height, weight from client where coach_id = $1 order by client_id";

    db.query(sql, [req.res.locals.id], (err, result) => {

        if (err) {
            console.log(err);
            return res.status(500).send({ 'msg': err });
        } else {

            res.send(result.rows);
        }
    });
});

router.patch('/login', (req, res) => {

    let username = req.body.username;
    let password = req.body.password;

    let sql = "SELECT * FROM client where username=$1 and password = $2";

    db.query(sql, [username, password], (err, result) => {
        if (err) {
            console.log(err);
            res.sendStatus(400);
            return;
        }

            if (result.rowCount === 1) {

                let token = jwt.sign({ id: result.rows[0].client_id, username: username }, 'gym');
                let sql = "update client set token = $1 where username = $2 and password = $3 returning *";

                db.query(sql, [token, username, password], (err, result) => {
                    if (err) {
                        res.sendStatus(400);
                        return;
                    }
                    console.log(result.rows[0]);
                    res.status(200).send(result.rows[0]);
                })

            } else {
                res.status(404).send({'msg': "No results"});
            }
    });
});

//klijent koristi
router.put('/register', (req, res) => {
    let name = req.body.name;
    let surname = req.body.surname;
    let email = req.body.email;
    let username = req.body.username;
    let password = req.body.password;
    let bio = req.body.bio;
    let coach_id = req.body.coach_id;
    let weight = req.body.weight;
    let height = req.body.height;

    if(bio == undefined){
        this.bio = "No bio"
    }
    if(coach_id == undefined || weight == undefined || height == undefined || username === undefined || name === undefined || 
        surname === undefined || email === undefined || password ===undefined){
        return res.status(500).send({'msg': "You must enter all fields"});
    }

    let sql2 = `select * from client where username = '${username}'`;
    db.query(sql2, (err, result) => {
        if(err){
            console.log(err);
            return res.status(500).send({'msg': err});
        }
        if(result.rows[0] != undefined) {
            return res.status(500).send({'msg': "Someone already has that username!"});
        }
        let sql1 = "insert into client (name, surname, email, username, password, bio, coach_id, height, weight) values ($1, $2, $3, $4, $5, $6, $7, $8, $9)";
        db.query(sql1, [name, surname, email, username, password, bio, coach_id, height, weight], (err, result) =>{
            if(err){
                console.log(err);
                return res.status(500).send({'msg': err});
            }
    
            res.status(200).send();
        });
    });  
});

//klijent koristi
router.put('/edit', security.verifyToken, security.validateTokenClient, (req, res) => {
    let client_id = req.res.locals.id;
    let email = req.body.email;
    let password = req.body.password;
    let username = req.body.username;
    let name = req.body.name;
    let surname = req.body.surname;
    let bio = req.body.bio;
    let weight = req.body.weight;
    let height = req.body.height;

    
    if(bio == undefined){
        this.bio = ""
    }
    if(weight == undefined || height == undefined || username === undefined || name === undefined || surname === undefined || email === undefined || password ===undefined){
        return res.status(500).send({'msg': "MISSING FIELDS"});
    }

    let sql = `select * from client where client_id=$1 and password = '${password}'`;
    db.query(sql, [client_id], (err, result) => {
        if(err){
            console.log(err);
            return res.status(500).send({'msg': err});
        }
        if(result.rows[0] != undefined) {
            return res.status(500).send({'msg': "You cannot use the same password as before!"});
        }
        let sql_update = "update client set name = $1, surname =$2, email=$3, password=$4, username=$5, bio=$6, height=$7, weight=$8 where client_id=$9";
        db.query(sql_update, [name, surname, email, password, username, bio, height, weight, client_id], (err, result) =>{
            if(err){
                console.log(err);
                return res.status(500).send({'msg': err});
            }
            let sql2 = "select * from client where client_id=$1";
            db.query(sql2, [client_id], (err, result) => {
                if(err){
                    console.log(err);
                    return res.status(500).send({'msg': err});
                } 
                res.status(200).send(result.rows[0]);
            });
        });
    });  
});

//trener koristi
router.put('/update-client-training', security.verifyToken, security.validateToken, (req, res) => {
    let client_id = req.body.client_id;
    let training_id = req.body.training_id;

    let sql = "update client set training_id = $1 where client_id = $2";

    db.query(sql, [training_id, client_id], (err) => {
        if (err) {
            console.log(err);
            return res.status(500).send({ 'msg': err });
        }
        let sql1 = "select * from client where client_id=$1";
        db.query(sql1, [client_id], (err, result) => {
            if(err){
                console.log(err);
                return res.status(500).send({'msg': err});
            }  
            res.send(result.rows[0]);
        });       
    });
});



module.exports = router;