const multer = require('multer');
const path = require('path');

// Configure multer for memory storage so we can upload directly to Cloudinary
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    // We only want to accept image files
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  },
  limits: { fileSize: 5 * 1024 * 1024 } // Set a 5MB file size limit
});

module.exports = upload;