const db = require("../db/connection");
const { convertTimestampToDate } = require("../db/seeds/utils");

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

exports.selectCommentsById = (articleId) => {
  return db
    .query(`SELECT * FROM articles WHERE article_id = $1`, [articleId])
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Article ID not found" });
      }
      return db
        .query(
          `SELECT * FROM comments 
    WHERE article_id = $1 
    ORDER BY created_at DESC`,
          [articleId]
        )
        .then(({ rows }) => {
          if (rows.length === 0) {
            return Promise.reject({ status: 404, msg: "No comments found for article ID" });
          }
          return rows;
        });
    });
};

exports.insertComment = (articleId, comment) => {
  const { username, body } = comment;
  return db.query(`SELECT * FROM articles WHERE article_id = $1`, [articleId]).then(({rows}) => {
    if (rows.length === 0) {
        return Promise.reject({status: 404, msg: 'Article ID not found'})
    }
    return db
    .query(
      `INSERT INTO comments (
        body, votes, author, article_id)
        VALUES
        ($1, 0, $2, $3) RETURNING *;`,
      [body, username, articleId]
    )
    .then(({ rows }) => {
      return rows[0];
    });
  })
  
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
