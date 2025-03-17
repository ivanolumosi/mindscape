import { Request, Response } from 'express';
import { ResourceService } from '../services/resourceService';

const resourceService = new ResourceService();

const getErrorMessage = (err: unknown): string => {
    if (err instanceof Error) return err.message;
    if (typeof err === 'string') return err;
    return 'An unknown error occurred';
};

export const addResource = async (req: Request, res: Response) => {
    try {
        const { title, description, type, url, author, datePublished, duration, eventDate } = req.body;
        const newResource = await resourceService.addResource(title, description, type, url, author, datePublished, duration, eventDate);
        res.status(201).json({ message: 'Resource added successfully', resource: newResource });
    } catch (err: unknown) {
        res.status(500).json({ error: getErrorMessage(err) });
    }
};

export const deleteResource = async (req: Request, res: Response) => {
    try {
        const success = await resourceService.deleteResource(parseInt(req.params.id, 10));
        success ? res.status(200).json({ message: 'Resource deleted successfully' }) : res.status(404).json({ error: 'Resource not found' });
    } catch (err: unknown) {
        res.status(500).json({ error: getErrorMessage(err) });
    }
};

export const getAllResources = async (_req: Request, res: Response) => {
    try {
        const resources = await resourceService.getAllResources();
        res.status(200).json(resources);
    } catch (err: unknown) {
        res.status(500).json({ error: getErrorMessage(err) });
    }
};

export const getRecentlyAddedResources = async (req: Request, res: Response) => {
    try {
        const limit = parseInt(req.query.limit as string, 10);
        const resources = await resourceService.getRecentlyAddedResources(limit);
        res.status(200).json(resources);
    } catch (err: unknown) {
        res.status(500).json({ error: getErrorMessage(err) });
    }
};

export const getResourceById = async (req: Request, res: Response) => {
    try {
        const resource = await resourceService.getResourceById(parseInt(req.params.id, 10));
        resource ? res.status(200).json(resource) : res.status(404).json({ error: 'Resource not found' });
    } catch (err: unknown) {
        res.status(500).json({ error: getErrorMessage(err) });
    }
};

export const updateResource = async (req: Request, res: Response) => {
    try {
        const { title, description, type, url, author, datePublished, duration, eventDate } = req.body;
        const updatedResource = await resourceService.updateResource(parseInt(req.params.id, 10), title, description, type, url, author, datePublished, duration, eventDate);
        updatedResource ? res.status(200).json({ message: 'Resource updated successfully', resource: updatedResource }) : res.status(404).json({ error: 'Resource not found' });
    } catch (err: unknown) {
        res.status(500).json({ error: getErrorMessage(err) });
    }
};

export const getResourcesByAuthor = async (req: Request, res: Response) => {
    try {
        const { author } = req.params;
        const resources = await resourceService.getResourcesByAuthor(author);

        res.status(200).json(resources);
    } catch (err: unknown) {
        res.status(500).json({ error: getErrorMessage(err) });
    }
};

export const getResourcesByType = async (req: Request, res: Response) => {
    try {
        const { type } = req.params;
        const resources = await resourceService.getResourcesByType(type);

        res.status(200).json(resources);
    } catch (err: unknown) {
        res.status(500).json({ error: getErrorMessage(err) });
    }
};

