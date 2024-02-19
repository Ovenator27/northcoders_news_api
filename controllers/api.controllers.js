const { readEndpoints } = require("../models/api.models")

exports.getEndpoints = (req, res, next) => {
    readEndpoints().then((endpoints) => {
        res.status(200).send({endpoints});
    })
}