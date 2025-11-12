const express = require("express");

const {
  listCourses,
  getCourse,
  createCourse,
  deleteCourse,
  updateCourse,
} = require("../controllers/coursesController");

const router = express.Router();

router.get("/", listCourses);
router.get("/:id", getCourse);
router.post("/", createCourse);
router.delete("/:id", deleteCourse);

/**
 * @swagger
 * /courses/{courseId}/students/{studentId}:
 *   post:
 *     summary: add a student to a course
 *     tags:
 *       - Courses Student
 *     parameters:
 *       - name: courseId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *       - name: studentId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       201:
 *         description: OK
 *       400:
 *         description: Generic error
 */
router.post("/:courseId/students/:studentId", (req, res) => {
  const result = require("../services/storage").enroll(
    req.params.studentId,
    req.params.courseId
  );
  if (result.error) return res.status(400).json({ error: result.error });
  return res.status(201).json({ success: true });
});

/**
 * @swagger
 * /courses/{courseId}/students/{studentId}:
 *   delete:
 *     summary: delete a student from a course
 *     tags:
 *       - Courses Student
 *     parameters:
 *       - name: courseId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *       - name: studentId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: OK
 *       400:
 *         description: Generic error
 */
router.delete("/:courseId/students/:studentId", (req, res) => {
  const result = require("../services/storage").unenroll(
    req.params.studentId,
    req.params.courseId
  );
  if (result.error) return res.status(404).json({ error: result.error });
  return res.status(204).send();
});

router.put("/:id", updateCourse);

module.exports = router;
