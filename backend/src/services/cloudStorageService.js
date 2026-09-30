const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

// Configure Cloudinary if credentials are provided in .env
const isCloudinaryConfigured = () => {
  return !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
};

if (isCloudinaryConfigured()) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
  });
  console.log('☁️ Cloudinary Cloud Storage configured successfully.');
}

/**
 * Uploads a local file to Cloud Storage (Cloudinary)
 * @param {string} localFilePath - Path to local file
 * @param {string} folder - Destination folder in cloud
 * @returns {Promise<{ url: string, public_id: string, provider: string }>}
 */
async function uploadToCloud(localFilePath, folder = 'sensesphere_ai') {
  if (isCloudinaryConfigured()) {
    try {
      const result = await cloudinary.uploader.upload(localFilePath, {
        folder: folder,
        resource_type: 'auto'
      });
      return {
        url: result.secure_url,
        public_id: result.public_id,
        provider: 'cloudinary'
      };
    } catch (err) {
      console.warn('Cloudinary upload failed, falling back to local URL:', err.message);
    }
  }

  // Fallback: file is accessible via local server static route
  const fileName = path.basename(localFilePath);
  return {
    url: `/uploads/${fileName}`,
    public_id: fileName,
    provider: 'local'
  };
}

module.exports = {
  isCloudinaryConfigured,
  uploadToCloud
};
