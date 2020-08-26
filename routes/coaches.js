const db = require("../db/index");
const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const security = require('../security/jwt');

router.use(bodyParser());

router.patch('/login', (req, res) => {

    let username = req.body.username;
    let password = req.body.password;

    let sql = "SELECT * FROM coach where username=$1 and password = $2";

    db.query(sql, [username, password], (err, result) => {
        if (err) {
            console.log(err);
            res.sendStatus(400);
            return;
        }

            if (result.rowCount === 1) {

                let token = jwt.sign({ id: result.rows[0].coach_id, username: username }, 'gym');
                let sql = "update coach set token = $1 where username = $2 and password = $3 returning *";

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

router.get('/:id', security.verifyToken, security.validateTokenClient, (req, res) => {
    let coach_id = req.params.id;

    let sql = "select coach_id, username, name, surname, email, bio from coach where coach_id = $1";
    db.query(sql, [coach_id], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).send({ 'msg': err });
        } else {
            res.send(result.rows[0]);
        }
    });
});

router.put('/edit', security.verifyToken, security.validateToken, (req, res) => {
    let coach_id = req.res.locals.id;
    let email = req.body.email;
    let password = req.body.password;
    let username = req.body.username;
    let name = req.body.name;
    let surname = req.body.surname;
    let bio = req.body.bio;

    if(bio == undefined){
        this.bio = ""
    }
    if(username === undefined || name === undefined || surname === undefined || email === undefined || password ===undefined){
        return res.status(500).send({'msg': "MISSING FIELDS"});
    }

    let sql = `select * from coach where coach_id=$1 and password = '${password}'`;
    db.query(sql, [coach_id], (err, result) => {
        if(err){
            console.log(err);
            return res.status(500).send({'msg': err});
        }
        if(result.rows[0] != undefined) {
            return res.status(500).send({'msg': "You cannot use the same password as before!"});
        }
        let sql_update = "update coach set name = $1, surname =$2, email=$3, password=$4, username=$5, bio=$6 where coach_id=$7";
        db.query(sql_update, [name, surname, email, password, username, bio, coach_id], (err, result) =>{
            if(err){
                console.log(err);
                return res.status(500).send({'msg': err});
            }
            let sql2 = "select * from coach where coach_id=$1";
            db.query(sql2, [coach_id], (err, result) => {
                if(err){
                    console.log(err);
                    return res.status(500).send({'msg': err});
                } 
                res.status(200).send(result.rows[0]);
            });
        });
    });  
});

module.exports = router;