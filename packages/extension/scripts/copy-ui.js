const fs = require('fs');
const path = require('path');

const dirs = ['pages', 'scripts', 'styles'];

dirs.forEach(dir => {
  const srcDir = path.join(__dirname, '..', 'src', 'ui', dir);
  const destDir = path.join(__dirname, '..', 'out', 'ui', dir);
  
  // Create destination directory if it doesn't exist
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  
  // Copy all files except TypeScript files
  if (fs.existsSync(srcDir)) {
    fs.readdirSync(srcDir).forEach(file => {
      if (!file.endsWith('.ts') && !file.endsWith('.tsx')) {
        const srcFile = path.join(srcDir, file);
        const destFile = path.join(destDir, file);
        fs.copyFileSync(srcFile, destFile);
        console.log(`Copied ${file} to ${destDir}`);
      }
    });
  }
});

console.log('UI files copied successfully');
