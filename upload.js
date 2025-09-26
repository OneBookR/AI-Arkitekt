const AdmZip = require('adm-zip');
const path = require('path');
const fs = require('fs');

module.exports = function handleUpload(zipPath) {
  return new Promise((resolve, reject) => {
    try {
      const zip = new AdmZip(zipPath);
      const extractPath = path.join(__dirname, 'uploads', Date.now().toString());
      fs.mkdirSync(extractPath, { recursive: true });
      zip.extractAllTo(extractPath, true);
      resolve(extractPath);
    } catch (err) {
      reject(err);
    }
  });
};