import express from 'express';
import { getMaintenanceRequest, createMaintenanceRequest } from '../controllers/maintenanceController.js';
import { authenticateUser } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET fetch all maintenance requests registered by the logged-in resident
router.get('/', authenticateUser, getMaintenanceRequest);

// POST creating a new maintenance request
router.post('/', authenticateUser, createMaintenanceRequest);

export default router;