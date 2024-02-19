const { selectArticleById, SelectArticles } = require("../models/articles.models");

exports.getArticleById = (req, res, next) => {
  const { article_id } = req.params;
  selectArticleById(article_id)
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch(next);
};

exports.getArticles = (req, res, next) => {
  SelectArticles().then((articles) => {
    res.status(200).send({articles})
  })
}
