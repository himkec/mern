import path from 'path';

// Handle file upload
export const uploadFiles = async (req, res) => {
  try {
    console.log('Upload request received:', {
      files: req.files ? req.files.length : 0,
      body: req.body
    });

    if (!req.files || req.files.length === 0) {
      console.log('No files found in request');
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const urls = req.files.map(file => {
      console.log('Processing file:', file.filename);
      const fileUrl = `${baseUrl}/uploads/${file.filename}`;
      return fileUrl;
    });

    console.log('Upload successful:', urls);
    res.status(200).json({ urls });
  } catch (error) {
    console.error('Upload error:', {
      error: error.message,
      stack: error.stack,
      files: req.files,
      body: req.body
    });
    res.status(500).json({ 
      message: 'Error uploading files',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
}; 