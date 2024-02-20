const db = require('../db/connection')

exports.selectCommentsByArticleId = (articleId) => {
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
};

exports.insertComment = (articleId, comment) => {
  const { username, body } = comment;
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
};
