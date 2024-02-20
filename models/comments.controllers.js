const db = require('../db/connection')

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
          return rows;
        });
    });
};

exports.insertComment = (articleId, comment) => {
  const { username, body } = comment;
  return db
    .query(`SELECT * FROM articles WHERE article_id = $1`, [articleId])
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Article ID not found" });
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
    });
};
