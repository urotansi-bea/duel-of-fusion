// combatLogic.test.js (この内容でファイル全体を置き換えてください)

// ★★★ この require の行が非常に重要です ★★★
const { calculateDirectCombatDamage } = require('./gameLogic');

describe('calculateDirectCombatDamage 関数のテスト', () => {
    test('攻撃側が防御側を破壊し、攻撃側は生き残るケース', () => {
        const attacker = { atk: 3, currentHP: 3 };
        const defender = { atk: 1, currentHP: 2 };
        const result = calculateDirectCombatDamage(attacker, defender);
        expect(result.attackerHPAfter).toBe(2); // 3 - 1 = 2
        expect(result.defenderHPAfter).toBe(-1); // 2 - 3 = -1 (HP0以下は破壊)
    });

    test('防御側が攻撃側を破壊し、防御側は生き残るケース', () => {
        const attacker = { atk: 1, currentHP: 2 };
        const defender = { atk: 3, currentHP: 3 };
        const result = calculateDirectCombatDamage(attacker, defender);
        expect(result.attackerHPAfter).toBe(-1); // 2 - 3 = -1
        expect(result.defenderHPAfter).toBe(2); // 3 - 1 = 2
    });

    test('相打ちになるケース (両方破壊される)', () => {
        const attacker = { atk: 5, currentHP: 5 };
        const defender = { atk: 5, currentHP: 5 };
        const result = calculateDirectCombatDamage(attacker, defender);
        expect(result.attackerHPAfter).toBe(0);
        expect(result.defenderHPAfter).toBe(0);
    });

    test('両方とも生き残るケース', () => {
        const attacker = { atk: 2, currentHP: 5 };
        const defender = { atk: 1, currentHP: 4 };
        const result = calculateDirectCombatDamage(attacker, defender);
        expect(result.attackerHPAfter).toBe(4); // 5 - 1 = 4
        expect(result.defenderHPAfter).toBe(2); // 4 - 2 = 2
    });

    test('攻撃力が0の場合、ダメージを与えない', () => {
        const attacker = { atk: 0, currentHP: 5 };
        const defender = { atk: 3, currentHP: 4 };
        const result = calculateDirectCombatDamage(attacker, defender);
        expect(result.attackerHPAfter).toBe(2); // 5 - 3 = 2
        expect(result.defenderHPAfter).toBe(4); // 4 - 0 = 4
    });
});