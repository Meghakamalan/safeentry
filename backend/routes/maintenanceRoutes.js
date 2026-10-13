import express from 'express';
import { getMaintenanceRequest, createMaintenanceRequest, updateMaintenanceRequest } from '../controllers/maintenanceController.js';
import { authenticateUser } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET fetch all maintenance requests registered by the logged-in resident
router.get('/', authenticateUser, getMaintenanceRequest);

// POST creating a new maintenance request
router.post('/', authenticateUser, createMaintenanceRequest);

// PUT Update an existing maintenance request
router.put('/:id', authenticateUser, updateMaintenanceRequest);

export default router;