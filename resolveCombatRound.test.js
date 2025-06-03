// resolveCombatRound.test.js
const { resolveCombatRound } = require('./gameLogic');

// テストで使用する可能性のあるカードデータを一部モックとして定義
const mockCardData = [
    { id: "C001", type: "creature", name: "森の番人", atk: 2, hp: 3 },
    { id: "C_N02", type: "creature", subtype: "ネクロマンサー", name: "魂集めのワイト", atk: 1, hp: 4 },
    { 
        id: "DM_A01", type: "deck_master", subtype: "オートマタ", name: "機構長 コア・マキナ", 
        atk: 0, hp: 6, 
        onSummonEffect: { awaken_condition: { count: 3 }, awakened_stats: { atk: 7, hp: 6 } }
    },
];

describe('resolveCombatRound 関数のテスト', () => {
    test('基本戦闘：攻撃側が防御側を破壊、攻撃側生存', () => {
        const attacker = { card: mockCardData[0], currentHP: 3, powerCounters: 0, isAwakened: false }; // 森の番人 2/3
        const defender = { card: { type: 'creature', atk: 1, hp: 1 }, currentHP: 1, powerCounters: 0, isAwakened: false }; // 仮想敵 1/1
        const result = resolveCombatRound(attacker, defender, 0, 0, mockCardData);
        expect(result.attackerHPAfter).toBe(2);
        expect(result.defenderHPAfter).toBe(-1);
        expect(result.attackerDestroyed).toBe(false);
        expect(result.defenderDestroyed).toBe(true);
    });

    test('カウンター持ちクリーチャーの戦闘', () => {
        const attacker = { card: mockCardData[0], currentHP: 3, powerCounters: 2, isAwakened: false }; // 森の番人 ATK2+2=4
        const defender = { card: { type: 'creature', atk: 3, hp: 5 }, currentHP: 5, powerCounters: 0, isAwakened: false }; // 仮想敵 3/5
        const result = resolveCombatRound(attacker, defender, 0, 0, mockCardData);
        expect(result.attackerHPAfter).toBe(0); 
        expect(result.defenderHPAfter).toBe(1); 
        expect(result.attackerDestroyed).toBe(true);
        expect(result.defenderDestroyed).toBe(false);
    });

    test('魂集めのワイト（攻撃側）の戦闘', () => {
        const attacker = { card: mockCardData[1], currentHP: 4, powerCounters: 0, isAwakened: false }; // ワイト ベースATK1
        const defender = { card: { type: 'creature', atk: 2, hp: 6 }, currentHP: 6, powerCounters: 0, isAwakened: false }; // 仮想敵 2/6
        const attackerGraveyard = 5; // 墓地にクリーチャー5体
        const result = resolveCombatRound(attacker, defender, attackerGraveyard, 0, mockCardData);
        // ワイトATK = 1 (ベース) + 5 (墓地) = 6
        expect(result.attackerHPAfter).toBe(2); 
        expect(result.defenderHPAfter).toBe(0); 
        expect(result.attackerDestroyed).toBe(false);
        expect(result.defenderDestroyed).toBe(true);
    });

    test('覚醒コア・マキナ（攻撃側）の戦闘', () => {
        const attacker = { card: mockCardData[2], currentHP: 6, powerCounters: 0, isAwakened: true }; // コア・マキナ覚醒ATK7
        const defender = { card: { type: 'creature', atk: 5, hp: 7 }, currentHP: 7, powerCounters: 0, isAwakened: false }; // 仮想敵 5/7
        const result = resolveCombatRound(attacker, defender, 0, 0, mockCardData);
        expect(result.attackerHPAfter).toBe(1); 
        expect(result.defenderHPAfter).toBe(0); 
        expect(result.attackerDestroyed).toBe(false);
        expect(result.defenderDestroyed).toBe(true);
    });

    test('防御側がゾーンにいるデッキマスターの場合（反撃なし）', () => {
        const attacker = { card: mockCardData[0], currentHP: 3, powerCounters: 0, isAwakened: false }; // 森の番人 2/3
        // isSummoned: false を defenderInfo に追加
        const defender = { card: { type: 'deck_master', atk: 0, hp: 5 }, currentHP: 5, powerCounters: 0, isAwakened: false, isSummoned: false }; 
        const result = resolveCombatRound(attacker, defender, 0, 0, mockCardData);
        expect(result.attackerHPAfter).toBe(3); 
        expect(result.defenderHPAfter).toBe(3); 
        expect(result.attackerDestroyed).toBe(false);
        expect(result.defenderDestroyed).toBe(false);
    });
});