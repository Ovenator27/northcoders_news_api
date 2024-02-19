const express = require("express");
const { getTopics } = require("./controllers/topics.controllers");
const { serverErrors } = require("./controllers/errors.controllers");

const app = express();

app.get('/api/topics', getTopics)

app.all('*', (req, res) => {
    res.status(404).send({msg: 'Path not found'})
})

app.use(serverErrors)

module.exports = app;
