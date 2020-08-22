const db = require("../db/index");
const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const security = require('../security/jwt');

router.get('/', security.verifyToken, security.validateToken, (req, res) => {
    
    let sql = "select * from exercise order by exercise_id";
    db.query(sql, (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).send({ 'msg': err });
        } else {
            res.send(result.rows);
        }
    });
});

module.exports = router;