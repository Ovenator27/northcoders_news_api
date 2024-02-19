const seed = require("../db/seeds/seed");
const data = require("../db/data/test-data");
const db = require("../db/connection");
const request = require("supertest");
const app = require("../app");

beforeEach(() => seed(data));
afterAll(() => db.end());

describe("/api/topics", () => {
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
describe('Error handling', () => {
    test("GET 404: responds with appropriate status and error message for incorrect route", () => {
        return request(app)
        .get('/topics')
        .expect(404)
        .then(({body: {msg}}) => {
            expect(msg).toBe('Path not found');
        })
    });
});
describe('/api', () => {
    test('GET 200: responds an object describing all the available endpoints on the API', () => {
        return request(app)
        .get('/api')
        .expect(200)
        .then(({body: {endpoints}}) => {
            for (let key in endpoints) {
                expect(endpoints[key]).toHaveProperty('description');
                expect(endpoints[key]).toHaveProperty('queries');
                expect(endpoints[key]).toHaveProperty('exampleResponse');
                if(['POST', 'PATCH', 'DELETE'].includes(key)) {
                    expect(endpoints[key]).toHaveProperty('bodyFormat');
                }
            }
        })
    });
});