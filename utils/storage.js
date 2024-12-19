const multer = require('multer');

const multerStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'utils/documents'); // Directory to save documents
    },
    filename: (req, file, cb) => {
      const timestamp = Date.now();
      const uniqueName = `${timestamp}-${file.originalname}`;
      cb(null, uniqueName);
    },
  });


exports.multerFilter = (req, file, cb) => {
    const allowedMimeTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF and Word documents are allowed.'));
    }
  };
