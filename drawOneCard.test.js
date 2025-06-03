// drawOneCard.test.js
// drawOneCard.test.js の一番最初の行
const { drawOneCard } = require('./gameLogic'); // ← この行が正しいか確認！
describe('drawOneCard 関数のテスト', () => {
    let mockDeck;
    let mockHand;

    beforeEach(() => {
        // 各テストの前にモックデータを初期化
        mockDeck = [
            { id: 'C001', name: '森の番人' }, 
            { id: 'C002', name: '炎の獣' }, 
            { id: 'S001', name: '火球' }
        ];
        mockHand = [];
    });

    test('山札からカードを1枚引き、手札に加えるべき', () => {
        const initialDeckSize = mockDeck.length;
        const initialHandSize = mockHand.length;
        const firstCardInDeck = mockDeck[0];

        const result = drawOneCard(mockDeck, mockHand);

        expect(result.updatedDeck.length).toBe(initialDeckSize - 1);
        expect(result.updatedHand.length).toBe(initialHandSize + 1);
        expect(result.drawnCard).toEqual(firstCardInDeck);
        expect(result.updatedHand).toContainEqual(firstCardInDeck);
        expect(result.updatedDeck).not.toContainEqual(firstCardInDeck);
    });

    test('山札が空の場合、何も起こらずdeckEmptyフラグが立つべき', () => {
        const emptyDeck = [];
        const result = drawOneCard(emptyDeck, mockHand);

        expect(result.updatedDeck.length).toBe(0);
        expect(result.updatedHand.length).toBe(0);
        expect(result.drawnCard).toBeNull();
        expect(result.deckEmpty).toBe(true);
    });

    test('元の山札と手札は変更されないべき (純粋関数の確認)', () => {
        const originalDeckState = [...mockDeck]; // 元の状態をディープコピー
        const originalHandState = [...mockHand];

        drawOneCard(mockDeck, mockHand); // この関数の返り値は使わない

        expect(mockDeck).toEqual(originalDeckState); // 元の配列が変更されていないことを確認
        expect(mockHand).toEqual(originalHandState);
    });
});