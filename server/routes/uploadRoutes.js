import express from 'express';
import { auth } from '../middleware/auth.js';
import upload from '../middleware/upload.js';
import { uploadFiles } from '../controllers/uploadController.js';

const router = express.Router();

// Upload files
router.post('/', auth, upload.array('media', 4), uploadFiles);

export default router; 