const express = require("express");
const { getTopics } = require("./controllers/topics.controllers");
const {
  serverErrors,
  customErrors,
  psqlErrors,
} = require("./controllers/errors.controllers");
const { getEndpoints } = require("./controllers/api.controllers");
const {
  getArticleById,
  getArticles,
  patchArticle,
} = require("./controllers/articles.controllers");
const {
  postComment,
  getCommentsByArticleId,
  deleteComment,
} = require("./controllers/comments.controllers");
const { getUsers } = require("./controllers/users.controllers");

const app = express();

app.use(express.json());

app.get("/api", getEndpoints);

app.get("/api/topics", getTopics);

app.get("/api/articles", getArticles);

app.get("/api/articles/:article_id", getArticleById);
app.patch("/api/articles/:article_id", patchArticle);

app.get("/api/articles/:article_id/comments", getCommentsByArticleId);
app.post("/api/articles/:article_id/comments", postComment);

app.delete("/api/comments/:comment_id", deleteComment)

app.get('/api/users', getUsers)

app.all("*", (req, res) => {
  res.status(404).send({ msg: "Path not found" });
});

app.use(customErrors);
app.use(psqlErrors);
app.use(serverErrors);

module.exports = app;
