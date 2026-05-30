const multer = require('multer');
const cloudinary = require('../config/cloudinary');

// Usar almacenamiento en memoria para evitar guardar archivos físicos en el servidor
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // Límite de 5MB
});

/**
 * Sube un buffer de archivo a Cloudinary y retorna la URL segura del archivo subido.
 * @param {Buffer} fileBuffer Buffer del archivo recibido por Multer
 * @param {string} folderName Nombre de la carpeta de destino en Cloudinary
 * @returns {Promise<string>} URL de la imagen en Cloudinary
 */
const uploadToCloudinary = (fileBuffer, folderName = 'estudio_tatuajes') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: folderName },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    uploadStream.end(fileBuffer);
  });
};

module.exports = { upload, uploadToCloudinary };
