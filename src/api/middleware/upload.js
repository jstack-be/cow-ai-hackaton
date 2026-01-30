import multer from 'multer';

// Configure multer for in-memory file storage
const storage = multer.memoryStorage();

// Filter to only accept text files
const fileFilter = (req, file, cb) => {
  // Accept .txt files
  if (file.mimetype === 'text/plain' || file.originalname.endsWith('.txt')) {
    cb(null, true);
  } else {
    cb(new Error('Only .txt files are allowed'));
  }
};

// Create multer upload instance
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

/**
 * Middleware to handle file upload and convert buffer to string
 */
export function handleFileUpload(req, res, next) {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: 'No file uploaded'
    });
  }

  try {
    // Convert buffer to string
    req.fileContent = req.file.buffer.toString('utf-8');
    req.fileName = req.file.originalname;
    next();
  } catch (error) {
    res.status(400).json({
      success: false,
      error: 'Failed to read file: ' + error.message
    });
  }
}

/**
 * Middleware to handle multiple file uploads
 */
export function handleBatchFileUpload(req, res, next) {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'No files uploaded'
    });
  }

  try {
    // Convert all files
    req.filesContent = req.files.map(file => ({
      content: file.buffer.toString('utf-8'),
      name: file.originalname
    }));
    next();
  } catch (error) {
    res.status(400).json({
      success: false,
      error: 'Failed to read files: ' + error.message
    });
  }
}

export default { upload, handleFileUpload, handleBatchFileUpload };
