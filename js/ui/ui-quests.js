// ============================================
// UIQuests - Rendu quetes
// ============================================

import { questSystem } from '../systems/quests.js';

export const UIQuests = {
    renderQuests() {
        const dailyContainer = document.getElementById('daily-quests');
        const storyContainer = document.getElementById('story-quests');
        const completedContainer = document.getElementById('completed-quests');
        
        if (!dailyContainer || !storyContainer || !completedContainer) return;

        const { daily, story } = questSystem.getActiveQuests();
        const completedUnclaimed = questSystem.getCompletedUnclaimedQuests();

        let dailyHtml = '';
        if (daily.length === 0) {
            dailyHtml = `<div class="quest-empty">${i18n.t('quests.dailyEmpty')}</div>`;
        } else {
            daily.forEach(quest => {
                const progress = Math.min(quest.current, quest.target);
                const percent = (progress / quest.target) * 100;
                const isCompleted = quest.completed;
                dailyHtml += `
                <div class="quest-card ${isCompleted ? 'completed' : ''}">
                    <div class="quest-header">
                        <div class="quest-icon">\u{1F4CB}</div>
                        <div class="quest-info">
                            <div class="quest-name">${quest.name}</div>
                            <div class="quest-description">${quest.description}</div>
                        </div>
                        ${isCompleted ? `<button class="quest-claim-btn" onclick="UI.claimQuestReward('${quest.id}')">\u{1F381} ${i18n.t('quests.claim')}</button>` : ''}
                    </div>
                    <div class="quest-progress">
                        <div class="quest-progress-bar">
                            <div class="quest-progress-fill" style="width: ${percent}%"></div>
                        </div>
                        <div class="quest-progress-text">${progress} / ${quest.target}</div>
                    </div>
                    <div class="quest-rewards">
                        ${quest.rewards.map(r => {
                            if (r.type === 'xp') return `<span class="quest-reward">\u{1F4C8} ${i18n.t('quests.rewardXp', { amount: r.amount })}</span>`;
                            if (r.type === 'crystals') return `<span class="quest-reward">\u{1F48E} ${i18n.t('quests.rewardCrystals', { amount: r.amount })}</span>`;
                            if (r.type === 'energy') return `<span class="quest-reward">\u26A1 ${i18n.t('quests.rewardEnergy', { amount: r.amount })}</span>`;
                            if (r.type === 'item') return `<span class="quest-reward">\u{1F381} ${r.item.name}</span>`;
                            return '';
                        }).join('')}
                    </div>
                </div>`;
            });
        }
        dailyContainer.innerHTML = dailyHtml;

        let storyHtml = '';
        if (story.length === 0) {
            storyHtml = `<div class="quest-empty">${i18n.t('quests.storyEmpty')}</div>`;
        } else {
            story.forEach(quest => {
                const progress = Math.min(quest.current, quest.target);
                const percent = (progress / quest.target) * 100;
                const isCompleted = quest.completed;
                storyHtml += `
                <div class="quest-card ${isCompleted ? 'completed' : ''}">
                    <div class="quest-header">
                        <div class="quest-icon">\u{1F4D6}</div>
                        <div class="quest-info">
                            <div class="quest-name">${quest.name}</div>
                            <div class="quest-description">${quest.description}</div>
                        </div>
                        ${isCompleted ? `<button class="quest-claim-btn" onclick="UI.claimQuestReward('${quest.id}')">\u{1F381} ${i18n.t('quests.claim')}</button>` : ''}
                    </div>
                    <div class="quest-progress">
                        <div class="quest-progress-bar">
                            <div class="quest-progress-fill" style="width: ${percent}%"></div>
                        </div>
                        <div class="quest-progress-text">${progress} / ${quest.target}</div>
                    </div>
                    <div class="quest-rewards">
                        ${quest.rewards.map(r => {
                            if (r.type === 'xp') return `<span class="quest-reward">\u{1F4C8} ${i18n.t('quests.rewardXp', { amount: r.amount })}</span>`;
                            if (r.type === 'crystals') return `<span class="quest-reward">\u{1F48E} ${i18n.t('quests.rewardCrystals', { amount: r.amount })}</span>`;
                            if (r.type === 'energy') return `<span class="quest-reward">\u26A1 ${i18n.t('quests.rewardEnergy', { amount: r.amount })}</span>`;
                            if (r.type === 'item') return `<span class="quest-reward">\u{1F381} ${r.item.name}</span>`;
                            return '';
                        }).join('')}
                    </div>
                </div>`;
            });
        }
        storyContainer.innerHTML = storyHtml;

        let completedHtml = '';
        if (completedUnclaimed.length === 0) {
            completedHtml = `<div class="quest-empty">${i18n.t('quests.noRewards')}</div>`;
        } else {
            completedUnclaimed.forEach(quest => {
                completedHtml += `
                <div class="quest-card completed">
                    <div class="quest-header">
                        <div class="quest-icon">\u2705</div>
                        <div class="quest-info">
                            <div class="quest-name">${quest.name}</div>
                            <div class="quest-description">${quest.description}</div>
                        </div>
                        <button class="quest-claim-btn" onclick="UI.claimQuestReward('${quest.id}')">\u{1F381} ${i18n.t('quests.claim')}</button>
                    </div>
                    <div class="quest-rewards">
                        ${quest.rewards.map(r => {
                            if (r.type === 'xp') return `<span class="quest-reward">\u{1F4C8} ${i18n.t('quests.rewardXp', { amount: r.amount })}</span>`;
                            if (r.type === 'crystals') return `<span class="quest-reward">\u{1F48E} ${i18n.t('quests.rewardCrystals', { amount: r.amount })}</span>`;
                            if (r.type === 'energy') return `<span class="quest-reward">\u26A1 ${i18n.t('quests.rewardEnergy', { amount: r.amount })}</span>`;
                            if (r.type === 'item') return `<span class="quest-reward">\u{1F381} ${r.item.name}</span>`;
                            return '';
                        }).join('')}
                    </div>
                </div>`;
            });
        }
        completedContainer.innerHTML = completedHtml;
    },

    claimQuestReward(questId) {
        const success = questSystem.claimQuestRewards(questId);
        if (success) {
            UI.toast(`\u{1F381} ${i18n.t('quests.claimedRewards')}`, 'success');
            this.renderQuests();
            UI.updateCurrencies();
        } else {
            UI.toast(`\u274C ${i18n.t('quests.cannotClaim')}`, 'error');
        }
    },
};
