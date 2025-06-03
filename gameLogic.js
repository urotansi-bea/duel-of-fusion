// gameLogic.js

function drawOneCard(deck, hand) {
    if (!Array.isArray(deck) || !Array.isArray(hand)) {
        console.error("Deck or hand is not an array.");
        return { updatedDeck: deck, updatedHand: hand, drawnCard: null, deckEmpty: false }; // deckEmpty追加
    }
    if (deck.length === 0) {
        return { updatedDeck: deck, updatedHand: hand, drawnCard: null, deckEmpty: true };
    }
    const newDeck = [...deck];
    const newHand = [...hand];
    const drawnCard = newDeck.shift();
    if (drawnCard) {
        newHand.push(drawnCard);
    }
    return { updatedDeck: newDeck, updatedHand: newHand, drawnCard: drawnCard, deckEmpty: false }; // deckEmpty追加
}

/**
 * 詳細な戦闘結果を計算する（カウンター、ワイト効果、コア・マキナ覚醒を考慮）
 * @param {object} attackerInfo - { card: object, currentHP: number, powerCounters: number, isAwakened: boolean }
 * @param {object} defenderInfo - { card: object, currentHP: number, powerCounters: number, isAwakened: boolean, isSummoned?: boolean } isSummonedはDM用
 * @param {number} attackerCreatureGraveyardCount - 攻撃側の墓地のクリーチャー数 (ワイト用)
 * @param {number} defenderCreatureGraveyardCount - 防御側の墓地のクリーチャー数 (ワイト用)
 * @param {Array}  allCardData - 全カードデータ (コア・マキナの基本情報参照用)
 * @returns {object} { attackerHPAfter: number, defenderHPAfter: number, attackerDestroyed: boolean, defenderDestroyed: boolean }
 */
function resolveCombatRound(attackerInfo, defenderInfo, attackerCreatureGraveyardCount, defenderCreatureGraveyardCount, allCardData) {
    if (!attackerInfo || typeof attackerInfo.currentHP !== 'number' || !attackerInfo.card || typeof attackerInfo.card.atk !== 'number') {
        console.error("resolveCombatRound: attackerInfoが無効です。", attackerInfo);
        return { 
            attackerHPAfter: attackerInfo?.currentHP || 0, 
            defenderHPAfter: defenderInfo?.currentHP || 0, // defenderInfoがnullでないことを期待
            attackerDestroyed: true, 
            defenderDestroyed: !defenderInfo || typeof defenderInfo.currentHP !== 'number' // defenderInfoが無効なら破壊されたとみなす
        };
    }
    if (!defenderInfo || typeof defenderInfo.currentHP !== 'number' || !defenderInfo.card) {
        // defenderInfo.card.atk は type で分岐するので、ここでは card の存在のみチェック
         console.error("resolveCombatRound: defenderInfoまたはdefenderInfo.cardが無効です。", defenderInfo);
         return { 
            attackerHPAfter: attackerInfo.currentHP, 
            defenderHPAfter: 0, 
            attackerDestroyed: false, 
            defenderDestroyed: true 
        };
    }
    if (!Array.isArray(allCardData)) {
        console.error("resolveCombatRound: allCardDataが無効です。", allCardData);
        return { attackerHPAfter: 0, defenderHPAfter: 0, attackerDestroyed: true, defenderDestroyed: true};
    }

    let finalAttackerAtk = attackerInfo.card.atk; // ベースATK
    // 攻撃側のワイト効果
    if (attackerInfo.card.id === 'C_N02') {
        finalAttackerAtk = (attackerInfo.card.atk || 0) + (attackerCreatureGraveyardCount || 0);
    }
    // 攻撃側のコア・マキナ覚醒
    if (attackerInfo.card.id === 'DM_A01' && attackerInfo.isAwakened) {
        const coreMachinaBase = allCardData.find(c => c.id === 'DM_A01');
        if (coreMachinaBase?.onSummonEffect?.awakened_stats) {
            finalAttackerAtk = coreMachinaBase.onSummonEffect.awakened_stats.atk;
        }
    }
    finalAttackerAtk += (attackerInfo.powerCounters || 0);

    let finalDefenderAtk = 0; 
    // 場に出ているクリーチャーまたは召喚済みのデッキマスターのみ反撃ATKを持つ
    if (defenderInfo.card.type === 'creature' || (defenderInfo.card.type === 'deck_master' && defenderInfo.isSummoned)) {
        finalDefenderAtk = defenderInfo.card.atk || 0;
        // 防御側のワイト効果
        if (defenderInfo.card.id === 'C_N02') {
            finalDefenderAtk = (defenderInfo.card.atk || 0) + (defenderCreatureGraveyardCount || 0);
        }
        // 防御側のコア・マキナ覚醒
        if (defenderInfo.card.id === 'DM_A01' && defenderInfo.isAwakened) {
            const coreMachinaBase = allCardData.find(c => c.id === 'DM_A01');
            if (coreMachinaBase?.onSummonEffect?.awakened_stats) {
                finalDefenderAtk = coreMachinaBase.onSummonEffect.awakened_stats.atk;
            }
        }
        finalDefenderAtk += (defenderInfo.powerCounters || 0);
    }

    const defenderHPAfter = defenderInfo.currentHP - finalAttackerAtk;
    // ゾーンにいるDMは反撃しないので、attackerのHPは減らない
    const attackerHPAfter = (defenderInfo.card.type === 'creature' || (defenderInfo.card.type === 'deck_master' && defenderInfo.isSummoned === true)) 
                          ? (attackerInfo.currentHP - finalDefenderAtk) 
                          : attackerInfo.currentHP;

    return {
        attackerHPAfter: attackerHPAfter,
        defenderHPAfter: defenderHPAfter,
        attackerDestroyed: attackerHPAfter <= 0,
        defenderDestroyed: defenderHPAfter <= 0
    };
}

// calculateDirectCombatDamage は resolveCombatRound に機能が吸収されたため、
// もし他のテストで使っていなければ削除してもOKですが、今回は残しておきます。
function calculateDirectCombatDamage(attacker, defender) {
    if (typeof attacker?.atk !== 'number' || typeof attacker?.currentHP !== 'number' ||
        typeof defender?.atk !== 'number' || typeof defender?.currentHP !== 'number') {
        console.error("calculateDirectCombatDamage: 無効な引数です。", attacker, defender);
        return { 
            attackerHPAfter: attacker?.currentHP !== undefined ? attacker.currentHP : 0, 
            defenderHPAfter: defender?.currentHP !== undefined ? defender.currentHP : 0
        };
    }
    const defenderHPAfter = defender.currentHP - attacker.atk;
    const attackerHPAfter = attacker.currentHP - defender.atk;
    return { attackerHPAfter, defenderHPAfter };
}

module.exports = {
    drawOneCard,
    calculateDirectCombatDamage, // 念のため残す
    resolveCombatRound
};
