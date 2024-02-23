const {
  selectArticleById,
  selectArticles,
  updateArticle,
  insertArticle,
  removeArticle,
  selectArticlesByTopic,
} = require("../models/articles.models");

exports.getArticleById = (req, res, next) => {
  const { article_id } = req.params;
  selectArticleById(article_id)
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch(next);
};

exports.getArticles = (req, res, next) => {
  const { topic, sort_by, order, limit, p } = req.query;
  selectArticles(topic, sort_by, order, limit, p)
    .then(([rowCount, { rows }]) => {
      res.status(200).send({ articles: rows, total_count: rowCount });
    })
    .catch(next);
};

exports.patchArticle = (req, res, next) => {
  const { article_id } = req.params;
  const { body } = req;
  updateArticle(article_id, body)
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch(next);
};

exports.postArticle = (req, res, next) => {
  const { body } = req;
  insertArticle(body)
    .then((newArticle) => {
      const { article_id } = newArticle;
      return selectArticleById(article_id);
    })
    .then((article) => {
      res.status(201).send({ article });
    })
    .catch(next);
};

exports.deleteArticle = (req, res, next) => {
  const { article_id } = req.params;
  removeArticle(article_id)
    .then(() => {
      res.status(204).send();
    })
    .catch(next);
};

exports.getArticlesByTopic = (req, res, next) => {
  const { topic } = req.params;
  selectArticlesByTopic(topic)
    .then((articles) => {
      res.status(200).send({ articles });
    })
    .catch(next);
};
