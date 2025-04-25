import { Router } from 'express';
import {
    createPost,
    updatePost,
    deletePost,
    addComment,
    updateComment,
    deleteComment,
    getPostWithComments,
    getUserTimeline,
    getFeed
} from '../controllers/postController';

const router = Router();

// Posts
router.post('/post', createPost);
router.put('/post', updatePost);
router.delete('/post', deletePost);

// Comments
router.post('/comment', addComment);
router.put('/comment', updateComment);
router.delete('/comment', deleteComment);

// Fetch
router.get('/post/:postId', getPostWithComments);
router.get('/timeline/:userId', getUserTimeline);
router.get('/feed/:userId', getFeed);

export default router;
