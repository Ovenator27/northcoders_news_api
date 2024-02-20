const db = require("../db/connection");

exports.selectArticleById = (articleId) => {
  return db
    .query(
      `SELECT 
    articles.article_id, articles.author, articles.title, articles.topic, articles.body, articles.created_at, articles.votes, articles.article_img_url, COUNT(comments.comment_id)::INT AS comment_count 
    FROM articles 
    LEFT JOIN comments On articles.article_id = comments.article_id
    WHERE articles.article_id = $1
    GROUP BY articles.article_id`,
      [articleId]
    )
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Article ID not found" });
      }
      return rows[0];
    });
};

exports.selectArticles = (topic, sort_by = "created_at", order = "desc") => {
  if (
    ![
      "article_id",
      "author",
      "title",
      "topic",
      "created_at",
      "votes",
      "article_img_url",
      "comment_count",
    ].includes(sort_by) ||
    !["asc", "desc"].includes(order)
  ) {
    return Promise.reject({ status: 400, msg: "Bad request" });
  }

  const queryValues = [];
  let queryStr = `SELECT 
  articles.article_id, articles.author, articles.title, articles.topic, articles.created_at, articles.votes, articles.article_img_url, COUNT(comments.comment_id)::INT AS comment_count 
  FROM articles 
  LEFT JOIN comments On articles.article_id = comments.article_id`;

  if (topic) {
    queryValues.push(topic);
    queryStr += ` WHERE topic = $1`;
  }

  queryStr += ` GROUP BY articles.article_id
  ORDER BY articles.${sort_by} ${order};`;
  return db.query(queryStr, queryValues).then(({ rows }) => {
    return rows;
  });
};

exports.updateArticle = (articleId, update) => {
  return db
    .query(
      `UPDATE articles
    SET
      votes = votes + $1
    WHERE article_id = $2
    RETURNING *;`,
      [update.inc_votes, articleId]
    )
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Article ID not found" });
      }
      return rows[0];
    });
};
