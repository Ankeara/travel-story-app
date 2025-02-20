const multer = require("multer");
const path = require("path");

// Storage configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/'); // Ensure the folder exists
    },
    filename: function (req, file, cb) { 
        cb(null, Date.now() + path.extname(file.originalname)); // Correct filename formatting
    },
});

// File filter function
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) { // Fixed the typo
        cb(null, true);
    } else {
        cb(new Error('Only images are allowed'), false);
    }
};

// Initialize upload middleware
const upload = multer({ storage, fileFilter });

module.exports = upload;
