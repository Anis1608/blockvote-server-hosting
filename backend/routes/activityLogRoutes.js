import express from 'express';
import { getActivityLogs } from '../controllers/activityLogController.js';
import { isadmin } from '../middleware/checkisadmin.js';

const activityLogRoutes = express.Router();

activityLogRoutes.route('/activity-log').get(isadmin , getActivityLogs);

export default activityLogRoutes;