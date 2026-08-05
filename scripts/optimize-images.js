const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const IMAGES_DIR = path.join(__dirname, '..', 'public', 'images');

async function processDirectory(dirPath) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      await processDirectory(fullPath);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (['.jpg', '.jpeg', '.png'].includes(ext)) {
        const stats = fs.statSync(fullPath);
        // Only optimize files larger than 250 KB
        if (stats.size > 250 * 1024) {
          console.log(`Optimizing: ${path.relative(IMAGES_DIR, fullPath)} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
          
          const tempPath = fullPath + '.tmp';
          const isLeadership = fullPath.includes('leadership');
          const maxDimension = isLeadership ? 800 : 1920;

          try {
            let instance = sharp(fullPath).resize({
              width: maxDimension,
              height: maxDimension,
              fit: 'inside',
              withoutEnlargement: true,
            });

            if (ext === '.jpg' || ext === '.jpeg') {
              instance = instance.jpeg({ quality: 80, progressive: true, mozjpeg: true });
            } else if (ext === '.png') {
              instance = instance.png({ quality: 80, compressionLevel: 8 });
            }

            await instance.toFile(tempPath);
            
            const newStats = fs.statSync(tempPath);
            fs.renameSync(tempPath, fullPath);

            console.log(`  -> Reduced to ${(newStats.size / 1024 / 1024).toFixed(2)} MB (${Math.round((1 - newStats.size / stats.size) * 100)}% savings)`);
          } catch (err) {
            console.error(`  -> Failed to optimize ${entry.name}:`, err.message);
            if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
          }
        }
      }
    }
  }
}

console.log('Starting image compression scan...');
processDirectory(IMAGES_DIR)
  .then(() => console.log('Image optimization complete!'))
  .catch((err) => console.error('Error during image optimization:', err));
