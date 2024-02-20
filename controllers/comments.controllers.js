const { selectArticleById } = require("../models/articles.models");
const {
  insertComment,
  selectCommentsByArticleId,
} = require("../models/comments.controllers");

exports.getCommentsByArticleId = (req, res, next) => {
  const { article_id } = req.params;
  return Promise.all([
    selectCommentsByArticleId(article_id),
    selectArticleById(article_id),
  ])
    .then((returnedPromises) => {
      res.status(200).send({ comments: returnedPromises[0] });
    })
    .catch(next);
};

exports.postComment = (req, res, next) => {
  const { article_id } = req.params;
  const { body } = req;
  insertComment(article_id, body)
    .then((comment) => {
      res.status(201).send({ comment });
    })
    .catch(next);
};
