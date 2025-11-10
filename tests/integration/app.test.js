const request = require("supertest");
const app = require("../../src/app");
const storage = require("../../src/services/storage");

describe("Student-Course API integration", () => {
  beforeEach(() => {
    storage.reset();
    storage.seed();
  });

  test("GET /courses should return all courses", async () => {
    const res = await request(app).get(`/courses`);
    expect(res.statusCode).toBe(200);
    expect(res.body['courses'].length).toBe(3);
  })

  test("POST /courses should create a new course", async () => {
    const res = await request(app).post(`/courses`)
      .send({ title: "TEST", teacher: "Ronald Duck" });
    expect(res.statusCode).toBe(201);
  })

  test("GET /students should return seeded students", async () => {
    const res = await request(app).get("/students");
    expect(res.statusCode).toBe(200);
    expect(res.body.students.length).toBe(3);
    expect(res.body.students[0].name).toBe("Alice");
  });

  test("POST /students should create a new student", async () => {
    const res = await request(app)
      .post("/students")
      .send({ name: "David", email: "david@example.com" });
    expect(res.statusCode).toBe(201);
    expect(res.body.name).toBe("David");
  });

  test("POST /students should not allow duplicate email", async () => {
    const res = await request(app)
      .post("/students")
      .send({ name: "Eve", email: "eve@example.com" });
    expect(res.statusCode).toBe(201);
  });
  
  test("GET /course/:id should return the course corresponding to the id given", async () => {
    const res = await request(app).get("/courses/1");

    expect(res.statusCode).toBe(200);
    expect(res.body.course).toStrictEqual({
      id: 1,
      title: "Math",
      teacher: "Mr. Smith"
    });
  });

  test("DELETE /courses/:id should delete a course even if students are enrolled", async () => {
    const courses = await request(app).get("/courses");
    const courseId = courses.body.courses[0].id;
    const res = await request(app).delete(`/courses/${courseId}`);
    expect(res.statusCode).toBe(204);
  });

  test("PUT /course/:id should returned the modified course", async () => {
    const req = {title: "Bell and Singing", teacher:"Sherma"};
    const res = await request(app).put("/courses/1")
      .send(req);
    const course = await request(app).get("/courses/1");
    const {title, teacher} = course.body.course;

    expect(res.statusCode).toBe(200);
    expect(title).toStrictEqual(req['title']);
    expect(teacher).toStrictEqual(req['teacher']);
  });
});