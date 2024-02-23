const { getArticlesByTopic } = require("../controllers/articles.controllers");
const { getTopics, postTopic, deleteTopic } = require("../controllers/topics.controllers");

const topicsRouter = require("express").Router();

topicsRouter.route("/").get(getTopics).post(postTopic);

topicsRouter.route('/:topic')
.get(getArticlesByTopic)
.delete(deleteTopic)

module.exports = topicsRouter;
