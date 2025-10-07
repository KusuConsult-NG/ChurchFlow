// lib/file-service.js
const fs = require('fs');
const path = require('path');

const { v2: cloudinary } = require('cloudinary');
const multer = require('multer');
const sharp = require('sharp');

// File service configuration
const fileConfig = {
  // Cloudinary configuration
  cloudinary: {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
  },

  // File upload limits
  limits: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    maxFiles: 5,
    allowedTypes: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'text/plain'
    ]
  },

  // Image processing settings
  imageProcessing: {
    maxWidth: 1920,
    maxHeight: 1080,
    quality: 85,
    formats: ['webp', 'jpeg', 'png']
  },

  // Storage settings
  storage: {
    localPath: './uploads',
    cloudinaryFolder: 'churchflow'
  }
};

// Initialize Cloudinary
if (fileConfig.cloudinary.cloud_name) {
  cloudinary.config(fileConfig.cloudinary);
}

// File service class
class FileService {
  constructor() {
    this.provider = this.determineProvider();
    this.ensureLocalDirectory();
  }

  determineProvider() {
    if (fileConfig.cloudinary.cloud_name && fileConfig.cloudinary.api_key) {
      return 'cloudinary';
    } else {
      return 'local';
    }
  }

  ensureLocalDirectory() {
    if (this.provider === 'local') {
      const uploadDir = fileConfig.storage.localPath;
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
    }
  }

  // Upload file
  async uploadFile(file, options = {}) {
    try {
      // Validate file
      const validation = this.validateFile(file);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      // Process file based on type
      const processedFile = await this.processFile(file, options);

      // Upload to configured provider
      switch (this.provider) {
      case 'cloudinary':
        return await this.uploadToCloudinary(processedFile, options);
      default:
        return await this.uploadToLocal(processedFile, options);
      }
    } catch (error) {
      console.error('❌ File upload failed:', error);
      throw error;
    }
  }

  // Validate file
  validateFile(file) {
    // Check file size
    if (file.size > fileConfig.limits.maxFileSize) {
      return {
        valid: false,
        error: `File size exceeds limit of ${fileConfig.limits.maxFileSize / 1024 / 1024}MB`
      };
    }

    // Check file type
    if (!fileConfig.limits.allowedTypes.includes(file.mimetype)) {
      return {
        valid: false,
        error: `File type ${file.mimetype} is not allowed`
      };
    }

    return { valid: true };
  }

  // Process file based on type
  async processFile(file, options) {
    const isImage = file.mimetype.startsWith('image/');

    if (isImage && options.processImage !== false) {
      return await this.processImage(file, options);
    }

    return file;
  }

  // Process image
  async processImage(file, options) {
    try {
      const buffer = file.buffer;
      const { maxWidth, maxHeight, quality } = fileConfig.imageProcessing;

      // Resize and optimize image
      const processedBuffer = await sharp(buffer)
        .resize(maxWidth, maxHeight, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({ quality })
        .webp({ quality })
        .toBuffer();

      return {
        ...file,
        buffer: processedBuffer,
        size: processedBuffer.length,
        mimetype: 'image/webp'
      };
    } catch (error) {
      console.error('❌ Image processing failed:', error);
      return file; // Return original if processing fails
    }
  }

  // Upload to Cloudinary
  async uploadToCloudinary(file, options) {
    try {
      const folder = options.folder || fileConfig.storage.cloudinaryFolder;
      const publicId =
        options.publicId || this.generatePublicId(file.originalname);

      const result = await cloudinary.uploader.upload(
        `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
        {
          folder,
          public_id: publicId,
          resource_type: 'auto',
          transformation: options.transformations || []
        }
      );

      return {
        success: true,
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        size: result.bytes,
        provider: 'cloudinary',
        metadata: {
          width: result.width,
          height: result.height,
          createdAt: result.created_at
        }
      };
    } catch (error) {
      throw new Error(`Cloudinary upload failed: ${error.message}`);
    }
  }

  // Upload to local storage
  async uploadToLocal(file, options) {
    try {
      const filename = this.generateFilename(file.originalname);
      const filepath = path.join(fileConfig.storage.localPath, filename);

      // Write file to disk
      fs.writeFileSync(filepath, file.buffer);

      // Generate URL
      const url = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/uploads/${filename}`;

      return {
        success: true,
        url,
        filename,
        filepath,
        size: file.size,
        provider: 'local',
        metadata: {
          mimetype: file.mimetype,
          uploadedAt: new Date().toISOString()
        }
      };
    } catch (error) {
      throw new Error(`Local upload failed: ${error.message}`);
    }
  }

  // Delete file
  async deleteFile(identifier, options = {}) {
    try {
      switch (this.provider) {
      case 'cloudinary':
        return await this.deleteFromCloudinary(identifier);
      default:
        return await this.deleteFromLocal(identifier);
      }
    } catch (error) {
      console.error('❌ File deletion failed:', error);
      throw error;
    }
  }

  // Delete from Cloudinary
  async deleteFromCloudinary(publicId) {
    try {
      const result = await cloudinary.uploader.destroy(publicId);

      return {
        success: result.result === 'ok',
        message:
          result.result === 'ok'
            ? 'File deleted successfully'
            : 'File not found',
        provider: 'cloudinary'
      };
    } catch (error) {
      throw new Error(`Cloudinary deletion failed: ${error.message}`);
    }
  }

  // Delete from local storage
  async deleteFromLocal(filename) {
    try {
      const filepath = path.join(fileConfig.storage.localPath, filename);

      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
        return {
          success: true,
          message: 'File deleted successfully',
          provider: 'local'
        };
      } else {
        return {
          success: false,
          message: 'File not found',
          provider: 'local'
        };
      }
    } catch (error) {
      throw new Error(`Local deletion failed: ${error.message}`);
    }
  }

  // Generate unique filename
  generateFilename(originalName) {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const extension = path.extname(originalName);
    const name = path.basename(originalName, extension);

    return `${name}-${timestamp}-${random}${extension}`;
  }

  // Generate public ID for Cloudinary
  generatePublicId(originalName) {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const name = path.basename(originalName, path.extname(originalName));

    return `${name}-${timestamp}-${random}`;
  }

  // Get file info
  async getFileInfo(identifier) {
    try {
      switch (this.provider) {
      case 'cloudinary':
        return await this.getCloudinaryInfo(identifier);
      default:
        return await this.getLocalInfo(identifier);
      }
    } catch (error) {
      console.error('❌ Get file info failed:', error);
      throw error;
    }
  }

  // Get Cloudinary file info
  async getCloudinaryInfo(publicId) {
    try {
      const result = await cloudinary.api.resource(publicId);

      return {
        success: true,
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        size: result.bytes,
        width: result.width,
        height: result.height,
        createdAt: result.created_at,
        provider: 'cloudinary'
      };
    } catch (error) {
      throw new Error(`Cloudinary info retrieval failed: ${error.message}`);
    }
  }

  // Get local file info
  async getLocalInfo(filename) {
    try {
      const filepath = path.join(fileConfig.storage.localPath, filename);

      if (fs.existsSync(filepath)) {
        const stats = fs.statSync(filepath);
        const url = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/uploads/${filename}`;

        return {
          success: true,
          url,
          filename,
          size: stats.size,
          createdAt: stats.birthtime,
          modifiedAt: stats.mtime,
          provider: 'local'
        };
      } else {
        throw new Error('File not found');
      }
    } catch (error) {
      throw new Error(`Local info retrieval failed: ${error.message}`);
    }
  }

  // Generate image transformations
  generateImageTransformations(options = {}) {
    const transformations = [];

    if (options.width || options.height) {
      transformations.push({
        width: options.width,
        height: options.height,
        crop: options.crop || 'fill',
        gravity: options.gravity || 'auto'
      });
    }

    if (options.quality) {
      transformations.push({ quality: options.quality });
    }

    if (options.format) {
      transformations.push({ format: options.format });
    }

    return transformations;
  }
}

// Export singleton instance
const fileService = new FileService();

// Multer configuration for file uploads
const uploadConfig = {
  // Memory storage for processing
  storage: multer.memoryStorage(),

  // File filter
  fileFilter: (req, file, cb) => {
    if (fileConfig.limits.allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} is not allowed`), false);
    }
  },

  // Limits
  limits: {
    fileSize: fileConfig.limits.maxFileSize,
    files: fileConfig.limits.maxFiles
  }
};

// Create multer instance
const upload = multer(uploadConfig);

// Utility functions
const fileUtils = {
  // Get file extension
  getFileExtension(filename) {
    return path.extname(filename).toLowerCase();
  },

  // Check if file is image
  isImage(mimetype) {
    return mimetype.startsWith('image/');
  },

  // Check if file is document
  isDocument(mimetype) {
    const documentTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    return documentTypes.includes(mimetype);
  },

  // Format file size
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  // Generate thumbnail URL (Cloudinary)
  generateThumbnailUrl(publicId, options = {}) {
    if (fileService.provider === 'cloudinary') {
      const transformations = fileService.generateImageTransformations({
        width: options.width || 300,
        height: options.height || 200,
        crop: 'fill',
        quality: 80,
        format: 'webp'
      });

      return cloudinary.url(publicId, {
        transformation: transformations
      });
    }

    return null;
  },

  // Clean up old files
  async cleanupOldFiles(maxAge = 30 * 24 * 60 * 60 * 1000) {
    // 30 days
    if (fileService.provider === 'local') {
      const uploadDir = fileConfig.storage.localPath;
      const files = fs.readdirSync(uploadDir);
      const now = Date.now();

      for (const file of files) {
        const filepath = path.join(uploadDir, file);
        const stats = fs.statSync(filepath);

        if (now - stats.mtime.getTime() > maxAge) {
          fs.unlinkSync(filepath);
          console.log(`🗑️ Cleaned up old file: ${file}`);
        }
      }
    }
  }
};

// Export all functions and objects
module.exports = {
  fileConfig,
  fileService,
  uploadConfig,
  upload,
  fileUtils
};
