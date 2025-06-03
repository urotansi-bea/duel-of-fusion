// shuffleArray.test.js
const { shuffleArray } = require('./utils'); // utils.js から shuffleArray 関数をインポート

describe('shuffleArray 関数のテスト', () => {
    test('配列の要素数を変えずにシャッフルするべき', () => {
        const originalArray = [1, 2, 3, 4, 5];
        const originalLength = originalArray.length;

        shuffleArray(originalArray); // 配列は直接変更される

        expect(originalArray.length).toBe(originalLength);
    });

    test('シャッフル後も元の要素を全て含んでいるべき', () => {
        const originalItems = [1, 'a', true, null, {name: 'test'}];
        const arrayToShuffle = [...originalItems]; // 配列のコピーを作成してシャッフル

        shuffleArray(arrayToShuffle);

        // シャッフル後の配列が元の各要素を含んでいるか確認
        originalItems.forEach(item => {
            expect(arrayToShuffle).toContain(item);
        });

        // さらに、要素が重複したり失われたりしていないことを確認（ソートして比較）
        // オブジェクトを含む場合はこの比較は複雑になるので、プリミティブ値の場合に有効
        const primitiveItems = [1, 2, 3, 4, 5];
        const primitiveArrayToShuffle = [...primitiveItems];
        shuffleArray(primitiveArrayToShuffle);
        expect(primitiveArrayToShuffle.sort()).toEqual(primitiveItems.sort());
    });

    test('空の配列をシャッフルしても空のままであるべき', () => {
        const emptyArray = [];
        shuffleArray(emptyArray);
        expect(emptyArray.length).toBe(0);
        expect(emptyArray).toEqual([]); // 内容も空であることを確認
    });

    test('要素が1つの配列をシャッフルしても変わらないべき', () => {
        const singleElementArray = [42];
        shuffleArray(singleElementArray);
        expect(singleElementArray).toEqual([42]);
    });
});