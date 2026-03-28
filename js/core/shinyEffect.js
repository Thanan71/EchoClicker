// ============================================
// ÉchoClicker - Effet Shiny par transformation de couleur
// Remplace les sprites shiny séparés par des filtres dynamiques
// ============================================

export const ShinyEffect = {
  // Configuration des effets shiny par rareté
  SHINY_CONFIGS: {
    common: {
      hueRotate: 45,
      saturate: 1.5,
      brightness: 1.2,
      contrast: 1.1,
      sparkleColor: '#FFD700',
    },
    uncommon: {
      hueRotate: 180,
      saturate: 1.4,
      brightness: 1.3,
      contrast: 1.15,
      sparkleColor: '#00FFFF',
    },
    rare: {
      hueRotate: 280,
      saturate: 1.6,
      brightness: 1.4,
      contrast: 1.2,
      sparkleColor: '#FF00FF',
    },
    epic: {
      hueRotate: 30,
      saturate: 1.8,
      brightness: 1.5,
      contrast: 1.25,
      sparkleColor: '#FF4500',
    },
    legendary: {
      hueRotate: 120,
      saturate: 2.0,
      brightness: 1.6,
      contrast: 1.3,
      sparkleColor: '#00FF00',
    },
    mythical: {
      hueRotate: 60,
      saturate: 2.2,
      brightness: 1.7,
      contrast: 1.35,
      sparkleColor: '#FF69B4',
    },
  },

  // Appliquer l'effet shiny à un élément img
  applyShinyEffect(imgElement, rarity = 'common') {
    if (!imgElement) {
      return;
    }

    const config = this.SHINY_CONFIGS[rarity] || this.SHINY_CONFIGS.common;

    const filter = `hue-rotate(${config.hueRotate}deg) saturate(${config.saturate}) brightness(${config.brightness}) contrast(${config.contrast})`;

    imgElement.style.filter = filter;
    imgElement.classList.add('shiny-sprite');
    imgElement.dataset.shinyRarity = rarity;

    return filter;
  },

  // Créer un wrapper avec effet shiny et particules
  createShinyWrapper(imgSrc, echoData, size = 64) {
    const config = this.SHINY_CONFIGS[echoData.rarity] || this.SHINY_CONFIGS.common;

    const wrapper = document.createElement('div');
    wrapper.className = 'shiny-wrapper';
    wrapper.style.cssText = `position: relative; display: inline-block; width: ${size}px; height: ${size}px;`;

    const img = document.createElement('img');
    img.src = imgSrc;
    img.alt = echoData.name;
    img.style.cssText = `width: 100%; height: 100%; object-fit: contain; filter: hue-rotate(${config.hueRotate}deg) saturate(${config.saturate}) brightness(${config.brightness}) contrast(${config.contrast});`;
    img.classList.add('shiny-sprite');

    const sparkleContainer = document.createElement('div');
    sparkleContainer.className = 'shiny-sparkles';
    sparkleContainer.style.cssText =
      'position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; overflow: hidden;';

    for (let i = 0; i < 6; i++) {
      const sparkle = document.createElement('div');
      sparkle.className = 'sparkle';
      sparkle.style.cssText = `position: absolute; width: 4px; height: 4px; background: ${config.sparkleColor}; border-radius: 50%; animation: sparkle 1.5s ease-in-out infinite; animation-delay: ${i * 0.25}s; left: ${Math.random() * 80 + 10}%; top: ${Math.random() * 80 + 10}%; box-shadow: 0 0 6px ${config.sparkleColor};`;
      sparkleContainer.appendChild(sparkle);
    }

    wrapper.appendChild(img);
    wrapper.appendChild(sparkleContainer);

    return wrapper;
  },

  // Appliquer l'effet shiny à une image existante avec animation
  makeShiny(imgElement, rarity = 'common', animate = true) {
    if (!imgElement) {
      return;
    }

    const config = this.SHINY_CONFIGS[rarity] || this.SHINY_CONFIGS.common;

    this.applyShinyEffect(imgElement, rarity);

    if (animate) {
      imgElement.style.animation = 'shinyPulse 2s ease-in-out infinite';

      const parent = imgElement.parentElement;
      if (parent && !parent.querySelector('.shiny-sparkles')) {
        const sparkleContainer = document.createElement('div');
        sparkleContainer.className = 'shiny-sparkles';
        sparkleContainer.style.cssText =
          'position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; overflow: hidden;';

        for (let i = 0; i < 4; i++) {
          const sparkle = document.createElement('div');
          sparkle.className = 'sparkle';
          sparkle.style.cssText = `position: absolute; width: 3px; height: 3px; background: ${config.sparkleColor}; border-radius: 50%; animation: sparkle 1.5s ease-in-out infinite; animation-delay: ${i * 0.375}s; left: ${Math.random() * 60 + 20}%; top: ${Math.random() * 60 + 20}%; box-shadow: 0 0 4px ${config.sparkleColor};`;
          sparkleContainer.appendChild(sparkle);
        }

        if (getComputedStyle(parent).position === 'static') {
          parent.style.position = 'relative';
        }
        parent.appendChild(sparkleContainer);
      }
    }
  },

  // Retirer l'effet shiny
  removeShiny(imgElement) {
    if (!imgElement) {
      return;
    }

    imgElement.style.filter = '';
    imgElement.style.animation = '';
    imgElement.classList.remove('shiny-sprite');
    delete imgElement.dataset.shinyRarity;

    const parent = imgElement.parentElement;
    if (parent) {
      const sparkles = parent.querySelector('.shiny-sparkles');
      if (sparkles) {
        sparkles.remove();
      }
    }
  },

  // Vérifier si un élément a l'effet shiny
  isShiny(imgElement) {
    return imgElement?.classList.contains('shiny-sprite') || false;
  },

  // Basculer l'effet shiny
  toggleShiny(imgElement, rarity = 'common') {
    if (this.isShiny(imgElement)) {
      this.removeShiny(imgElement);
      return false;
    }
    this.makeShiny(imgElement, rarity);
    return true;
  },

  // Obtenir le filtre CSS pour une rareté donnée
  getFilterForRarity(rarity = 'common') {
    const config = this.SHINY_CONFIGS[rarity] || this.SHINY_CONFIGS.common;
    return `hue-rotate(${config.hueRotate}deg) saturate(${config.saturate}) brightness(${config.brightness}) contrast(${config.contrast})`;
  },

  // Injecter les styles CSS nécessaires
  injectStyles() {
    if (document.getElementById('shiny-effect-styles')) {
      return;
    }

    const styles = document.createElement('style');
    styles.id = 'shiny-effect-styles';
    styles.textContent = `
            @keyframes shinyPulse {
                0%, 100% { filter: brightness(1); }
                50% { filter: brightness(1.3); }
            }

            @keyframes sparkle {
                0%, 100% { opacity: 0; transform: scale(0); }
                50% { opacity: 1; transform: scale(1); }
            }

            .shiny-sprite {
                transition: filter 0.3s ease;
            }

            .shiny-wrapper {
                position: relative;
                display: inline-block;
            }

            .shiny-sparkles {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                overflow: hidden;
            }

            .sparkle {
                position: absolute;
                border-radius: 50%;
                animation: sparkle 1.5s ease-in-out infinite;
            }

            .shiny-sprite:hover {
                filter: brightness(1.4) !important;
            }

            .shiny-badge {
                position: absolute;
                top: -5px;
                right: -5px;
                font-size: 1rem;
                animation: shinyPulse 1s ease-in-out infinite;
                text-shadow: 0 0 10px gold;
            }
        `;

    document.head.appendChild(styles);
  },
};

// Initialiser les styles au chargement
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ShinyEffect.injectStyles());
  } else {
    ShinyEffect.injectStyles();
  }
}
