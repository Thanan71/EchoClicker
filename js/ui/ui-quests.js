// ============================================
// UIQuests - Rendu quetes
// ============================================

const UIQuests = {
    renderQuests() {
        const dailyContainer = document.getElementById('daily-quests');
        const storyContainer = document.getElementById('story-quests');
        const completedContainer = document.getElementById('completed-quests');
        
        if (!dailyContainer || !storyContainer || !completedContainer) return;

        const { daily, story } = questSystem.getActiveQuests();
        const completedUnclaimed = questSystem.getCompletedUnclaimedQuests();

        let dailyHtml = '';
        if (daily.length === 0) {
            dailyHtml = '<div class="quest-empty">Aucune quete quotidienne disponible</div>';
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
                        ${isCompleted ? '<button class="quest-claim-btn" onclick="UI.claimQuestReward(\'' + quest.id + '\')">\u{1F381} Reclamer</button>' : ''}
                    </div>
                    <div class="quest-progress">
                        <div class="quest-progress-bar">
                            <div class="quest-progress-fill" style="width: ${percent}%"></div>
                        </div>
                        <div class="quest-progress-text">${progress} / ${quest.target}</div>
                    </div>
                    <div class="quest-rewards">
                        ${quest.rewards.map(r => {
                            if (r.type === 'xp') return `<span class="quest-reward">\u{1F4C8} ${r.amount} XP</span>`;
                            if (r.type === 'crystals') return `<span class="quest-reward">\u{1F48E} ${r.amount} cristaux</span>`;
                            if (r.type === 'energy') return `<span class="quest-reward">\u26A1 ${r.amount} energie</span>`;
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
            storyHtml = '<div class="quest-empty">Aucune quete d\'histoire disponible</div>';
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
                        ${isCompleted ? '<button class="quest-claim-btn" onclick="UI.claimQuestReward(\'' + quest.id + '\')">\u{1F381} Reclamer</button>' : ''}
                    </div>
                    <div class="quest-progress">
                        <div class="quest-progress-bar">
                            <div class="quest-progress-fill" style="width: ${percent}%"></div>
                        </div>
                        <div class="quest-progress-text">${progress} / ${quest.target}</div>
                    </div>
                    <div class="quest-rewards">
                        ${quest.rewards.map(r => {
                            if (r.type === 'xp') return `<span class="quest-reward">\u{1F4C8} ${r.amount} XP</span>`;
                            if (r.type === 'crystals') return `<span class="quest-reward">\u{1F48E} ${r.amount} cristaux</span>`;
                            if (r.type === 'energy') return `<span class="quest-reward">\u26A1 ${r.amount} energie</span>`;
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
            completedHtml = '<div class="quest-empty">Aucune recompense a reclamer</div>';
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
                        <button class="quest-claim-btn" onclick="UI.claimQuestReward('${quest.id}')">\u{1F381} Reclamer</button>
                    </div>
                    <div class="quest-rewards">
                        ${quest.rewards.map(r => {
                            if (r.type === 'xp') return `<span class="quest-reward">\u{1F4C8} ${r.amount} XP</span>`;
                            if (r.type === 'crystals') return `<span class="quest-reward">\u{1F48E} ${r.amount} cristaux</span>`;
                            if (r.type === 'energy') return `<span class="quest-reward">\u26A1 ${r.amount} energie</span>`;
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
            this.toast('\u{1F381} Recompenses reclamees !', 'success');
            this.renderQuests();
            this.updateCurrencies();
        } else {
            this.toast('\u274C Impossible de reclamer les recompenses', 'error');
        }
    },
};
