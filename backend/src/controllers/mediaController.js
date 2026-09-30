const { query } = require('../config/database');
const { uploadToCloud } = require('../services/cloudStorageService');

exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file was provided.' });
    }

    const file = req.file;
    let inferredType = 'document';

    if (file.mimetype.startsWith('image/')) inferredType = 'image';
    else if (file.mimetype.startsWith('audio/')) inferredType = 'audio';
    else if (file.mimetype.startsWith('video/')) inferredType = 'video';
    else if (file.mimetype.includes('pdf')) inferredType = 'document';

    // Upload to cloud storage (Cloudinary) or fallback to local uploads
    const cloudResult = await uploadToCloud(file.path);

    res.json({
      message: 'File uploaded successfully',
      file: {
        fileName: file.originalname,
        storedName: file.filename,
        fileType: inferredType,
        mimeType: file.mimetype,
        fileSize: file.size,
        fileUrl: cloudResult.url,
        cloudProvider: cloudResult.provider
      }
    });
  } catch (err) {
    console.error('File upload error:', err);
    res.status(500).json({ error: 'Failed to upload media file.' });
  }
};
