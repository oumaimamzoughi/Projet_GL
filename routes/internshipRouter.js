const express = require("express");
const router = express.Router();

const multer = require("multer");
const { multerFilter, multerStorage } = require("../utils/storage");

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
}).array("documents", 5); // Limit to 5 documents per upload


const middleAuth = require("../middleware/User");
const { openInternshipPeriod, getOpenInternshipPeriod, updateInternshipPeriod, assignTeachersToInternships, updateInternshipTeacher, sendPlanningEmail, getAssignedInternships, addInternship, getInternshipDetails, updateInternshipSchedule, fetchInternshipDetailsForConnectedUser, updateInternshipValidationStatus } = require("../controllers/Internship");
/**
 * @swagger
 * /{type}/open:
 *   post:
 *     summary: Open an internship period
 *     parameters:
 *       - name: type
 *         in: path
 *         required: true
 *         description: The type of internship to open
 *         schema:
 *           type: string
 *           enum:
 *             - teacher_submission
 *             - internship_submission
 *             - pfa_choice_submission
 *             - internship_submission_2eme
 *             - internship_submission_1ere
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               start_date:
 *                 type: string
 *                 format: date
 *                 example: "2024-12-19"
 *               end_date:
 *                 type: string
 *                 format: date
 *                 example: "2024-12-19"
 *             required:
 *               - start_date
 *               - end_date
 *     responses:
 *       201:
 *         description: Internship period opened successfully
 *       400:
 *         description: Invalid request, missing or incorrect parameters
 *       500:
 *         description: Internal server error
 */

router.post("/:type/open", openInternshipPeriod);//works



/** 
 * @swagger
 * /{type}/open:
 *   patch:
 *     summary: Update the internship period
 *     tags:
 *       - Internship
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         type: string
 *         description: The type of internship
 *       - in: body
 *         name: period
 *         description: The period details to update
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             start_date:
 *               type: string
 *               format: date
 *             end_date:
 *               type: string
 *               format: date
 *     responses:
 *       200:
 *         description: Internship period updated successfully
 *       400:
 *         description: Invalid date range or bad request
 *       404:
 *         description: Internship period not found
 *       500:
 *         description: Internal server error
 */
router.patch("/:type/open", updateInternshipPeriod);//works

/** 
 * @swagger
 * /{type}/post:
 *   post:
 *     summary: Add a new internship
 *     tags:
 *       - Internship
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         type: string
 *         description: The type of internship to post
 *       - in: body
 *         name: internship
 *         description: Internship details to post
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             title:
 *               type: string
 *             documents:
 *               type: array
 *               items:
 *                 type: string
 *     responses:
 *       201:
 *         description: Internship posted successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post("/:type/post",upload, addInternship);//works 





/** 
 * @swagger
 * /{type}/open:
 *   get:
 *     summary: Get the open internship period details
 *     tags:
 *       - Internship
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         type: string
 *         description: The type of internship
 *     responses:
 *       200:
 *         description: Internship period details retrieved successfully
 *       404:
 *         description: Internship period not found
 *       500:
 *         description: Internal server error
 */
router.get("/:type/open", getOpenInternshipPeriod);//works


/** 
 * @swagger
 * /{type}/planning/assign:
 *   post:
 *     summary: Assign teachers to internships
 *     tags:
 *       - Internship
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         type: string
 *         description: The type of internship
 *       - in: body
 *         name: teacherIds
 *         description: List of teacher IDs to assign
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             teacher_ids:
 *               type: array
 *               items:
 *                 type: string
 *     responses:
 *       200:
 *         description: Teachers assigned successfully
 *       400:
 *         description: Bad request, missing or invalid teacher IDs
 *       404:
 *         description: Internship type not found
 *       500:
 *         description: Internal server error
 */
router.post('/:type/planning/assign', assignTeachersToInternships);//works

/** 
 * @swagger
 * /{type}/planning/update:
 *   patch:
 *     summary: Update internship teacher assignments
 *     tags:
 *       - Internship
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         type: string
 *         description: The type of internship
 *       - in: body
 *         name: teacherUpdate
 *         description: Details of the teacher to update
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             teacher_id:
 *               type: string
 *             internship_id:
 *               type: string
 *     responses:
 *       200:
 *         description: Teacher assignment updated successfully
 *       400:
 *         description: Bad request, missing or invalid parameters
 *       404:
 *         description: Internship or teacher not found
 *       500:
 *         description: Internal server error
 */
router.patch('/:type/planning/update', updateInternshipTeacher);//works

/** 
 * @swagger
 * /{type}/planning/send:
 *   post:
 *     summary: Send internship planning email
 *     tags:
 *       - Internship
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         type: string
 *         description: The type of internship
 *       - in: body
 *         name: emailDetails
 *         description: Email details to send
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             to:
 *               type: string
 *               description: Email recipient
 *             subject:
 *               type: string
 *             message:
 *               type: string
 *     responses:
 *       200:
 *         description: Email sent successfully
 *       400:
 *         description: Invalid email details or bad request
 *       500:
 *         description: Internal server error
 */
router.post('/:type/planning/send', sendPlanningEmail);//works

/** 
 * @swagger
 * /{type}/assigned-to-me:
 *   get:
 *     summary: Get the internships assigned to the current user
 *     tags:
 *       - Internship
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         type: string
 *         description: The type of internship
 *     responses:
 *       200:
 *         description: List of assigned internships retrieved successfully
 *       404:
 *         description: No assigned internships found
 *       500:
 *         description: Internal server error
 */
router.get('/:type/assigned-to-me', getAssignedInternships);//works


// sprint 2 
/** 
 * @swagger
 * /{type}/{id}:
 *   get:
 *     summary: Retrieve detailed information about a specific internship
 *     tags:
 *       - Internship
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *         description: The type of internship (e.g., "summer", "winter")
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique ID of the internship
 *     responses:
 *       200:
 *         description: Internship details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: Internship ID
 *                 title:
 *                   type: string
 *                   description: Title of the internship
 *                 student:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: Student ID
 *                     name:
 *                       type: string
 *                       description: Student name
 *                     email:
 *                       type: string
 *                       description: Student email address
 *                 teacher:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: Teacher ID
 *                     name:
 *                       type: string
 *                       description: Teacher name
 *                     email:
 *                       type: string
 *                       description: Teacher email address
 *                 documents:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                         description: Document name
 *                       url:
 *                         type: string
 *                         description: Document download URL
 *                 planningPublished:
 *                   type: boolean
 *                   description: Whether the planning is published
 *                 googleMeetLink:
 *                   type: string
 *                   description: Google Meet link if available
 *       404:
 *         description: Internship not found
 *       500:
 *         description: Internal server error
 */

router.get('/:type/:id',getInternshipDetails)//works


/**
 * @swagger
 * /{type}/{id}:
 *   patch:
 *     summary: Update the schedule of an internship
 *     tags:
 *       - Internship
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         description: The type of internship (e.g., "pfa", "internship", "capstone")
 *         schema:
 *           type: string
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the internship to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *                 description: The new date for the internship schedule
 *                 example: "2024-12-20"
 *               time:
 *                 type: string
 *                 description: The new time for the internship schedule (HH:mm format)
 *                 example: "14:00"
 *               googleMeetLink:
 *                 type: string
 *                 description: The new Google Meet link for the internship schedule
 *                 example: "https://meet.google.com/example-link"
 *             required:
 *               - date
 *               - time
 *               - googleMeetLink
 *     responses:
 *       200:
 *         description: Internship schedule updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internship schedule updated successfully."
 *       400:
 *         description: Invalid input data or missing parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid date or time format."
 *       404:
 *         description: Internship not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internship not found."
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "An error occurred while updating the internship schedule."
 */


router.patch('/:type/:id', updateInternshipSchedule); // works 


/**
 * @swagger
 * /internship/{type}/me:
 *   get:
 *     summary: Get internship details for the currently logged-in student
 *     tags:
 *       - Internship
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         type: string
 *         description: The type of internship (e.g., "summer", "winter", "internship_submission")
 *     responses:
 *       200:
 *         description: Internship details for the logged-in student retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: Internship ID
 *                 title:
 *                   type: string
 *                   description: Title of the internship
 *                 student:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: Student ID
 *                     name:
 *                       type: string
 *                       description: Student name
 *                     email:
 *                       type: string
 *                       description: Student email address
 *                 teacher:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: Teacher ID
 *                     name:
 *                       type: string
 *                       description: Teacher name
 *                     email:
 *                       type: string
 *                       description: Teacher email address
 *                 schedule:
 *                   type: object
 *                   properties:
 *                     date:
 *                       type: string
 *                       format: date
 *                       description: The date of the internship session
 *                     time:
 *                       type: string
 *                       description: The time of the internship session (HH:mm format)
 *                     googleMeetLink:
 *                       type: string
 *                       description: Google Meet link for the session if available
 *                 documents:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                         description: Document name
 *                       url:
 *                         type: string
 *                         description: Document download URL
 *                 planningPublished:
 *                   type: boolean
 *                   description: Whether the internship planning is published
 *       404:
 *         description: Internship not found for the logged-in student
 *       500:
 *         description: Internal server error
 */

router.get('/internship/:type/me', fetchInternshipDetailsForConnectedUser);//works



/**
 * @swagger
 * /{type}/{id}:
 *   patch:
 *     summary: Update the internship validation status
 *     tags:
 *       - Internship
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         type: string
 *         description: The type of internship (e.g., "teacher_submission", "internship_submission")
 *       - in: path
 *         name: id
 *         required: true
 *         type: string
 *         description: The ID of the internship to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               validated:
 *                 type: boolean
 *                 description: Whether the internship is validated or not
 *                 example: true
 *               reason:
 *                 type: string
 *                 description: The reason for not validating the internship if it's not validated
 *                 example: "The topic does not match the teacher's subject."
 *             required:
 *               - validated
 *     responses:
 *       200:
 *         description: Internship validation status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: The result message
 *                   example: "Internship validated successfully."
 *                 internship:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: Internship ID
 *                     title:
 *                       type: string
 *                       description: Title of the internship
 *                     validated:
 *                       type: boolean
 *                       description: Whether the internship is validated or not
 *       400:
 *         description: Invalid request, missing or incorrect parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Validation status must be a boolean."
 *       403:
 *         description: Unauthorized, the teacher is not authorized to modify the internship
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "You are not authorized to modify this internship."
 *       404:
 *         description: Internship not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internship not found."
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "An error occurred while updating the internship validation."
 */
router.patch("/:type/:id/updateValidationStatus", updateInternshipValidationStatus);//works

module.exports = router;