import sharp from 'sharp';
import { fileURLToPath } from 'node:url';

// Social crawlers commonly require a raster image rather than SVG.
// Reproducibly render our original vector source before each production build.
await sharp(fileURLToPath(new URL('../public/social-card.svg', import.meta.url)))
  .resize(1200, 630)
  .png()
  .toFile(fileURLToPath(new URL('../public/social-card.png', import.meta.url)));