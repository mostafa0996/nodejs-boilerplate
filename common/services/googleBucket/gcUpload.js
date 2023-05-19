const { Storage } = require('@google-cloud/storage');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const imagesTypeMapping = require('./imagesTypeMapping');
const logger = require('../../config/logger');
const gc = new Storage({
  keyFilename: path.join(__dirname, './neon-opus-314800-e0d4eec0aa77.json'),
  projectId: 'neon-opus-314800',
});

const theEngImageBucket = gc.bucket('the-eng');

const resizeImage = (filePath, fileName) => new Promise((resolve, reject) => {
  sharp(filePath)
    .resize(600, 400)
    .toBuffer((err, buffer) => {
      if (err) {
        reject(err);
      }
      fs.writeFile(path.join(__dirname, `../../../tmp/${fileName}`), buffer, (error) => {
        if (error) {
          reject(error);
        }
        logger.info(`File compressed successfully to ${filePath}`);
        resolve(`File compressed successfully to ${filePath}`);
      });
    });
});

const gcUploader = async (file, type) => {
  const fileName = file.name;
  const filePath = file.tempFilePath;

  const destinationDir = imagesTypeMapping[type];

  return theEngImageBucket
    .upload(path.join(__dirname, `../../../tmp/${fileName}`), {
      destination: `${destinationDir}/${fileName}`,
    })
    .then((uploadedFile) => {
      const imageLink = `https://storage.googleapis.com/the-eng/${uploadedFile[1].name}`;
      fs.unlinkSync(path.join(__dirname, `../../../tmp/${fileName}`));
      return imageLink;
    })
    .catch((error) => {
      throw new Error(error);
    });
};

module.exports = gcUploader;
