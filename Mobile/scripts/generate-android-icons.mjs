import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const svgPath = path.join(root, 'src/assets/branding/captiq-icon.svg');
const svg = fs.readFileSync(svgPath);

const densities = {
  'mipmap-mdpi': 48,
  'mipmap-hdpi': 72,
  'mipmap-xhdpi': 96,
  'mipmap-xxhdpi': 144,
  'mipmap-xxxhdpi': 192,
};

const resRoot = path.join(root, 'android/app/src/main/res');
const source1024 = path.join(root, 'src/assets/branding/captiq-icon-1024.png');

await sharp(svg).resize(1024, 1024).png().toFile(source1024);

for (const [folder, size] of Object.entries(densities)) {
  const dir = path.join(resRoot, folder);
  fs.mkdirSync(dir, { recursive: true });

  const launcher = await sharp(svg).resize(size, size).png().toBuffer();
  fs.writeFileSync(path.join(dir, 'ic_launcher.png'), launcher);
  fs.writeFileSync(path.join(dir, 'ic_launcher_round.png'), launcher);
}

console.log('Generated Android launcher icons and captiq-icon-1024.png');
