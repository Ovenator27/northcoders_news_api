const seed = require("../db/seeds/seed");
const data = require("../db/data/test-data");
const db = require("../db/connection");
const request = require('supertest');
const app = require('../app')

beforeEach(() => seed(data));
afterAll(() => db.end());

describe("/api/topics", () => {
  test("GET 200: responds with an array of topic objects", () => {
    return request(app)
    .get('/api/topics')
    .expect(200)
    .then(({body: {topics}}) => {
        expect(topics.length).toBe(3)
        topics.forEach((topic) => {
            expect(typeof topic.slug).toBe('string');
            expect(typeof topic.description).toBe('string');
        })
    })
  });
});
