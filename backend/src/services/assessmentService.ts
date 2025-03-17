import { poolPromise } from '../db';
import * as sql from 'mssql';
import { QuestionAssessment } from '../interfaces/QuestionAssessment';
import { Response } from '../interfaces/Response';
import { Result } from '../interfaces/Result';

export class AssessmentService {
    // ✅ Add a new question to an assessment
    public async addQuestion(
        assessmentTitle: string,
        questionText: string,
        questionType: 'Multiple Choice' | 'Open Ended' | 'Scale',
        options: string | null,
        isRequired: boolean
    ): Promise<QuestionAssessment> {
        const query = `
            EXEC AddQuestion @assessment_title, @question_text, @question_type, @options, @is_required;
            SELECT * FROM QuestionsAssessment WHERE id = SCOPE_IDENTITY();
        `;
        const pool = await poolPromise;
        const result = await pool.request()
            .input('assessment_title', sql.NVarChar(255), assessmentTitle)
            .input('question_text', sql.NVarChar(sql.MAX), questionText)
            .input('question_type', sql.NVarChar(50), questionType)
            .input('options', sql.NVarChar(sql.MAX), options)
            .input('is_required', sql.Bit, isRequired)
            .query(query);

        return result.recordset[0];
    }

    public async addResult(
        userId: number,
        assessmentTitle: string,
        score: number | null,
        feedback: string | null,
        status: string = 'Completed'
    ): Promise<Result> {
        try {
            const pool = await poolPromise;

            // Ensure user exists
            const userExists = await pool.request()
                .input('user_id', sql.Int, userId)
                .query('SELECT id FROM Users WHERE id = @user_id');

            if (userExists.recordset.length === 0) {
                throw new Error(`User with ID ${userId} does not exist.`);
            }

            // Insert result into the database
            const query = `
                EXEC AddResult @user_id, @assessment_title, @score, @feedback, @status;
            `;

            const result = await pool.request()
                .input('user_id', sql.Int, userId)
                .input('assessment_title', sql.NVarChar(255), assessmentTitle)
                .input('score', sql.Int, score)
                .input('feedback', sql.NVarChar(sql.MAX), feedback)
                .input('status', sql.NVarChar(50), status)
                .query(query);

            if (result.recordset.length === 0) {
                throw new Error('Failed to insert result.');
            }

            return result.recordset[0];
        } catch (error: unknown) {
            console.error('Error adding result:', error);
            throw new Error(error instanceof Error ? error.message : 'An unknown error occurred');
        }
    }

    // ✅ Delete a question by ID
    public async deleteQuestion(id: number): Promise<boolean> {
        const query = 'EXEC DeleteQuestion @id';
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query(query);

        return result.rowsAffected[0] > 0;
    }

    // ✅ Get all questions for a specific assessment
    public async getQuestionsByAssessment(assessmentTitle: string): Promise<QuestionAssessment[]> {
        const query = 'EXEC GetQuestionsByAssessment @assessment_title';
        const pool = await poolPromise;
        const result = await pool.request()
            .input('assessment_title', sql.NVarChar(255), assessmentTitle)
            .query(query);

        return result.recordset;
    }

    // ✅ Add a new response from a user
    public async addResponse(
        userId: number,
        questionId: number,
        responseText: string | null,
        selectedOption: string | null
    ): Promise<Response> {
        try {
            const pool = await poolPromise;
    
            console.log(`Executing SQL Query:
                EXEC AddResponse @user_id = ${userId}, @question_id = ${questionId}, @response_text = ${responseText}, @selected_option = ${selectedOption}`);
    
            const result = await pool.request()
                .input('user_id', sql.Int, userId)
                .input('question_id', sql.Int, questionId)
                .input('response_text', sql.NVarChar(sql.MAX), responseText)
                .input('selected_option', sql.NVarChar(sql.MAX), selectedOption)
                .query(`
                    EXEC AddResponse @user_id, @question_id, @response_text, @selected_option;
                    SELECT TOP 1 * FROM Responses ORDER BY id DESC;
                `);
    
            console.log('Database Response:', result.recordset); // ✅ Debugging Log
    
            if (!result.recordset || result.recordset.length === 0) {
                throw new Error('Failed to insert response.');
            }
    
            return result.recordset[0];
        } catch (error: unknown) {
            console.error('Error adding response:', error);
            throw new Error(error instanceof Error ? error.message : 'An unknown error occurred');
        }
    }
     
    
    public async getAssessmentsByTitle(assessmentTitle: string): Promise<{ assessment_title: string }[]> {
        const query = 'EXEC GetAssessmentsByTitle @assessment_title';
        const pool = await poolPromise;
        const result = await pool.request()
            .input('assessment_title', sql.NVarChar(255), assessmentTitle)
            .query(query);
    
        return result.recordset;
    }
    
    public async getQuestionById(id: number): Promise<QuestionAssessment | null> {
        const query = 'EXEC GetQuestionById @id';
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query(query);
    
        return result.recordset.length ? result.recordset[0] : null;
    }
    
    public async getAllQuestions(): Promise<QuestionAssessment[]> {
        const query = 'EXEC GetAllQuestions';
        const pool = await poolPromise;
        const result = await pool.request().query(query);
    
        return result.recordset;
    }
    

    // ✅ Get all responses for a user and a specific assessment
    public async getResponsesByUserAndAssessment(userId: number, assessmentTitle: string): Promise<Response[]> {
        const query = 'EXEC GetResponsesByUserAndAssessment @user_id, @assessment_title';
        const pool = await poolPromise;
        const result = await pool.request()
            .input('user_id', sql.Int, userId)
            .input('assessment_title', sql.NVarChar(255), assessmentTitle)
            .query(query);

        return result.recordset;
    }

    // ✅ Update an existing response
    public async updateResponse(id: number, responseText: string | null, selectedOption: string | null): Promise<Response | null> {
        const query = `
            EXEC UpdateResponse @id, @response_text, @selected_option;
            SELECT * FROM Responses WHERE id = @id;
        `;
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.Int, id)
            .input('response_text', sql.NVarChar(sql.MAX), responseText)
            .input('selected_option', sql.NVarChar(sql.MAX), selectedOption)
            .query(query);

        return result.recordset.length ? result.recordset[0] : null;
    }

    // ✅ Get all results for a specific assessment
    public async getResultsByAssessment(assessmentTitle: string): Promise<Result[]> {
        const query = 'EXEC GetResultsByAssessment @assessment_title';
        const pool = await poolPromise;
        const result = await pool.request()
            .input('assessment_title', sql.NVarChar(255), assessmentTitle)
            .query(query);

        return result.recordset;
    }

    // ✅ Get all results for a specific user
    public async getResultsByUser(userId: number): Promise<Result[]> {
        const query = 'EXEC GetResultsByUser @user_id';
        const pool = await poolPromise;
        const result = await pool.request()
            .input('user_id', sql.Int, userId)
            .query(query);

        return result.recordset;
    }

    // ✅ Update an assessment question
    public async updateQuestion(
        id: number,
        assessmentTitle: string,
        questionText: string,
        questionType: 'Multiple Choice' | 'Open Ended' | 'Scale',
        options: string | null,
        isRequired: boolean
    ): Promise<QuestionAssessment | null> {
        const query = `
            EXEC UpdateQuestion @id, @assessment_title, @question_text, @question_type, @options, @is_required;
            SELECT * FROM QuestionsAssessment WHERE id = @id;
        `;
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.Int, id)
            .input('assessment_title', sql.NVarChar(255), assessmentTitle)
            .input('question_text', sql.NVarChar(sql.MAX), questionText)
            .input('question_type', sql.NVarChar(50), questionType)
            .input('options', sql.NVarChar(sql.MAX), options)
            .input('is_required', sql.Bit, isRequired)
            .query(query);

        return result.recordset.length ? result.recordset[0] : null;
    }

    // ✅ Update an assessment result
    public async updateResult(id: number, score: number | null, feedback: string | null, status: string): Promise<Result | null> {
        const query = `
            EXEC UpdateResult @id, @score, @feedback, @status;
            SELECT * FROM Results WHERE id = @id;
        `;
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.Int, id)
            .input('score', sql.Int, score)
            .input('feedback', sql.NVarChar(sql.MAX), feedback)
            .input('status', sql.NVarChar(50), status)
            .query(query);

        return result.recordset.length ? result.recordset[0] : null;
    }
}
