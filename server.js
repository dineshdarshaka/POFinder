const express = require('express');
   const bodyParser = require('body-parser');
   const multer = require('multer');
   const XLSX = require('xlsx');
   const fs = require('fs');
   const cors = require('cors');
   const path = require('path');

   const app = express();
   app.use(cors());
   app.use(bodyParser.json());

   // Serve static files from the "public" folder
   app.use(express.static(path.join(__dirname, 'public')));

   // File upload configuration
   const storage = multer.diskStorage({
     destination: (req, file, cb) => cb(null, 'uploads/'),
     filename: (req, file, cb) => cb(null, file.originalname)
   });
   const upload = multer({ storage });

   // Data storage
   let postOfficeData = [];
   try {
     postOfficeData = JSON.parse(fs.readFileSync('data.json'));
   } catch (err) {
     fs.writeFileSync('data.json', '[]');
   }

   // API Endpoints

   // Get all data
   app.get('/api/data', (req, res) => {
     res.json(postOfficeData);
   });

   // Save edited data
   app.post('/api/save', (req, res) => {
     postOfficeData = req.body;
     fs.writeFileSync('data.json', JSON.stringify(postOfficeData));
     res.send('Data saved successfully');
   });

   // Upload Excel file
   app.post('/api/upload', upload.single('file'), (req, res) => {
     const workbook = XLSX.readFile(req.file.path);
     const sheetName = workbook.SheetNames[0];
     const worksheet = workbook.Sheets[sheetName];
     postOfficeData = XLSX.utils.sheet_to_json(worksheet);
     
     fs.writeFileSync('data.json', JSON.stringify(postOfficeData));
     fs.unlinkSync(req.file.path); // Delete uploaded file
     
     res.json(postOfficeData);
   });

   // Start server
   const PORT = process.env.PORT || 3001;
   app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

