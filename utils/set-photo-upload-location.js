export const setUploadFolder = (folderName) => (req, res, next) => {
  req.folder = folderName;
  next();
};
