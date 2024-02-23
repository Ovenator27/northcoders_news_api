const {
  selectArticlesByTopic,
  removeArticle,
} = require("../models/articles.models");
const {
  selectTopics,
  insertTopic,
  removeTopic,
} = require("../models/topics.models");

exports.getTopics = (req, res, next) => {
  selectTopics().then((topics) => {
    res.status(200).send({ topics });
  });
};

exports.postTopic = (req, res, next) => {
  const { body } = req;
  insertTopic(body)
    .then((topic) => {
      res.status(201).send({ topic });
    })
    .catch(next);
};

exports.deleteTopic = (req, res, next) => {
  const { topic } = req.params;
  return selectArticlesByTopic(topic)
    .then((articles) => {
      return Promise.all(articles.map(({ article_id }) => {
        return removeArticle(article_id);
      }));
    })
    .then(() => {
      removeTopic(topic);
    })
    .then(() => {
      res.status(204).send();
    })
    .catch(next);
};
