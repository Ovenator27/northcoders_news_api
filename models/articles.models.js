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
  return db
    .query(
      `SELECT 
  articles.article_id, articles.author, articles.title, articles.topic, articles.created_at, articles.votes, articles.article_img_url, COUNT(comments.comment_id) AS comment_count 
  FROM articles 
  LEFT JOIN comments On articles.article_id = comments.article_id
  GROUP BY articles.article_id
  ORDER BY articles.created_at DESC;`
    )
    .then(({ rows }) => {
      return rows;
    });
};

exports.updateArticle = (articleId, update) => {
    return db.query(`UPDATE articles
    SET
      votes = votes + $1
    WHERE article_id = $2
    RETURNING *;`, [update.inc_votes, articleId]).then(({rows}) => {
        if(rows.length === 0) {
            return Promise.reject({status: 404, msg: 'Article ID not found'})
        }
        return rows[0];
    })
}
