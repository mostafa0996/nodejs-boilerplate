const _ = require('lodash');
const path = require('path');
const gcUploader = require('./gcUpload');
const ErrorResponse = require('../../utils/errorResponse');

const uploadMultipleFiles = async (array, type) => {
  const result = [];
  for (let i = 0; i < array.length; i++) {
    array[i].mv(
      path.join(__dirname, '../../../tmp', array[i].name),
      function (err) {
        if (err) {
          throw new ErrorResponse(err.message, INTERNAL_SERVER_ERROR);
        }
      }
    );
    result.push(await gcUploader(array[i], type));
  }
  return result;
};

const uploadSingleFile = async (file, type) => {
  file.mv(path.join(__dirname, '../../../tmp', file.name), (err) => {
    if (err) {
      throw new ErrorResponse(err.message, INTERNAL_SERVER_ERROR);
    }
  });
  const result = await gcUploader(file, type);
  return result;
};

module.exports = {
  uploadMultipleFiles,
  uploadSingleFile,
};
