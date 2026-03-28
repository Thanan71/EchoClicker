import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';
import { removeBackground } from '@imgly/background-removal-node';
import fs from 'fs/promises';

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
    progress: (key, current, total) => {
        console.log(`⏳ ${key}: ${current}/${total}`);
    },
};

async function ensureOutputDir() {
    await fs.mkdir(OUTPUT_DIR, { recursive: true });
}

async function removeBackgroundFromImage(inputPath, outputPath) {
    try {
        console.log(`🎨 Traitement: ${path.basename(inputPath)}`);

        // Pass the file path directly - the library supports this natively
        const result = await removeBackground(inputPath, config);

        // The library returns a Blob, convert it to Buffer
        const arrayBuffer = await result.arrayBuffer();
        const resultBuffer = Buffer.from(arrayBuffer);

        await fs.writeFile(outputPath, resultBuffer);

        console.log(`✅ Sauvegardé avec succès: ${path.basename(outputPath)}`);
        return true;
    } catch (error) {
        console.error(`❌ Erreur pour ${path.basename(inputPath)}:`, error.message);
        if (error.stack) {
            console.error(error.stack.split('\n').slice(0, 6).join('\n'));
        }
        return false;
    }
}

async function processAllFiles() {
    await ensureOutputDir();

    const files = await fs.readdir(INPUT_DIR);
    const pngFiles = files.filter((file) => file.toLowerCase().endsWith('.png'));

    if (pngFiles.length === 0) {
        console.log('❌ Aucun fichier PNG trouvé dans le dossier');
        process.exit(1);
    }

    // Lire les fichiers déjà traités dans le dossier de sortie
    const outputFiles = await fs.readdir(OUTPUT_DIR);
    const processedFiles = new Set(outputFiles.map((f) => f.replace('_no_bg.png', '.png')));

    // Filtrer pour ne garder que les fichiers non traités
    const filesToProcess = pngFiles.filter((file) => !processedFiles.has(file));

    if (filesToProcess.length === 0) {
        console.log('✅ Tous les fichiers ont déjà été traités !');
        process.exit(0);
    }

    console.log(`🎯 ${filesToProcess.length} fichier(s) à traiter (sur ${pngFiles.length} total)...\n`);

    let successCount = 0;
    let failCount = 0;

    for (const fileName of filesToProcess) {
        const inputPath = path.join(INPUT_DIR, fileName);
        const outputPath = path.join(OUTPUT_DIR, fileName.replace('.png', '_no_bg.png'));

        const success = await removeBackgroundFromImage(inputPath, outputPath);
        if (success) {
            successCount++;
        } else {
            failCount++;
        }
        console.log(''); // Ligne vide entre les fichiers
    }

    console.log(`\n📊 Résumé:`);
    console.log(`   ✅ Succès: ${successCount}`);
    console.log(`   ❌ Échecs: ${failCount}`);
    console.log(`   📁 Traités cette session: ${filesToProcess.length}`);
    console.log(`   📁 Total images: ${pngFiles.length}`);

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
        console.log(`🎯 Modèle : ${model}`);
    }
}

if (singleFileArg) {
    const fileName = singleFileArg.split('=')[1];
    const inputPath = path.join(INPUT_DIR, fileName);
    const outputPath = path.join(OUTPUT_DIR, fileName.replace('.png', '_no_bg.png'));

    await ensureOutputDir();

    try {
        await fs.access(inputPath);
        console.log(`🎯 Traitement fichier : ${fileName}\n`);

        const success = await removeBackgroundFromImage(inputPath, outputPath);
        process.exit(success ? 0 : 1);
    } catch (err) {
        console.error(`❌ Fichier non trouvé ou inaccessible : ${fileName}`);
        process.exit(1);
    }
} else {
    // Pas de fichier spécifié : traiter tout le dossier
    await processAllFiles();
}
