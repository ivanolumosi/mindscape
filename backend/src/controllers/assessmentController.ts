import { Request, Response } from 'express';
import { AssessmentService } from '../services/assessmentService';

const assessmentService = new AssessmentService();

// Helper function to format error messages
const getErrorMessage = (err: unknown): string => {
    if (err instanceof Error) return err.message;
    if (typeof err === 'string') return err;
    return 'An unknown error occurred';
};

// ✅ Add a new question to an assessment
export const addQuestion = async (req: Request, res: Response): Promise<void> => {
    try {
        const { assessmentTitle, questionText, questionType, options, isRequired } = req.body;

        if (!assessmentTitle || !questionText || !questionType) {
            res.status(400).json({ error: 'Assessment title, question text, and question type are required' });
            return;
        }

        const newQuestion = await assessmentService.addQuestion(assessmentTitle, questionText, questionType, options, isRequired);
        res.status(201).json({ message: 'Question added successfully', question: newQuestion });
    } catch (err: unknown) {
        res.status(500).json({ error: getErrorMessage(err) });
    }
};

// ✅ Delete a question by ID
export const deleteQuestion = async (req: Request, res: Response): Promise<void> => {
    try {
        const success = await assessmentService.deleteQuestion(parseInt(req.params.id, 10));

        success
            ? res.status(200).json({ message: 'Question deleted successfully' })
            : res.status(404).json({ error: 'Question not found' });
    } catch (err: unknown) {
        res.status(500).json({ error: getErrorMessage(err) });
    }
};

// ✅ Get all questions for an assessment
export const getQuestionsByAssessment = async (req: Request, res: Response): Promise<void> => {
    try {
        const { assessmentTitle } = req.params;
        const questions = await assessmentService.getQuestionsByAssessment(assessmentTitle);
        res.status(200).json(questions);
    } catch (err: unknown) {
        res.status(500).json({ error: getErrorMessage(err) });
    }
};

// ✅ Add a new response
export const addResponse = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId, questionId, responseText, selectedOption } = req.body;

        if (!userId || !questionId) {
            res.status(400).json({ error: 'User ID and Question ID are required' });
            return;
        }

        // Ensure questionId exists
        const questionExists = await assessmentService.getQuestionById(questionId);
        if (!questionExists) {
            res.status(404).json({ error: `Question with ID ${questionId} does not exist` });
            return;
        }

        const newResponse = await assessmentService.addResponse(userId, questionId, responseText, selectedOption);
        res.status(201).json({ message: 'Response added successfully', response: newResponse });
    } catch (err: unknown) {
        if (err instanceof Error) {
            res.status(500).json({ error: err.message });
        } else {
            res.status(500).json({ error: 'An unknown error occurred while adding the response' });
        }
    }
};

// ✅ Get all responses for a user and an assessment
export const getResponsesByUserAndAssessment = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId, assessmentTitle } = req.params;
        const responses = await assessmentService.getResponsesByUserAndAssessment(parseInt(userId, 10), assessmentTitle);
        res.status(200).json(responses);
    } catch (err: unknown) {
        res.status(500).json({ error: getErrorMessage(err) });
    }
};

// ✅ Update an existing response
export const updateResponse = async (req: Request, res: Response): Promise<void> => {
    try {
        const { responseText, selectedOption } = req.body;
        const updatedResponse = await assessmentService.updateResponse(parseInt(req.params.id, 10), responseText, selectedOption);

        updatedResponse
            ? res.status(200).json({ message: 'Response updated successfully', response: updatedResponse })
            : res.status(404).json({ error: 'Response not found' });
    } catch (err: unknown) {
        res.status(500).json({ error: getErrorMessage(err) });
    }
};

// ✅ Get all results for an assessment
export const getResultsByAssessment = async (req: Request, res: Response): Promise<void> => {
    try {
        const { assessmentTitle } = req.params;
        const results = await assessmentService.getResultsByAssessment(assessmentTitle);
        res.status(200).json(results);
    } catch (err: unknown) {
        res.status(500).json({ error: getErrorMessage(err) });
    }
};

// ✅ Get all results for a user
export const getResultsByUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const results = await assessmentService.getResultsByUser(parseInt(req.params.userId, 10));
        res.status(200).json(results);
    } catch (err: unknown) {
        res.status(500).json({ error: getErrorMessage(err) });
    }
};

// ✅ Update an existing assessment question
export const updateQuestion = async (req: Request, res: Response): Promise<void> => {
    try {
        const { assessmentTitle, questionText, questionType, options, isRequired } = req.body;
        const updatedQuestion = await assessmentService.updateQuestion(
            parseInt(req.params.id, 10),
            assessmentTitle,
            questionText,
            questionType,
            options,
            isRequired
        );

        updatedQuestion
            ? res.status(200).json({ message: 'Question updated successfully', question: updatedQuestion })
            : res.status(404).json({ error: 'Question not found' });
    } catch (err: unknown) {
        res.status(500).json({ error: getErrorMessage(err) });
    }
};

export const addResult = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId, assessmentTitle, score, feedback, status } = req.body;

        if (!userId || !assessmentTitle) {
            res.status(400).json({ error: 'User ID and assessment title are required' });
            return;
        }

        const newResult = await assessmentService.addResult(userId, assessmentTitle, score, feedback, status);
        res.status(201).json({ message: 'Result added successfully', result: newResult });
    } catch (err: unknown) {
        res.status(500).json({ error: getErrorMessage(err) });
    }
}; 

// 
export const updateResult = async (req: Request, res: Response): Promise<void> => {
    try {
        const { score, feedback, status } = req.body;
        const updatedResult = await assessmentService.updateResult(parseInt(req.params.id, 10), score, feedback, status);

        updatedResult
            ? res.status(200).json({ message: 'Result updated successfully', result: updatedResult })
            : res.status(404).json({ error: 'Result not found' });
    } catch (err: unknown) {
        res.status(500).json({ error: getErrorMessage(err) });
    }
};
export const getAssessmentsByTitle = async (req: Request, res: Response): Promise<void> => {
    try {
        const { assessmentTitle } = req.params;
        const assessments = await assessmentService.getAssessmentsByTitle(assessmentTitle);
        res.status(200).json(assessments);
    } catch (err: unknown) {
        res.status(500).json({ error: getErrorMessage(err) });
    }
};

export const getQuestionById = async (req: Request, res: Response): Promise<void> => {
    try {
        const question = await assessmentService.getQuestionById(parseInt(req.params.id, 10));

        question
            ? res.status(200).json(question)
            : res.status(404).json({ error: 'Question not found' });
    } catch (err: unknown) {
        res.status(500).json({ error: getErrorMessage(err) });
    }
};

export const getAllQuestions = async (_req: Request, res: Response): Promise<void> => {
    try {
        const questions = await assessmentService.getAllQuestions();
        res.status(200).json(questions);
    } catch (err: unknown) {
        res.status(500).json({ error: getErrorMessage(err) });
    }
};

