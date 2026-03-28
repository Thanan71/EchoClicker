// generate-sprites.js  (Version finale avec auto-update - Mars 2026)
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';

// Clé API chargée depuis .env (NE PAS COMMITER la clé !)
const API_KEY = process.env.LEONARDO_API_KEY;
const PIXELART_JSON = './echoesData_pixelArt.json';
const GAME_DATA_FILE = './js/data/echoesData.js';
const OUTPUT_DIR = './assets/echos';

if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const data = JSON.parse(fs.readFileSync(PIXELART_JSON, 'utf8'));

// Modèle recommandé 2026 pour pixel art
const MODEL_ID = 'de7d3faf-762f-48e0-b3b7-9d0ac3a3fcf3'; // Phoenix (meilleur pour cohérence)

async function generateImage(prompt, filename) {
    console.log(`🎨 Lancement → ${filename}`);

    const response = await fetch('https://cloud.leonardo.ai/api/rest/v1/generations', {
        method: 'POST',
        headers: {
            accept: 'application/json',
            authorization: `Bearer ${API_KEY}`,
            'content-type': 'application/json',
        },
        body: JSON.stringify({
            prompt: prompt,
            modelId: MODEL_ID,
            num_images: 1,
            width: 512,
            height: 512,
            alchemy: true,
            presetStyle: 'PIXEL_ART',
            guidance_scale: 8,
            num_inference_steps: 35,
            scheduler: 'EULER_DISCRETE',
        }),
    });

    if (!response.ok) {
        const errText = await response.text().catch(() => '');
        console.error(
            `❌ POST échoué pour ${filename} (HTTP ${response.status}). ${errText ? `Body: ${errText.slice(0, 400)}` : ''}`,
        );
        return false;
    }

    const result = await response.json();
    const generationId =
        result?.sdGenerationJob?.generationId || result?.sdGenerationJob?.id || result?.generationId || result?.id;

    if (!generationId) {
        console.error(`❌ Impossible de lancer ${filename}`);
        return false;
    }

    console.log(`   ⏳ Attente génération (ID: ${generationId})...`);

    const maxAttempts = 180; // jusqu'à ~9 minutes (3s * 180)
    const delayMs = 3000;
    // Leonardo renvoie parfois "COMPLETE" (sans D) selon les modèles/réponses.
    // On accepte plusieurs variantes pour éviter les faux timeouts.
    const doneStatuses = new Set(['COMPLETED', 'COMPLETE', 'SUCCESS', 'SUCCEEDED', 'READY', 'FINISHED', 'DONE', 'OK']);

    let lastStatus = null;
    for (let i = 0; i < maxAttempts; i++) {
        await new Promise((r) => setTimeout(r, delayMs));

        const statusRes = await fetch(`https://cloud.leonardo.ai/api/rest/v1/generations/${generationId}`, {
            headers: { authorization: `Bearer ${API_KEY}` },
        });

        if (!statusRes.ok) {
            const errText = await statusRes.text().catch(() => '');
            console.error(
                `⚠️  Statut HTTP ${statusRes.status} pour ${filename}. ${errText ? `Body: ${errText.slice(0, 300)}` : ''}`,
            );
            continue;
        }

        const statusData = await statusRes.json();

        const generation = statusData.generations_by_pk || statusData.generations?.[0];

        if (!generation) continue;

        const status = generation?.status || statusData?.status || generation?.state || statusData?.state;

        if (status !== lastStatus && status) {
            console.log(`   📍 ${filename}: status=${status} (essai ${i + 1}/${maxAttempts})`);
            lastStatus = status;
        }

        if (doneStatuses.has(status)) {
            const imageObj = generation.generated_images?.[0];
            const imageUrl =
                imageObj?.url || imageObj?.imageUrl || imageObj?.image_url || imageObj?.downloadUrl || generation?.url;

            if (!imageUrl) {
                console.error(`⛔ ${filename}: ${status} mais URL d'image introuvable.`);
                if (generation?.generated_images?.length) {
                    console.error('generated_images[0] =>', generation.generated_images[0]);
                } else {
                    console.error('generated_images vide / absente.');
                }
                continue;
            }

            const imgRes = await fetch(imageUrl);
            if (!imgRes.ok) {
                const errText = await imgRes.text().catch(() => '');
                console.error(
                    `❌ Téléchargement image échoué pour ${filename} (HTTP ${imgRes.status}). ${errText ? `Body: ${errText.slice(0, 300)}` : ''}`,
                );
                return false;
            }

            const buffer = await imgRes.arrayBuffer();
            fs.writeFileSync(path.join(OUTPUT_DIR, filename), Buffer.from(buffer));
            console.log(`✅ Sauvegardé : ${filename}`);
            return true;
        } else if (generation.status === 'FAILED' || status === 'FAILED' || status === 'ERROR') {
            console.error(`❌ Échec pour ${filename}`);
            return false;
        }
    }

    console.log(`⏰ Timeout pour ${filename} (vérifie sur le site Leonardo)`);
    return false;
}

// ====================== GÉNÉRATION ======================
const echoStart = Number(process.env.ECHO_START || 0);
const echoLimit = Number(process.env.ECHO_LIMIT || data.echoes.length);

// Filtrer les échos qui n'ont pas encore été générés (ou dont les fichiers manquent)
const echoesToGenerate = data.echoes.slice(echoStart, echoStart + echoLimit).filter((echo) => {
    const baseFilename = `echo_${echo.id.toString().padStart(3, '0')}.png`;
    const shinyFilename = `echo_${echo.id.toString().padStart(3, '0')}_shiny.png`;
    const baseExists = fs.existsSync(path.join(OUTPUT_DIR, baseFilename));
    const shinyExists = fs.existsSync(path.join(OUTPUT_DIR, shinyFilename));

    // Garder l'écho si pas marqué généré OU si un des fichiers manque
    return echo.generated !== true || !baseExists || !shinyExists;
});

console.log(`🚀 Démarrage génération Leonardo AI (${echoesToGenerate.length} échos à traiter)...\n`);

// ===== PREMIÈRE PASSE : Générer tous les sprites NON-SHINY =====
console.log('📸 Phase 1/2 : Génération des sprites normaux (non-shiny)...\n');

for (const echo of echoesToGenerate) {
    const baseFilename = `echo_${echo.id.toString().padStart(3, '0')}.png`;
    const baseFilepath = path.join(OUTPUT_DIR, baseFilename);

    // Vérifier si le fichier existe déjà
    if (fs.existsSync(baseFilepath)) {
        console.log(`⏭️  ${baseFilename} existe déjà, passage au suivant`);
        continue;
    }

    const basePrompt = echo.pixelArtPrompt;
    const okBase = await generateImage(basePrompt, baseFilename);

    if (okBase) {
        echo.generatedBase = true;
    }

    await new Promise((r) => setTimeout(r, 1000)); // petite pause
}

// ===== DEUXIÈME PASSE : Générer tous les sprites SHINY =====
console.log('\n✨ Phase 2/2 : Génération des sprites shiny...\n');

for (const echo of echoesToGenerate) {
    const shinyFilename = `echo_${echo.id.toString().padStart(3, '0')}_shiny.png`;
    const shinyFilepath = path.join(OUTPUT_DIR, shinyFilename);

    // Vérifier si le fichier existe déjà
    if (fs.existsSync(shinyFilepath)) {
        console.log(`⏭️  ${shinyFilename} existe déjà, passage au suivant`);
        continue;
    }

    const basePrompt = echo.pixelArtPrompt;
    const shinyPrompt =
        basePrompt +
        ', shiny variant, glowing aura, luminous edges, inverted vibrant colors, sparkling particles, premium quality, high contrast';
    const okShiny = await generateImage(shinyPrompt, shinyFilename);

    if (okShiny) {
        echo.generatedShiny = true;
    }

    await new Promise((r) => setTimeout(r, 1000)); // petite pause
}

// Marquer comme généré seulement si les deux variantes sont OK
for (const echo of echoesToGenerate) {
    const baseFilename = `echo_${echo.id.toString().padStart(3, '0')}.png`;
    const shinyFilename = `echo_${echo.id.toString().padStart(3, '0')}_shiny.png`;
    const baseExists = fs.existsSync(path.join(OUTPUT_DIR, baseFilename));
    const shinyExists = fs.existsSync(path.join(OUTPUT_DIR, shinyFilename));

    if (baseExists && shinyExists) {
        echo.generated = true;
        echo.generatedAt = echo.generatedAt || new Date().toISOString();
    }
}

// ====================== AUTO-UPDATE ======================
console.log('\n🔄 Mise à jour automatique des fichiers de données...');

// 1. Mise à jour du pixelArt JSON
fs.writeFileSync(PIXELART_JSON, JSON.stringify(data, null, 2));
console.log('✅ echoesData_pixelArt.json mis à jour');

// 2. Mise à jour du fichier de jeu principal (js/data/echoesData.js)
if (fs.existsSync(GAME_DATA_FILE)) {
    let code = fs.readFileSync(GAME_DATA_FILE, 'utf8');

    data.echoes.forEach((echo) => {
        const id = echo.id;
        const spritePath = `assets/echos/echo_${id.toString().padStart(3, '0')}.png`;
        const shinyPath = `assets/echos/echo_${id.toString().padStart(3, '0')}_shiny.png`;

        // Remplace ou ajoute les champs sprite / spriteShiny
        const spriteRegex = new RegExp(`("id":\\s*${id}[^}]*?)(sprite"\\s*:\\s*"[^"]*")?`, 'g');
        code = code.replace(spriteRegex, `$1sprite": "${spritePath}",`);

        const shinyRegex = new RegExp(`("id":\\s*${id}[^}]*?)(spriteShiny"\\s*:\\s*"[^"]*")?`, 'g');
        code = code.replace(shinyRegex, `$1spriteShiny": "${shinyPath}",`);
    });

    fs.writeFileSync(GAME_DATA_FILE, code);
    console.log('✅ js/data/echoesData.js mis à jour avec les chemins des sprites !');
} else {
    console.log('⚠️  js/data/echoesData.js non trouvé → création d’un fichier mis à jour');
    const updatedData = { ECHOES_DATA: data.echoes };
    fs.writeFileSync(
        './js/data/echoesData_updated.js',
        `export const ECHOES_DATA = ${JSON.stringify(data.echoes, null, 2)};`,
    );
}

console.log('\n🎉 TOUT EST TERMINÉ !');
console.log('📁 Images dans → assets/echos/');
console.log('🔗 Fichiers de données mis à jour automatiquement');
