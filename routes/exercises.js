const db = require("../db/index");
const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const security = require('../security/jwt');

router.use(bodyParser());

router.get('/', security.verifyToken, security.validateToken, (req, res) => {
    
    let sql = "select * from exercise where archived=false order by exercise_id";
    db.query(sql, (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).send({ 'msg': err });
        } else {
            res.send(result.rows);
        }
    });
});

router.put('/save', security.verifyToken, security.validateToken, (req, res) => {
    
    let name = req.body.name;
    let description = req.body.description;

    let sql = "insert into exercise (name, description, coach_id, archived) values ($1,$2,$3,$4) returning exercise_id";
    db.query(sql, [name, description, req.res.locals.id, false], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).send({ 'msg': err });
        }
        let exercise_id = result.rows[0].exercise_id;
        let sql2 = "select * from exercise where exercise_id=$1";
            db.query(sql2, [exercise_id], (err, result) => {
                if(err){
                    console.log(err);
                    return res.status(500).send({'msg': err});
                } 
            res.send(result.rows[0]);
        });

    });
});

router.delete('/delete/:id', security.verifyToken, security.validateToken, (req, res) => {
    let exercise_id = req.params.id;

    let sql = "update exercise set archived = true where exercise_id=$1";
    db.query(sql, [exercise_id], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).send({ 'msg': err });
        } else {
            res.send({'msg': "Successful delete of exercise"});
        }
    });
});

module.exports = router;