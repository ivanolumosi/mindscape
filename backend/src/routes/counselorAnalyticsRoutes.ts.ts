import express from 'express';
import {
    getRecommendedCounselors,
    searchUsers,
    sendEmojiReaction,
    getEmojiReactions,
    getUserActivityStats,
    getMentalHealthResources,
    findSimilarUsers,
    // New Counselor CRUD and Session APIs:
    viewSeekers,
    createSeeker,
    updateSeeker,
    deleteSeeker,
    sendMessage,
    viewMessages,
    markMessageRead,
    setAvailability,
    checkSlotAvailability,
    scheduleSession,
    viewSessions,
    cancelSession,
    getWeeklyTimetable
} from '../controllers/counselorAnalyticsController';

const router = express.Router();

// ---------------------------
// 🔍 Analytics Routes
// ---------------------------

router.get('/recommended/:userId', getRecommendedCounselors);
router.get('/search/:userId', searchUsers);
router.post('/emoji/send', sendEmojiReaction);
router.get('/emoji/reactions', getEmojiReactions);
router.get('/activity/:userId', getUserActivityStats);
router.get('/resources', getMentalHealthResources);
router.get('/similar/:userId', findSimilarUsers);

// ---------------------------
// 👥 Counselor: Seeker CRUD
// ---------------------------

router.get('/seekers', viewSeekers);                        // GET all seekers
router.post('/seekers', createSeeker);                      // POST create new seeker
router.put('/seekers/:id', updateSeeker);                   // PUT update seeker
router.delete('/seekers/:id', deleteSeeker);                // DELETE seeker

// ---------------------------
// 💬 Counselor: Messaging
// ---------------------------

router.post('/messages/send', sendMessage);                 // POST send message
router.get('/messages/:counselorId/:seekerId', viewMessages); // GET all messages between counselor & seeker
router.patch('/messages/:messageId/read', markMessageRead); // PATCH mark message as read

// ---------------------------
// 🕒 Counselor: Availability
// ---------------------------

router.post('/availability', setAvailability);              // POST add or update availability
router.post('/availability/check', checkSlotAvailability);  // POST check specific time slot

// ---------------------------
// 📅 Counselor: Sessions
// ---------------------------

router.post('/sessions', scheduleSession);                  // POST schedule a session
router.get('/sessions/:counselorId', viewSessions);         // GET sessions for counselor
router.delete('/sessions/:sessionId', cancelSession);       // DELETE session
router.get('/timetable/:counselorId', getWeeklyTimetable);  // GET weekly timetable
export default router;
