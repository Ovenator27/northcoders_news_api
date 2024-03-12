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

exports.selectArticles = (
  topic,
  sort_by = "created_at",
  order = "desc",
  limit = 10,
  page = 1
) => {
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
  const offset = (page - 1) * limit;
  let queryStr = `SELECT 
  articles.article_id, articles.author, articles.title, articles.topic, articles.created_at, articles.votes, articles.article_img_url, COUNT(comments.comment_id)::INT AS comment_count 
  FROM articles 
  LEFT JOIN comments On articles.article_id = comments.article_id`;

  if (topic) {
    queryValues.push(topic);
    queryStr += ` WHERE topic = $1`;
  }

  queryStr += ` GROUP BY articles.article_id
  ORDER BY articles.${sort_by} ${order}`;

  return db
    .query(queryStr, queryValues)
    .then(({ rows }) => {
      queryValues.push(limit);
      queryStr += ` LIMIT $${queryValues.length}`;

      queryValues.push(offset);
      queryStr += ` OFFSET $${queryValues.length}`;

      const paginatedRows = db.query(queryStr, queryValues);

      return Promise.all([rows.length, paginatedRows]);
    })
    .then((promises) => {
      return promises;
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

exports.insertArticle = (article) => {
  const { author, title, body, topic } = article;
  return db
    .query(
      `INSERT INTO articles 
  (author, title, body, topic, votes)
  VALUES
  ($1, $2, $3, $4, 0) RETURNING *;`,
      [author, title, body, topic]
    )
    .then(({ rows }) => {
      return rows[0];
    });
};

exports.removeArticle = (articleId) => {
  return db
    .query(
      `DELETE FROM comments 
  WHERE article_id = $1
  RETURNING *;`,
      [articleId]
    )
    .then(({ rows }) => {
      return db.query(
        `DELETE FROM articles 
    WHERE article_id = $1 
    RETURNING *;`,
        [articleId]
      );
    })
    .then(({ rowCount }) => {
      if (rowCount === 0) {
        return Promise.reject({ status: 404, msg: "Article ID not found" });
      }
    });
};

exports.selectArticlesByTopic = (topic) => {
  return db
    .query(`SELECT * FROM topics WHERE slug = $1`, [topic])
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Topic not found" });
      }
      return db.query(`SELECT * FROM articles WHERE topic = $1 ORDER BY "created_at`, [topic]);
    })
    .then(({ rows }) => {
      return rows;
    });
};
