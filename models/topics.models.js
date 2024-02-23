const db = require("../db/connection");

exports.selectTopics = () => {
  return db.query(`SELECT * FROM topics`).then(({ rows }) => {
    return rows;
  });
};

exports.insertTopic = (topic) => {
  const { slug, description } = topic;
  return db
    .query(
      `INSERT INTO topics 
    (slug, description)
    VALUES
    ($1, $2) RETURNING *`,
      [slug, description]
    )
    .then(({ rows }) => {
      return rows[0];
    });
};

exports.removeTopic = (topic) => {
  return db
    .query(`DELETE FROM topics WHERE slug = $1 RETURNING *`, [topic])
    .then(({ rowCount }) => {
      if (rowCount === 0) {
        return Promise.reject({ status: 404, msg: "Topic not found" });
      }
    });
};
