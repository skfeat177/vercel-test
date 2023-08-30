const express = require('express');
const multer = require('multer');
require('dotenv').config();
const path = require('path');
const fs = require('fs').promises;
const File = require('./file-upload-schema');
const app = express();
const port = process.env.PORT || 3000;
let filename;
let filesize;
let filetype;

// Define the directory where your static files are located
const staticFilesDirectory = path.join(__dirname, 'uploads'); // Change 'uploads' to your directory name

// Configure Express to serve static files from the specified directory
app.use(express.static(staticFilesDirectory));
console.log(staticFilesDirectory)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueFileName = Date.now() + '-' + file.originalname;
    filename = uniqueFileName;
    filetype = file.mimetype;
    cb(null, uniqueFileName);
  }
});

const saveFileDocument = async (fileType, fileSize, fileName) => {
  try {
    const newFile = new File({
      fileType: fileType,
      uploadedDate: new Date(),
      fileSize: fileSize,
      fileName: fileName
    });

    const savedFile = await newFile.save();
    console.log('File document saved:', savedFile);
    return savedFile; // Return the saved file document
  } catch (error) {
    console.error('Error saving file document:', error);
    return null; // Return null in case of error
  }
};

const upload = multer({ storage: storage });

app.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "File Upload Unsuccessful" });
  }

  // Calculate and log file size
  await calculateAndLogFileSize(req.file.path);

  // Save the file document and wait for the result
  const savedFileDocument = await saveFileDocument(filetype, filesize,filename);

  if (savedFileDocument) {
    res.json({ message: "File Uploaded Successfully", fileData: savedFileDocument });
  } else {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

const calculateAndLogFileSize = async (filePath) => {
  try {
    const stats = await fs.stat(filePath);
    const fileSizeInBytes = stats.size;
    const fileSizeInKB = fileSizeInBytes / 1024;
    filesize = fileSizeInKB.toFixed(2);
    console.log('Uploaded file size:', fileSizeInKB.toFixed(2), 'KB');
  } catch (error) {
    console.log('Error getting file size:', error);
  }
};

app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Server is Running Fine' });
});

app.get('/upload', (req, res) => {
  res.status(405).json({ status: 'ok', message: 'EndPoint Doesnt Support GET Method' });
});

app.get('/getallfiles', async (req, res) => {
  try {
    const allFiles = await File.find(); // Retrieve all documents from the File schema

    if (allFiles.length > 0) {
      res.json({ status: 'ok', message: 'All files retrieved', files: allFiles });
    } else {
      res.status(404).json({ status: 'error', message: 'No files found' });
    }
  } catch (error) {
    console.error('Error fetching all files:', error);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
});


app.get('/getfiledetails', async (req, res) => {
  const requestedFileName = req.query.filename; // Assuming you pass the file name as a query parameter

  try {
    const fileDetails = await File.findOne({ fileName: requestedFileName }).exec();

    if (fileDetails) {
      res.json({ status: 'ok', message: 'File details retrieved', fileDetails: fileDetails });
    } else {
      res.status(404).json({ status: 'error', message: 'File not found' });
    }
  } catch (error) {
    console.error('Error fetching file details:', error);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
});


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
