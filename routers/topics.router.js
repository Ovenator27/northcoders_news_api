const { getArticleByTopic } = require("../controllers/articles.controllers");
const { getTopics, postTopic } = require("../controllers/topics.controllers");

const topicsRouter = require("express").Router();

topicsRouter.route("/").get(getTopics).post(postTopic);

topicsRouter.route('/:topic').get(getArticleByTopic)

module.exports = topicsRouter;
