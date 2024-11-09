const fs = require('fs');
const path = require('path');

// Define the source and destination paths
const src = path.join(__dirname, 'public', '.htaccess');
const dest = path.join(__dirname, 'build', '.htaccess');

// Copy the .htaccess file after build
fs.copyFile(src, dest, (err) => {
  if (err) {
    console.error('Error copying .htaccess:', err);
  } else {
    console.log('.htaccess copied to build folder');
  }
});