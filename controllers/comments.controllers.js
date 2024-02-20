const { selectCommentsById, insertComment } = require("../models/comments.controllers");

exports.getCommentsById = (req, res, next) => {
    const { article_id } = req.params;
    selectCommentsById(article_id)
      .then((comments) => {
        res.status(200).send({ comments });
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