const fs = require('fs');
const path = require('path');

// Path to the problematic file
const browserFile = path.resolve(__dirname, '../node_modules/@prisma/client/index-browser.js');
const mainFile = path.resolve(__dirname, '../node_modules/@prisma/client/index.js');

// Check if files exist
if (fs.existsSync(browserFile) && fs.existsSync(mainFile)) {
  console.log('Creating Prisma iOS fix...');
  
  // Read the main index.js content
  const mainContent = fs.readFileSync(mainFile, 'utf8');
  
  // Backup the browser file if not already backed up
  const backupFile = `${browserFile}.backup`;
  if (!fs.existsSync(backupFile)) {
    fs.copyFileSync(browserFile, backupFile);
    console.log('Created backup of index-browser.js');
  }
  
  // Replace the browser file with the main file content
  fs.writeFileSync(browserFile, mainContent);
  console.log('Fixed Prisma for iOS bundling!');
} else {
  console.log('Prisma files not found. Skipping iOS fix.');
}