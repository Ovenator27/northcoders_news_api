const { selectArticleById } = require("../models/articles.models");
const {
  insertComment,
  selectCommentsByArticleId,
  removeComment,
  updateComment,
} = require("../models/comments.models");

exports.getCommentsByArticleId = (req, res, next) => {
  const { article_id } = req.params;
  const {limit, p} = req.query
  return Promise.all([
    selectArticleById(article_id),
    selectCommentsByArticleId(article_id, limit, p),
  ])
    .then((returnedPromises) => {
      res.status(200).send({ comments: returnedPromises[1] });
    })
    .catch(next);
};

exports.postComment = (req, res, next) => {
  const { article_id } = req.params;
  const { body } = req;
  return Promise.all([
    selectArticleById(article_id),
    insertComment(article_id, body),
  ])
    .then((returnedPromises) => {
      res.status(201).send({ comment: returnedPromises[1] });
    })
    .catch(next);
};

exports.deleteComment = (req, res, next) => {
  const { comment_id } = req.params;
  removeComment(comment_id)
    .then(() => {
      res.status(204).send();
    })
    .catch(next);
};

exports.patchComment = (req, res, next) => {
  const { body } = req;
  const { comment_id } = req.params;
  updateComment(comment_id, body)
    .then((comment) => {
      res.status(200).send({comment})
    })
    .catch(next);
};
