import express from 'express';
import * as assessmentController from '../controllers/assessmentController';

const router = express.Router();

// Add a new question
router.post('/questions', assessmentController.addQuestion);

// Delete a question by ID
router.delete('/questions/:id', assessmentController.deleteQuestion);

// Get all questions for a specific assessment
router.get('/questions/:assessmentTitle', assessmentController.getQuestionsByAssessment);

// Add a new response
router.post('/responses', assessmentController.addResponse);

// Get all responses for a user and assessment
router.get('/responses/:userId/:assessmentTitle', assessmentController.getResponsesByUserAndAssessment);

// Update a response
router.patch('/responses/:id', assessmentController.updateResponse);

// Get all results for an assessment
router.get('/results/:assessmentTitle', assessmentController.getResultsByAssessment);

// Get all results for a specific user
router.get('/results/user/:userId', assessmentController.getResultsByUser);

// Update an assessment question
router.patch('/questions/:id', assessmentController.updateQuestion);
router.get('/titles/:assessmentTitle', assessmentController.getAssessmentsByTitle);
router.get('/questions/:id', assessmentController.getQuestionById);
router.get('/questions', assessmentController.getAllQuestions);
router.post('/results', assessmentController.addResult);


// Update an assessment result
router.patch('/results/:id', assessmentController.updateResult);

export default router;
