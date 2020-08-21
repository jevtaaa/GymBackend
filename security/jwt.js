const db = require("../db/index");
const jwt = require('jsonwebtoken');



function verifyToken(req, res, next) {

    const bearerToken = req.headers['authorization'];

    console.log(req.body)

    if (bearerToken !== undefined) {
        const bearer = bearerToken.split(' ');
        const token = bearer[1];
        jwt.verify(token, 'gym', (err, decoded) => {
            if (err) {

                res.sendStatus(403);
                return;
            }

            res.locals.id = decoded.id;
            res.locals.token = token;
            next();


        });
    } else {

        res.sendStatus(403);
    }
}

function validateToken(req, res, next) {

    coach_id = req.res.locals.id;
    token = req.res.locals.token;

    if (coach_id === undefined | token === undefined) {
        res.sendStatus(403);
        return;
    }

    let sql = "select * from coach where coach_id = $1 and token = $2"

    db.query(sql, [coach_id, token], (err, response) => {
        if (err || response.rowCount !== 1) {
            res.sendStatus(403);
            return;
        }
        next();
    })
}

function validateTokenClient(req, res, next) {

    client_id = req.res.locals.id;
    token = req.res.locals.token;

    if (client_id === undefined | token === undefined) {
        res.sendStatus(403);
        return;
    }

    let sql = "select * from client where client_id = $1 and token = $2"

    db.query(sql, [client_id, token], (err, response) => {
        if (err || response.rowCount !== 1) {
            res.sendStatus(403);
            return;
        }
        next();
    })
}

module.exports = {
    verifyToken,
    validateToken,
    validateTokenClient
}