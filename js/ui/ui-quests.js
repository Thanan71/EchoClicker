// ============================================
// UIQuests - Rendu quetes
// ============================================

import { questSystem } from '../systems/quests.js';

const REWARD_ICONS = {
  xp: '\u{1F4C8}',
  crystals: '\u{1F48E}',
  energy: '\u26A1',
  item: '\u{1F381}',
};

const REWARD_I18N_KEYS = {
  xp: 'quests.rewardXp',
  crystals: 'quests.rewardCrystals',
  energy: 'quests.rewardEnergy',
};

function renderReward(reward) {
  const icon = REWARD_ICONS[reward.type] || '';
  if (reward.type === 'item') {
    return `<span class="quest-reward">${icon} ${reward.item.name}</span>`;
  }
  const i18nKey = REWARD_I18N_KEYS[reward.type];
  if (i18nKey) {
    return `<span class="quest-reward">${icon} ${i18n.t(i18nKey, { amount: reward.amount })}</span>`;
  }
  return '';
}

function renderRewards(rewards) {
  return rewards.map(renderReward).join('');
}

function renderProgress(quest) {
  const progress = Math.min(quest.current, quest.target);
  const percent = (progress / quest.target) * 100;
  return `
    <div class="quest-progress">
      <div class="quest-progress-bar">
        <div class="quest-progress-fill" style="width: ${percent}%"></div>
      </div>
      <div class="quest-progress-text">${progress} / ${quest.target}</div>
    </div>`;
}

function renderClaimButton(questId) {
  return `<button class="quest-claim-btn" data-quest-id="${questId}">\u{1F381} ${i18n.t('quests.claim')}</button>`;
}

function renderQuestCard(quest, icon, showClaim = true) {
  const isCompleted = quest.completed;
  return `
    <div class="quest-card ${isCompleted ? 'completed' : ''}" data-quest-id="${quest.id}">
      <div class="quest-header">
        <div class="quest-icon">${icon}</div>
        <div class="quest-info">
          <div class="quest-name">${quest.name}</div>
          <div class="quest-description">${quest.description}</div>
        </div>
        ${showClaim && isCompleted ? renderClaimButton(quest.id) : ''}
      </div>
      ${renderProgress(quest)}
      <div class="quest-rewards">${renderRewards(quest.rewards)}</div>
    </div>`;
}

function renderQuestList(quests, container, emptyMessage, icon, showClaim = true) {
  if (quests.length === 0) {
    container.innerHTML = `<div class="quest-empty">${emptyMessage}</div>`;
    return;
  }
  let html = '';
  for (const quest of quests) {
    html += renderQuestCard(quest, icon, showClaim);
  }
  container.innerHTML = html;
}

export const UIQuests = {
  renderQuests() {
    const dailyContainer = document.getElementById('daily-quests');
    const storyContainer = document.getElementById('story-quests');
    const completedContainer = document.getElementById('completed-quests');

    if (!dailyContainer || !storyContainer || !completedContainer) {
      return;
    }

    const { daily, story } = questSystem.getActiveQuests();
    const completedUnclaimed = questSystem.getCompletedUnclaimedQuests();

    renderQuestList(daily, dailyContainer, i18n.t('quests.dailyEmpty'), '\u{1F4CB}');
    renderQuestList(story, storyContainer, i18n.t('quests.storyEmpty'), '\u{1F4D6}');
    renderQuestList(
      completedUnclaimed,
      completedContainer,
      i18n.t('quests.noRewards'),
      '\u2705',
      true,
    );

    for (const btn of document.querySelectorAll('.quest-claim-btn')) {
      btn.addEventListener('click', (e) => {
        const questId = e.target.dataset.questId;
        questSystem.claimQuestRewards(questId);
      });
    }
  },
};
