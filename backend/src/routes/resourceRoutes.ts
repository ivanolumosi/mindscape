import express from 'express';
import * as resourceController from '../controllers/resourceController';

const router = express.Router();

// ✅ Add a new resource
router.post('/', resourceController.addResource);

// ✅ Delete a resource by ID
router.delete('/:id', resourceController.deleteResource);

// ✅ Get all resources
router.get('/', resourceController.getAllResources);

// ✅ Get recently added resources (limit passed as query param)
router.get('/recent', resourceController.getRecentlyAddedResources);

// ✅ Get resource by ID
router.get('/:id', resourceController.getResourceById);

// ✅ Get resources by author
router.get('/author/:author', resourceController.getResourcesByAuthor);

// ✅ Get resources by type
router.get('/type/:type', resourceController.getResourcesByType);

// ✅ Update a resource by ID
router.patch('/:id', resourceController.updateResource);

export default router;
