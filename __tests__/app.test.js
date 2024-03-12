const seed = require("../db/seeds/seed");
const data = require("../db/data/test-data");
const db = require("../db/connection");
const request = require("supertest");
const app = require("../app");

beforeEach(() => seed(data));
afterAll(() => db.end());

describe("/api", () => {
  test("GET 200: responds an object describing all the available endpoints on the API", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then(({ body: { endpoints } }) => {
        for (let routes in endpoints) {
          const route = endpoints[routes]
          for (let endpoint in route) {
            expect(route[endpoint]).toHaveProperty("description");
            expect(route[endpoint]).toHaveProperty("queries");
            expect(route[endpoint]).toHaveProperty("exampleResponse");
            if (/(POST)|(PATCH)|(DELETE)/.test(endpoint)) {
              expect(route[endpoint]).toHaveProperty("bodyFormat");
            }
          }
        }
      });
  });
});
describe("/api/topics", () => {
  describe("Get requests", () => {
    test("GET 200: responds with an array of topic objects", () => {
      return request(app)
        .get("/api/topics")
        .expect(200)
        .then(({ body: { topics } }) => {
          expect(topics.length).toBe(3);
          topics.forEach((topic) => {
            expect(typeof topic.slug).toBe("string");
            expect(typeof topic.description).toBe("string");
          });
        });
    });
  });
  describe("POST requests", () => {
    test("POST 201: responds with newly added topic", () => {
      const newTopic = {
        slug: "topic name here",
        description: "description here",
      };
      return request(app)
        .post("/api/topics")
        .send(newTopic)
        .expect(201)
        .then(({ body: { topic } }) => {
          expect(topic).toMatchObject({
            slug: "topic name here",
            description: "description here",
          });
        });
    });
    test("POST 400: responds with appropriate status and error message when request has missing fields", () => {
      const newTopic = {
        description: "description here",
      };
      return request(app)
        .post("/api/topics")
        .expect(400)
        .send(newTopic)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Bad request");
        });
    });
  });
});
describe("/api/topics/:topic", () => {
  describe("GET requests", () => {
    test("GET 200: responds with an array of all articles related to chosen topic", () => {
      return request(app)
        .get("/api/topics/mitch")
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(articles.length).toBe(12);
          articles.forEach((article) => {
            expect(article).toMatchObject({
              title: expect.any(String),
              topic: expect.any(String),
              author: expect.any(String),
              created_at: expect.any(String),
              votes: expect.any(Number),
              article_img_url: expect.any(String),
            });
          });
        });
    });
    test("GET 200: responds with an empty array for a topic with no associated articles", () => {
      return request(app)
        .get("/api/topics/paper")
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(articles.length).toBe(0);
        });
    });
    test("GET 404: responds with appropriate status and error message for a topic that does not exist", () => {
      return request(app)
        .get("/api/topics/forklift")
        .expect(404)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Topic not found");
        });
    });
  });
  describe("DELETE requests", () => {
    test("DELETE 204: responds with appropriate status and no content", () => {
      return request(app).delete("/api/topics/mitch").expect(204);
    });
    test("DELETE 404: responds with appropriate status and error code for topic that does not exist", () => {
      return request(app)
        .delete("/api/topics/forklift")
        .expect(404)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Topic not found");
        });
    });
  });
});
describe("/api/articles", () => {
  describe("GET requests", () => {
    test("GET 200: responds with an array of all articles", () => {
      return request(app)
        .get("/api/articles?limit=50")
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(articles.length).toBe(13);
          articles.forEach((article) => {
            expect(article).toHaveProperty("author");
            expect(article).toHaveProperty("title");
            expect(article).toHaveProperty("article_id");
            expect(article).toHaveProperty("topic");
            expect(article).toHaveProperty("created_at");
            expect(article).toHaveProperty("votes");
            expect(article).toHaveProperty("article_img_url");
            expect(article).toHaveProperty("comment_count");
          });
        });
    });
    test("GET 200: responds with articles sorted by date in descending order", () => {
      return request(app)
        .get("/api/articles")
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(articles).toBeSortedBy("created_at", { descending: true });
        });
    });
    describe("topic query", () => {
      test("GET 200: responds with a filtered array of articles based on topic query", () => {
        return request(app)
          .get("/api/articles?topic=cats")
          .expect(200)
          .then(({ body: { articles } }) => {
            expect(articles.length).toBe(1);
          });
      });
      test("GET 200: responds with all articles if no topic query is provided", () => {
        return request(app)
          .get("/api/articles?limit=50")
          .expect(200)
          .then(({ body: { articles } }) => {
            expect(articles.length).toBe(13);
            articles.forEach((article) => {
              expect(article).toMatchObject({
                title: expect.any(String),
                topic: expect.any(String),
                author: expect.any(String),
                created_at: expect.any(String),
                votes: expect.any(Number),
                article_img_url: expect.any(String),
                comment_count: expect.any(Number),
              });
            });
          });
      });
    });
    describe("sort_by query", () => {
      test("GET 200: returns articles sorted by the requested column", () => {
        return request(app)
          .get("/api/articles?sort_by=author")
          .expect(200)
          .then(({ body: { articles } }) => {
            expect(articles).toBeSortedBy("author", { descending: true });
          });
      });
      test("GET 200: returns articles sorted by created_at date if no query is provided", () => {
        return request(app)
          .get("/api/articles")
          .expect(200)
          .then(({ body: { articles } }) => {
            expect(articles).toBeSortedBy("created_at", { descending: true });
          });
      });
      test("GET 400: returns appropriate status and error message for invalid query", () => {
        return request(app)
          .get("/api/articles/forklift")
          .expect(400)
          .then(({ body: { msg } }) => {
            expect(msg).toBe("Bad request");
          });
      });
    });
    describe("order query", () => {
      test("GET 200: returns articles sorted ascending when requested", () => {
        return request(app)
          .get("/api/articles?order=asc")
          .expect(200)
          .then(({ body: { articles } }) => {
            expect(articles).toBeSortedBy("created_at", { ascending: true });
          });
      });
      test("GET 200: returns articles sorted descending by default if no query is specified", () => {
        return request(app)
          .get("/api/articles")
          .expect(200)
          .then(({ body: { articles } }) => {
            expect(articles).toBeSortedBy("created_at", { descending: true });
          });
      });
      test("GET 400: returns appropriate status and error message for invalid order query", () => {
        return request(app)
          .get("/api/articles/ascending")
          .expect(400)
          .then(({ body: { msg } }) => {
            expect(msg).toBe("Bad request");
          });
      });
    });
    describe("limit query", () => {
      test("GET 200: responds with number of articles according to limit request", () => {
        return request(app)
          .get("/api/articles?limit=5")
          .expect(200)
          .then(({ body: { articles } }) => {
            expect(articles.length).toBe(5);
          });
      });
      test("GET 200: responds with 10 articles if no limit is provided ", () => {
        return request(app)
          .get("/api/articles")
          .expect(200)
          .then(({ body: { articles } }) => {
            expect(articles.length).toBe(10);
          });
      });
      test("GET 200: responds with the total count property showing total articles discounting limit", () => {
        return request(app)
          .get("/api/articles")
          .expect(200)
          .then(({ body }) => {
            expect(body).toMatchObject({
              articles: expect.any(Object),
              total_count: expect.any(Number),
            });
          });
      });
      test("GET 400: responds with appropriate status and error message when provided with invalid limit query", () => {
        return request(app)
          .get("/api/articles?limit=one")
          .expect(400)
          .then(({ body: { msg } }) => {
            expect(msg).toBe("Bad request");
          });
      });
    });
    describe("p query", () => {
      test("GET 200: returns articles on specified page according to limit and p query", () => {
        return request(app)
          .get("/api/articles?limit=2&&p=2")
          .expect(200)
          .then(({ body: { articles } }) => {
            expect(articles.length).toBe(2);
            expect(articles).toEqual([
              {
                article_id: 2,
                author: "icellusedkars",
                title: "Sony Vaio; or, The Laptop",
                topic: "mitch",
                created_at: "2020-10-16T05:03:00.000Z",
                votes: 0,
                article_img_url:
                  "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
                comment_count: 0,
              },
              {
                article_id: 12,
                author: "butter_bridge",
                title: "Moustache",
                topic: "mitch",
                created_at: "2020-10-11T11:24:00.010Z",
                votes: 0,
                article_img_url:
                  "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
                comment_count: 0,
              },
            ]);
          });
      });
      test("GET 200: returns the first page if no page is specified", () => {
        return request(app)
          .get("/api/articles?limit=2")
          .expect(200)
          .then(({ body: { articles } }) => {
            expect(articles).toEqual([
              {
                article_id: 3,
                author: "icellusedkars",
                title: "Eight pug gifs that remind me of mitch",
                topic: "mitch",
                created_at: "2020-11-03T09:12:00.000Z",
                votes: 0,
                article_img_url:
                  "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
                comment_count: 2,
              },
              {
                article_id: 6,
                author: "icellusedkars",
                title: "A",
                topic: "mitch",
                created_at: "2020-10-18T01:00:00.000Z",
                votes: 0,
                article_img_url:
                  "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
                comment_count: 1,
              },
            ]);
          });
      });
      test("GET 400: returns appropriate status and error message if provided an invalid page query", () => {
        return request(app)
          .get("/api/articles?p=one")
          .expect(400)
          .then(({ body: { msg } }) => {
            expect(msg).toBe("Bad request");
          });
      });
    });
  });
  describe("POST requests", () => {
    test("POST 201: responds with newly created article", () => {
      const newArticle = {
        author: "icellusedkars",
        title: "Title",
        body: "Body",
        topic: "cats",
      };
      return request(app)
        .post("/api/articles")
        .send(newArticle)
        .expect(201)
        .then(({ body: { article } }) => {
          expect(article).toMatchObject({
            author: "icellusedkars",
            title: "Title",
            body: "Body",
            topic: "cats",
            article_id: expect.any(Number),
            votes: 0,
            created_at: expect.any(String),
            comment_count: 0,
          });
        });
    });
    test("POST 400: responds with appropriate status and error message when request has missing fields", () => {
      const newArticle = {
        author: "icellusedkars",
        body: "Body",
        topic: "cats",
      };
      return request(app)
        .post("/api/articles")
        .expect(400)
        .send(newArticle)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Bad request");
        });
    });
    test("POST 400: responds with appropriate status and error message when request has invalid content", () => {
      const newArticle = {
        author: "Anon",
        title: "Title",
        body: "Body",
        topic: "cats",
      };
      return request(app)
        .post("/api/articles")
        .send(newArticle)
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Bad request");
        });
    });
  });
});
describe("/api/articles/:article_id", () => {
  describe("GET requests", () => {
    test("GET 200: responds with an article object for the specified article", () => {
      return request(app)
        .get("/api/articles/1")
        .expect(200)
        .then(({ body: { article } }) => {
          expect(article).toMatchObject({
            author: expect.any(String),
            title: expect.any(String),
            article_id: expect.any(Number),
            body: expect.any(String),
            topic: expect.any(String),
            created_at: expect.any(String),
            votes: expect.any(Number),
            article_img_url: expect.any(String),
          });
        });
    });
    test("GET 200: responds with an article object containing the comment_count property", () => {
      return request(app)
        .get("/api/articles/1")
        .expect(200)
        .then(({ body: { article } }) => {
          expect(article).toHaveProperty("comment_count", 11);
        });
    });
    test("GET 404: responds with correct status and error message when requesting an article that does not exist", () => {
      return request(app)
        .get("/api/articles/999999")
        .expect(404)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Article ID not found");
        });
    });
    test("GET 400: responds with correct status and error message when requesting an invalid ID", () => {
      return request(app)
        .get("/api/articles/forklift")
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Bad request");
        });
    });
  });
  describe("PATCH requests", () => {
    test("PATCH 200: responds with correctly updated article", () => {
      return request(app)
        .patch("/api/articles/1")
        .send({ inc_votes: -20 })
        .expect(200)
        .then(({ body: { article } }) => {
          expect(article).toMatchObject({
            author: "butter_bridge",
            title: "Living in the shadow of a great man",
            article_id: 1,
            body: "I find this existence challenging",
            topic: "mitch",
            created_at: expect.any(String),
            votes: 80,
            article_img_url:
              "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
          });
        });
    });
    test("PATCH 404: responds with correct status and error message when requesting an article that does not exist", () => {
      return request(app)
        .patch("/api/articles/999999")
        .send({ inc_votes: -20 })
        .expect(404)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Article ID not found");
        });
    });
    test("PATCH 400: responds with correct status and error message when requesting an invalid ID", () => {
      return request(app)
        .patch("/api/articles/forklift")
        .send({ inc_votes: -20 })
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Bad request");
        });
    });
    test("PATCH 400: responds with appropriate status and error message when request has missing fields", () => {
      return request(app)
        .patch("/api/articles/5")
        .send({})
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Bad request");
        });
    });
    test("PATCH 400: responds with appropriate status and error message when request has invalid content", () => {
      return request(app)
        .patch("/api/articles/5")
        .send({ inc_votes: "one" })
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Bad request");
        });
    });
  });
  describe("DELETE requests", () => {
    test("DELETE 204: deletes article and associated comments responds with status and no content", () => {
      return request(app).delete("/api/articles/1").expect(204);
    });
    test("DELETE 404: responds with appropriate status and error code for an article ID that does not exist", () => {
      return request(app)
        .delete("/api/articles/9999")
        .expect(404)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Article ID not found");
        });
    });
    test("DELETE 400: responds with appropriate status and error code for invalid article ID", () => {
      return request(app)
        .delete("/api/articles/forklift")
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Bad request");
        });
    });
  });
});
describe("/api/articles/:article_id/comments", () => {
  describe("GET requests", () => {
    test("GET 200: responds with an array of comments for specified article ID", () => {
      return request(app)
        .get("/api/articles/5/comments")
        .expect(200)
        .then(({ body: { comments } }) => {
          expect(comments.length).toBe(2);
          comments.forEach((comment) => {
            expect(comment).toHaveProperty("comment_id");
            expect(comment).toHaveProperty("votes");
            expect(comment).toHaveProperty("created_at");
            expect(comment).toHaveProperty("author");
            expect(comment).toHaveProperty("body");
            expect(comment).toHaveProperty("article_id");
          });
        });
    });
    test("GET 200: responds with most recent comments first", () => {
      return request(app)
        .get("/api/articles/5/comments")
        .expect(200)
        .then(({ body: { comments } }) => {
          expect(comments).toBeSortedBy("created_at", { descending: true });
        });
    });
    test("GET 200: responds with an empty array for article ID that exists but has no comments", () => {
      return request(app)
        .get("/api/articles/2/comments")
        .expect(200)
        .then(({ body: { comments } }) => {
          expect(comments.length).toBe(0);
        });
    });
    test("GET 404: responds with appropriate status and error message for article ID that does not exist", () => {
      return request(app)
        .get("/api/articles/999999/comments")
        .expect(404)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Article ID not found");
        });
    });
    test("GET 400: responds with appropriate status and error message for invalid article ID", () => {
      return request(app)
        .get("/api/articles/forklift/comments")
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Bad request");
        });
    });
    describe("limit query", () => {
      test("GET 200: responds with the number of comments specified by the limit query", () => {
        return request(app)
          .get("/api/articles/1/comments?limit=5")
          .expect(200)
          .then(({ body: { comments } }) => {
            expect(comments.length).toBe(5);
          });
      });
      test("GET 200: responds with 10 comments if no limit query is included", () => {
        return request(app)
          .get("/api/articles/1/comments")
          .expect(200)
          .then(({ body: { comments } }) => {
            expect(comments.length).toBe(10);
          });
      });
      test("GET 400: responds with appropriate status and error message for invalid limit query", () => {
        return request(app)
          .get("/api/articles/1/comments?limit=one")
          .expect(400)
          .then(({ body: { msg } }) => {
            expect(msg).toBe("Bad request");
          });
      });
    });
    describe("p query", () => {
      test("GET 200: returns comments on page requested by query", () => {
        return request(app)
          .get("/api/articles/1/comments?p=2&&limit=2")
          .expect(200)
          .then(({ body: { comments } }) => {
            expect(comments).toEqual([
              {
                comment_id: 18,
                body: "This morning, I showered for nine minutes.",
                article_id: 1,
                author: "butter_bridge",
                votes: 16,
                created_at: "2020-07-21T00:20:00.000Z",
              },
              {
                comment_id: 13,
                body: "Fruit pastilles",
                article_id: 1,
                author: "icellusedkars",
                votes: 0,
                created_at: "2020-06-15T10:25:00.000Z",
              },
            ]);
          });
      });
      test("GET 200: returns the first page if no page is specified in query", () => {
        return request(app)
          .get("/api/articles/1/comments?limit=2")
          .expect(200)
          .then(({ body: { comments } }) => {
            expect(comments).toEqual([
              {
                comment_id: 5,
                body: "I hate streaming noses",
                article_id: 1,
                author: "icellusedkars",
                votes: 0,
                created_at: "2020-11-03T21:00:00.000Z",
              },
              {
                comment_id: 2,
                body: "The beautiful thing about treasure is that it exists. Got to find out what kind of sheets these are; not cotton, not rayon, silky.",
                article_id: 1,
                author: "butter_bridge",
                votes: 14,
                created_at: "2020-10-31T03:03:00.000Z",
              },
            ]);
          });
      });
      test("GET 400: returns appropriate status and error message for invalid page query", () => {
        return request(app)
          .get("/api/articles/1/comments?p=one")
          .expect(400)
          .then(({ body: { msg } }) => {
            expect(msg).toBe("Bad request");
          });
      });
    });
  });
  describe("POST requests", () => {
    test("POST 201: responds with posted comment", () => {
      return request(app)
        .post("/api/articles/5/comments")
        .send({
          username: "rogersop",
          body: "New comment",
        })
        .expect(201)
        .then(({ body: { comment } }) => {
          expect(comment).toMatchObject({
            body: expect.any(String),
            votes: expect.any(Number),
            author: expect.any(String),
            article_id: expect.any(Number),
            created_at: expect.any(String),
          });
        });
    });
    test("POST 400: responds with appropriate status and error message when request has missing fields", () => {
      return request(app)
        .post("/api/articles/5/comments")
        .send({
          body: "New comment",
        })
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Bad request");
        });
    });
    test("POST 400: responds with appropriate status and error message when request has invalid content", () => {
      return request(app)
        .post("/api/articles/5/comments")
        .send({
          username: "Simon",
          body: 12,
        })
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Bad request");
        });
    });
    test("POST 404: responds with appropriate status and error message for article ID that does not exist", () => {
      return request(app)
        .post("/api/articles/999999/comments")
        .send({
          username: "rogersop",
          body: "New comment",
        })
        .expect(404)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Article ID not found");
        });
    });
    test("POST 400: responds with appropriate status and error message for invalid article ID", () => {
      return request(app)
        .get("/api/articles/forklift/comments")
        .send({
          username: "rogersop",
          body: "New comment",
        })
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Bad request");
        });
    });
  });
});
describe("/api/comments/:comment_id", () => {
  describe("DELETE requests", () => {
    test("DELETE 204: responds with status and no content", () => {
      return request(app).delete("/api/comments/5").expect(204);
    });
    test("DELETE 404: responds with appropriate status and error code for a comment id that does not exist", () => {
      return request(app)
        .delete("/api/comments/9999")
        .expect(404)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Comment ID not found");
        });
    });
    test("DELETE 400: responds with appropriate status and error code for invalid comment ID", () => {
      return request(app)
        .delete("/api/comments/forklift")
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Bad request");
        });
    });
  });
  describe("PATCH requests", () => {
    test("PATCH 200: responds with updated comment", () => {
      return request(app)
        .patch("/api/comments/2")
        .send({ inc_votes: -3 })
        .expect(200)
        .then(({ body: { comment } }) => {
          expect(comment).toMatchObject({
            body: "The beautiful thing about treasure is that it exists. Got to find out what kind of sheets these are; not cotton, not rayon, silky.",
            votes: 11,
            author: "butter_bridge",
            article_id: 1,
            created_at: expect.any(String),
          });
        });
    });
    test("PATCH 404: responds with correct status and error message when requesting a comment that does not exist", () => {
      return request(app)
        .patch("/api/comments/999999")
        .send({ inc_votes: -5 })
        .expect(404)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Comment ID not found");
        });
    });
    test("PATCH 400: responds with correct status and error message when requesting an invalid comment ID", () => {
      return request(app)
        .patch("/api/comments/forklift")
        .send({ inc_votes: -5 })
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Bad request");
        });
    });
    test("PATCH 400: responds with appropriate status and error message when request has missing fields", () => {
      return request(app)
        .patch("/api/comments/5")
        .send({})
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Bad request");
        });
    });
    test("PATCH 400: responds with appropriate status and error message when request has invalid content", () => {
      return request(app)
        .patch("/api/comments/5")
        .send({ inc_votes: "one" })
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Bad request");
        });
    });
  });
});
describe("/api/users", () => {
  describe("GET requests", () => {
    test("GET 200: responds with an array of all users", () => {
      return request(app)
        .get("/api/users")
        .expect(200)
        .then(({ body: { users } }) => {
          expect(users.length).toBe(4);
          users.forEach((user) => {
            expect(user).toMatchObject({
              username: expect.any(String),
              name: expect.any(String),
              avatar_url: expect.any(String),
            });
          });
        });
    });
  });
});
describe("/api/users/:username", () => {
  describe("GET requests", () => {
    test("GET 200: responds with user object specified by username", () => {
      return request(app)
        .get("/api/users/lurker")
        .expect(200)
        .then(({ body: { user } }) => {
          expect(user).toMatchObject({
            username: expect.any(String),
            avatar_url: expect.any(String),
            name: expect.any(String),
          });
        });
    });
    test("GET 404: responds with appropriate status and error message when username does not exist", () => {
      return request(app)
        .get("/api/users/humpty-dumpty")
        .expect(404)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Username not found");
        });
    });
  });
});
describe("Error handling", () => {
  test("GET 404: responds with appropriate status and error message for incorrect route", () => {
    return request(app)
      .get("/topics")
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Path not found");
      });
  });
});
