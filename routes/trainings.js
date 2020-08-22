const db = require("../db/index");
const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const security = require('../security/jwt');

router.use(bodyParser());

router.get('/', security.verifyToken, security.validateToken, (req, res) => {
    getAllTrainings(req.res.locals.id, res);
});

router.get('/single', security.verifyToken, security.validateToken, (req, res) => {
    let training_id = req.body.training_id;

    let sql = "select * from training where training_id = $1 and coach_id = $2";
    db.query(sql, [training_id, req.res.locals.id], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).send({ 'msg': err });
        } else {
            res.send(result.rows);
        }
    });
});

router.get('/details/:id', security.verifyToken, security.validateToken, (req, res) => {
    let training_id = req.params.id;
    let sql = "select ex.exercise_id, ex.name, ex.description, te.repetitions, te.effort from training_exercises te join exercise ex on (te.exercise_id = ex.exercise_id) where te.training_id = $1";
    db.query(sql, [training_id], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).send({ 'msg': err });
        } else {
            res.send(result.rows);
        }
    });
});

router.put('/save', security.verifyToken, security.validateToken, (req, res) => {
    let coach_id = req.res.locals.id;
    let name = req.body.name;
    let description = req.body.description;
    let date = new Date();
    let exercises = req.body.exercises;

    let sql = "insert into training (name, description, date, coach_id) values ($1,$2,$3,$4) returning training_id";
    db.query(sql, [name, description, date, coach_id], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).send({ 'msg': err });
        } else {
            let training_id = result.rows[0].training_id;
            console.log(training_id);
            exercises.forEach(element => {
                let sql2 = "insert into training_exercises values ($1, $2, $3, $4)";
                db.query(sql2, [training_id, element.exercise_id, element.repetitions, element.effort], (err, result) => {
                    if (err) {
                        console.log(err);
                        return res.status(500).send({ 'msg': err });
                    }
                });
            });
            res.status(200).send();
        }
    });
});

router.put('/edit', security.verifyToken, security.validateToken, (req, res) => {
    let training_id = req.body.training_id;
    let name = req.body.name;
    let description = req.body.description;
    let date = new Date();
    let exercises = req.body.exercises;

    console.log(exercises);
    let sql = "update training set name=$1, description=$2, date=$3 where training_id=$4";
    db.query(sql, [name, description, date, training_id], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).send({ 'msg': err });
        } else {
            let sql2 = "delete from training_exercises where training_id = $1";
            db.query(sql2, [training_id], (err, result) => {
                if (err) {
                    console.log(err);
                    return res.status(500).send({ 'msg': err });
                } else {
                    exercises.forEach(element => {
                        let sql3 = "insert into training_exercises values ($1, $2, $3, $4)";
                        db.query(sql3, [training_id, element.exercise_id, element.repetitions, element.effort], (err, result) => {
                            if (err) {
                                console.log(err);
                                return res.status(500).send({ 'msg': err });
                            }
                        });
                    });
                    res.status(200).send();
                }
            });
        }
    });
});

router.delete('/delete/:id', security.verifyToken, security.validateToken, (req, res) => {
    let training_id = req.params.id;

    let sql = "update training set archived = true where training_id=$1";
    db.query(sql, [training_id], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).send({ 'msg': err });
        } else {
            res.status(200).send({'msg': "Successful delete of training"})
        }
    });
});

function getAllTrainings(coach_id, res){

    let sql = "select * from training where coach_id = $1 and archived = false order by training_id";

    db.query(sql, [coach_id], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).send({ 'msg': err });
        } else {
            res.send(result.rows);
        }
    });
}



module.exports = router;