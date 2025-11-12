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
    expect(res.body["courses"].length).toBe(3);
  });

  test("POST /courses should create a new course", async () => {
    const res = await request(app)
      .post(`/courses`)
      .send({ title: "TEST", teacher: "Ronald Duck" });
    expect(res.statusCode).toBe(201);
  });

  test("GET /students should return seeded students", async () => {
    const res = await request(app).get("/students");
    expect(res.statusCode).toBe(200);
    expect(res.body.students.length).toBe(3);
    expect(res.body.students[0].name).toBe("Alice");
  });

  test("GET /students/:id should return the studend for the given id", async () => {
    const res = await request(app).get("/students/1");

    expect(res.statusCode).toBe(200);
    expect(res.body.student.name).toStrictEqual("Alice");
    expect(res.body.student.email).toStrictEqual("alice@example.com");
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

  test("PUT /students/:id should update & return student", async () => {
    const req = { name: "test", email: "test@test.test" };
    const res = await request(app)
      .put("/students/1")
      .send({ name: "test", email: "test@test.test" });

    const student = await request(app).get("/students/1");

    expect(res.statusCode).toBe(200);
    expect(student.body.student.name).toStrictEqual(req.name);
    expect(student.body.student.email).toStrictEqual(req.email);
  });

  test("DELETE /students/:id should delete the student from for the given id", async () => {
    const res = await request(app).delete("/students/3");
    expect(res.statusCode).toBe(204);
  });

  test("GET /course/:id should return the course corresponding to the id given", async () => {
    const res = await request(app).get("/courses/1");

    expect(res.statusCode).toBe(200);
    expect(res.body.course).toStrictEqual({
      id: 1,
      title: "Math",
      teacher: "Mr. Smith",
    });
  });

  test("DELETE /courses/:id should delete a course even if students are enrolled", async () => {
    const courses = await request(app).get("/courses");
    const courseId = courses.body.courses[0].id;
    const res = await request(app).delete(`/courses/${courseId}`);
    expect(res.statusCode).toBe(204);
  });

  test("PUT /course/:id should update & return a course", async () => {
    const req = { title: "Bell and Singing", teacher: "Sherma" };
    const res = await request(app).put("/courses/1").send(req);
    const course = await request(app).get("/courses/1");
    const { title, teacher } = course.body.course;

    expect(res.statusCode).toBe(200);
    expect(title).toStrictEqual(req["title"]);
    expect(teacher).toStrictEqual(req["teacher"]);
  });

  test("POST /:courseId/students/:studentId should add a student to a course", async () => {
    
    const res = await request(app).post("/courses/1/students/1");
    const courses = await request(app).get("/courses/1");
    
    expect(res.statusCode).toBe(201);
    expect(courses.body.students[0]).toStrictEqual(
      { id: 1, name: 'Alice', email: 'alice@example.com' }
    );
  });
  
  test("DELETE /:courseId/students/:studentId should delete a student from a course", async () => {
    
    await request(app).post("/courses/1/students/1");
    const res = await request(app).delete("/courses/1/students/1");
    const courses = await request(app).get("/courses/1");
    
    expect(res.statusCode).toBe(204);
    expect(courses.body.students).toStrictEqual([]);
  });
});
