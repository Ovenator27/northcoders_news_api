const { selectArticleById } = require("../models/articles.models");
const {
  insertComment,
  selectCommentsByArticleId,
} = require("../models/comments.models");

exports.getCommentsByArticleId = (req, res, next) => {
  const { article_id } = req.params;
  return Promise.all([
    selectArticleById(article_id),
    selectCommentsByArticleId(article_id)
  ])
    .then((returnedPromises) => {
      res.status(200).send({ comments: returnedPromises[1] });
    })
    .catch(next);
};

exports.postComment = (req, res, next) => {
  const { article_id } = req.params;
  const { body } = req;
  return Promise.all([selectArticleById(article_id), insertComment(article_id, body)])
    .then((returnedPromises) => {
      res.status(201).send({ comment: returnedPromises[1] });
    })
    .catch(next);
};
