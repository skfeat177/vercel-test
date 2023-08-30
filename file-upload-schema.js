// fileSchema.js
const mongoose = require('./db'); // Import the MongoDB connection
const Schema = mongoose.Schema;

// Define the schema
const fileSchema = new Schema({
  fileType: String,
  uploadedDate: Date,
  fileSize: Number,
  fileName: String
});

// Create a model based on the schema
const File = mongoose.model('File', fileSchema);

module.exports = File;
