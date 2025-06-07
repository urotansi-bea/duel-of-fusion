// apprenticeChanter.test.js
const { applyApprenticeChanterGrowth } = require('./gameLogic');

// テストで使用するカードデータをモックとして定義
const mockApprenticeCard = { id: "C_E01", type: "creature", subtype: "エレメンタリスト", name: "見習い詠唱者", atk: 1, hp: 2 };
const mockOtherCreatureCard = { id: "C001", type: "creature", name: "森の番人", atk: 2, hp: 3 };

describe('applyApprenticeChanterGrowth 関数のテスト', () => {
    test('見習い詠唱者のpowerCountersが1増加するべき', () => {
        const apprenticeOnField = {
            card: mockApprenticeCard,
            currentHP: 2,
            powerCounters: 0,
            hasAttacked: false
        };
        const result = applyApprenticeChanterGrowth(apprenticeOnField);
        expect(result.powerCounters).toBe(1);
    });

    test('見習い詠唱者でないクリーチャーのpowerCountersは変化しないべき', () => {
        const otherCreatureOnField = {
            card: mockOtherCreatureCard,
            currentHP: 3,
            powerCounters: 0,
            hasAttacked: false
        };
        const result = applyApprenticeChanterGrowth(otherCreatureOnField);
        expect(result.powerCounters).toBe(0);
        expect(result).toEqual(otherCreatureOnField);
    });

    test('既にカウンターがある見習い詠唱者のpowerCountersがさらに増加するべき', () => {
        const apprenticeOnField = {
            card: mockApprenticeCard,
            currentHP: 2,
            powerCounters: 3,
            hasAttacked: false
        };
        const result = applyApprenticeChanterGrowth(apprenticeOnField);
        expect(result.powerCounters).toBe(4);
    });

    test('クリーチャーオブジェクトが無効な場合はエラーを出さずに元の値を返す（または適切な処理をする）', () => {
        const invalidObject = null;
        const result = applyApprenticeChanterGrowth(invalidObject);
        expect(result).toBeNull();
        
        const objectWithoutCard = { currentHP:1, powerCounters:0};
        const result2 = applyApprenticeChanterGrowth(objectWithoutCard);
        expect(result2).toEqual(objectWithoutCard);

        const objectWithoutCounters = { card: mockApprenticeCard, currentHP:1 };
        const result3 = applyApprenticeChanterGrowth(objectWithoutCounters);
        expect(result3.powerCounters).toBeUndefined(); 
        expect(result3.card.id).toBe("C_E01"); 
    });
});