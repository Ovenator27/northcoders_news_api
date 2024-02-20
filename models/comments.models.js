const db = require("../db/connection");

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

exports.removeComment = (commentId) => {
  return db
    .query(`DELETE FROM comments WHERE comment_id = $1;`, [commentId])
    .then(({ rowCount }) => {
      if (rowCount === 0) {
        return Promise.reject({ status: 404, msg: "Comment ID not found" });
      }
    });
};

exports.updateComment = (commentId, update) => {
  return db
    .query(
      `UPDATE comments
  SET
    votes = votes + $1
  WHERE comment_id = $2
  RETURNING *;`,
      [update.inc_votes, commentId]
    )
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Comment ID not found" });
      }
      return rows[0];
    });
};
