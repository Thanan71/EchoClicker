import 'dotenv/config';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { removeBackground } from '@imgly/background-removal-node';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INPUT_DIR = './assets/echos';
const OUTPUT_DIR = './assets/echos-no-bg';

const config = {
  model: 'medium', // change en 'small' si tu veux tester plus vite
  output: {
    format: 'image/png',
    quality: 1.0,
  },
  publicPath: `file://${path.resolve(path.join(__dirname, 'node_modules/@imgly/background-removal-node/dist/'))}/`,
  progress: (_key, _current, _total) => {},
};

async function ensureOutputDir() {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
}

async function removeBackgroundFromImage(inputPath, outputPath) {
  try {
    // Pass the file path directly - the library supports this natively
    const result = await removeBackground(inputPath, config);

    // The library returns a Blob, convert it to Buffer
    const arrayBuffer = await result.arrayBuffer();
    const resultBuffer = Buffer.from(arrayBuffer);

    await fs.writeFile(outputPath, resultBuffer);
    return true;
  } catch (error) {
    if (error.stack) {
    }
    return false;
  }
}

async function processAllFiles() {
  await ensureOutputDir();

  const files = await fs.readdir(INPUT_DIR);
  const pngFiles = files.filter((file) => file.toLowerCase().endsWith('.png'));

  if (pngFiles.length === 0) {
    process.exit(1);
  }

  // Lire les fichiers déjà traités dans le dossier de sortie
  const outputFiles = await fs.readdir(OUTPUT_DIR);
  const processedFiles = new Set(outputFiles.map((f) => f.replace('_no_bg.png', '.png')));

  // Filtrer pour ne garder que les fichiers non traités
  const filesToProcess = pngFiles.filter((file) => !processedFiles.has(file));

  if (filesToProcess.length === 0) {
    process.exit(0);
  }

  let _successCount = 0;
  let failCount = 0;

  for (const fileName of filesToProcess) {
    const inputPath = path.join(INPUT_DIR, fileName);
    const outputPath = path.join(OUTPUT_DIR, fileName.replace('.png', '_no_bg.png'));

    const success = await removeBackgroundFromImage(inputPath, outputPath);
    if (success) {
      _successCount++;
    } else {
      failCount++;
    }
  }

  process.exit(failCount > 0 ? 1 : 0);
}

// === Partie CLI ===
const args = process.argv.slice(2);
const singleFileArg = args.find((arg) => arg.startsWith('--file='));
const modelArg = args.find((arg) => arg.startsWith('--model='));

if (modelArg) {
  const model = modelArg.split('=')[1];
  if (['small', 'medium', 'large'].includes(model)) {
    config.model = model;
  }
}

if (singleFileArg) {
  const fileName = singleFileArg.split('=')[1];
  const inputPath = path.join(INPUT_DIR, fileName);
  const outputPath = path.join(OUTPUT_DIR, fileName.replace('.png', '_no_bg.png'));

  await ensureOutputDir();

  try {
    await fs.access(inputPath);

    const success = await removeBackgroundFromImage(inputPath, outputPath);
    process.exit(success ? 0 : 1);
  } catch (_err) {
    process.exit(1);
  }
} else {
  // Pas de fichier spécifié : traiter tout le dossier
  await processAllFiles();
}
