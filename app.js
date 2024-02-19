const express = require("express");
const { getTopics } = require("./controllers/topics.controllers");
const { serverErrors, customErrors, psqlErrors } = require("./controllers/errors.controllers");
const { getEndpoints } = require("./controllers/api.controllers");
const { getArticleById, getArticles, getCommentsById, postComment } = require("./controllers/articles.controllers");

const app = express();

app.use(express.json())

app.get('/api', getEndpoints)

app.get('/api/topics', getTopics)

app.get('/api/articles', getArticles)

app.get('/api/articles/:article_id', getArticleById)

app.get('/api/articles/:article_id/comments', getCommentsById)
app.post('/api/articles/:article_id/comments', postComment)

app.all('*', (req, res) => {
    res.status(404).send({msg: 'Path not found'})
})

app.use(customErrors)
app.use(psqlErrors)
app.use(serverErrors)

module.exports = app;
