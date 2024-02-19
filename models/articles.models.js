const db = require("../db/connection");

exports.selectArticleById = (articleId) => {
  return db
    .query(`SELECT * FROM articles WHERE article_id = $1`, [articleId])
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Article not found" });
      }
      return rows[0];
    });
};

exports.selectArticles = () => {
  return db.query(`SELECT 
  articles.article_id, articles.author, articles.title, articles.topic, articles.created_at, articles.votes, articles.article_img_url, COUNT(comments.comment_id) AS comment_count 
  FROM articles 
  LEFT JOIN comments On articles.article_id = comments.article_id
  GROUP BY articles.article_id
  ORDER BY articles.created_at DESC;`)
  .then(({rows}) => {
    return rows;
  });
};

exports.selectCommentById = (articleId) => {
    return db.query(`SELECT * FROM comments 
    WHERE article_id = $1 
    ORDER BY created_at DESC`, [articleId]).then(({rows})=> {
        if (rows.length === 0) {
            return Promise.reject({status: 404, msg: 'Comment not found'})
        }
        return rows;
    })
}