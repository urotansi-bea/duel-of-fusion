// script.js (完全版 - UIレイアウト・AIロジック最終安定版)

// =================================================================
// グローバル定義セクション
// =================================================================

const cardData = [
    // オリジナルカード
    { id: "C001", type: "creature", name: "森の番人", manaCost: 2, atk: 2, hp: 3, abilities: [] },
    { id: "C002", type: "creature", name: "炎の獣", manaCost: 3, atk: 3, hp: 2, abilities: [] },
    { id: "C003", type: "creature", name: "鋼の守護者", manaCost: 4, atk: 2, hp: 5, abilities: ["ブロック"] },
    { id: "C004", type: "creature", name: "風の妖精", manaCost: 1, atk: 1, hp: 1, abilities: [] },
    { id: "C005", type: "creature", name: "大地の巨人", manaCost: 5, atk: 4, hp: 4, abilities: [] },
    { id: "C008", type: "creature", name: "超伝導ロボ", manaCost: 7, atk: 3, hp: 15, abilities: [] },
    { id: "C006", type: "creature", name: "俊足の斥候", manaCost: 1, atk: 1, hp: 1, abilities: [] },
    { id: "C007", type: "creature", name: "岩窟のトロール", manaCost: 4, atk: 3, hp: 5, abilities: ["再生"] },
    { id: "C009", type: "creature", name: "飛行布団", manaCost: 2, atk: 1, hp: 4, abilities: [] },
    { id: "C010", type: "creature", name: "アルミ缶みかん", manaCost: 3, atk: 2, hp: 5, abilities: [] },
    { id: "C011", type: "creature", name: "絶校長", manaCost: 4, atk: 3, hp: 4, abilities: [] },
    {
        id: "S001", type: "spell", name: "火球", manaCost: 3, effectText: "相手のクリーチャー1体に3ダメージを与える",
        effect: { type: "damage", targetCategory: "creature", targetOwner: "opponent", targetSelector: "single", value: 3, requiresTarget: true }
    },
    {
        id: "S002", type: "spell", name: "癒しの光", manaCost: 2, effectText: "自分のクリーチャー1体のHPを2回復する",
        effect: { type: "heal", targetCategory: "creature", targetOwner: "self", targetSelector: "single", value: 2, requiresTarget: true }
    },
    {
        id: "S003", type: "spell", name: "手札補充", manaCost: 1, effectText: "カードを2枚引く",
        effect: { type: "draw", targetOwner: "self", value: 2, requiresTarget: false }
    },
    {
        id: "S004", type: "spell", name: "魔力吸収", manaCost: 2, effectText: "自分のマナを2回復する",
        effect: { type: "gain_mana", targetOwner: "self", value: 2, requiresTarget: false }
    },
    {
        id: "S005", type: "spell", name: "不通電話", manaCost: 2, effectText: "自分の場のクリーチャーを1体選び，手札に戻す。",
        effect: { type: "return_creature_to_hand", targetCategory: "creature", targetOwner: "self", targetSelector: "single", requiresTarget: true }
    },
    {
        id: "S006", type: "spell", name: "聖水", manaCost: 3, effectText: "自分のデッキマスター1体の体力を3回復する。",
        effect: { type: "heal_deck_master_in_zone", targetCategory: "deck_master_in_zone", targetOwner: "self", targetSelector: "single", value: 3, requiresTarget: true }
    },
    { id: "M001", type: "magic_square", name: "召喚の魔方陣", effectText: "特定のデッキマスターをマナコストを支払うことなく召喚できる" },

    // Deck Masters
    { id: "DM001", type: "deck_master", name: "炎のドラゴン", manaCost: 6, atk: 5, hp: 5, abilities: ["特殊召喚可"], canSpecialSummon: true },
    { id: "DM002", type: "deck_master", name: "水の賢者", manaCost: 4, atk: 2, hp: 4, abilities: [], canSpecialSummon: false },
    { id: "DM003", type: "deck_master", name: "森の守護神", manaCost: 5, atk: 3, hp: 6, abilities: ["ブロック"], canSpecialSummon: true },
    { id: "DM004", type: "deck_master", name: "影の暗殺者", manaCost: 5, atk: 4, hp: 4, abilities: ["隠密", "特殊召喚可"], canSpecialSummon: true },
    {
        id: "DM007", type: "deck_master", name: "大賢者アルキメデス",
        manaCost: 5, atk: 2, hp: 5, abilities: [], canSpecialSummon: false,
        onSummonEffect: { type: "draw", targetOwner: "self", value: 2, requiresTarget: false },
        onSummonEffectText: "[召喚時] カードを2枚引く。"
    },

    // スチームパンク・オートマタ
    {
        id: "DM_A01", type: "deck_master", subtype: "オートマタ", name: "機構長 コア・マキナ",
        manaCost: 4, atk: 0, hp: 6, abilities: [], canSpecialSummon: false,
        onSummonEffect: { type: "awakenable_commander", awaken_condition: { type: "field_count", subtype: "オートマタ", count: 3 }, awakened_stats: { atk: 7, hp: 6 } },
        onSummonEffectText: "[司令官モード] このクリーチャーは攻撃できない。あなたの場の他オートマタ全ての攻守を+1/+1する。\n[覚醒条件] 他のオートマタが3体以上いる場合、戦闘モード(ATK7)になり攻撃できる。"
    },
    {
        id: "C_A01", type: "creature", subtype: "オートマタ", name: "偵察機スチーム・ドローン",
        manaCost: 1, atk: 1, hp: 1, abilities: [],
        onSummonEffect: { type: "scry", value: 1 },
        onSummonEffectText: "[召喚時] 山札の一番上のカードを見る。それを山札の下に置いてもよい。"
    },
    {
        id: "C_A02", type: "creature", subtype: "オートマタ", name: "量産型ギア・ソルジャー",
        manaCost: 2, atk: 2, hp: 1, abilities: [],
        onSummonEffect: { type: "tutor_automata", condition: { cost: 2, count: 3 } },
        onSummonEffectText: "[召喚時] 山札の上から3枚見て、コスト2以下のオートマタ1枚を手札に加える。"
    },
    {
        id: "C_A03", type: "creature", subtype: "オートマタ", name: "組立工兵オート・クラフター",
        manaCost: 3, atk: 2, hp: 3, abilities: [],
        onSummonEffect: { type: "summon_token", token_id: "T_A01" },
        onSummonEffectText: "[召喚時] 1/1の「スクラップ・ゴーレム」トークンを1体召喚する。"
    },
    {
        id: "S_A01", type: "spell", subtype: "オートマタ", name: "オーバークロック命令",
        manaCost: 3, effectText: "あなたの場の全オートマタのATKを+2し、カードを1枚引く。",
        effect: { type: "overclock_automata" }
    },
    {
        id: "S_A02", type: "spell", subtype: "オートマタ", name: "再起動シークエンス",
        effectText: "あなたの墓地からコスト3以下のオートマタ1体を場に戻す。",
        manaCost: 4,
        effect: { type: "reboot_automata", condition: { cost: 3 }, requiresTarget: true }
    },
    {
        id: "T_A01", type: "creature", subtype: "オートマタ", name: "スクラップ・ゴーレム", // Token
        manaCost: 1, atk: 1, hp: 1, abilities: []
    },

    // 天空の詠唱者
    {
        id: "DM_E01", type: "deck_master", subtype: "エレメンタリスト", name: "大魔導師ソラリス",
        manaCost: 6, atk: 1, hp: 6, abilities: [], canSpecialSummon: false,
        effectText: "[常時] あなたがスペルをプレイするたび(1)マナ払ってよい。そうした場合クリーチャー1体に1ダメージ。\n[起動] 1ターンに1度(2)マナ：墓地からスペル1枚を手札に戻す。"
    },
    {
        id: "C_E01", type: "creature", subtype: "エレメンタリスト", name: "見習い詠唱者",
        manaCost: 2, atk: 1, hp: 2, abilities: [],
        effectText: "[常時] あなたがスペルをプレイするたび、このクリーチャーに+1/+1カウンターを1個置く。"
    },
    {
        id: "S_E01", type: "spell", subtype: "エレメンタリスト", name: "魔力循環",
        manaCost: 1,
        effectText: "カードを1枚引く。このターン、あなたが次にプレイするスペルのコストは(1)少なくなる。"
    },
    {
        id: "S_E02", type: "spell", subtype: "エレメンタリスト", name: "アーク・ボルト",
        manaCost: 3,
        effectText: "相手のクリーチャー1体に2ダメージを与える。\n[連鎖] このターン先に他のスペルをプレイしていたなら、代わりに4ダメージを与える。"
    },
    {
        id: "S_E03", type: "spell", subtype: "エレメンタリスト", name: "叡智の奔流",
        manaCost: 4,
        effectText: "カードを2枚引く。\n[連鎖] このターン先に他のスペルをプレイしていたなら、代わりにカードを3枚引く。"
    },
    // ネクロマンサー
    {
        id: "DM_N01", type: "deck_master", subtype: "ネクロマンサー", name: "大巫女 リッチェ",
        manaCost: 5, atk: 2, hp: 5, abilities: [], canSpecialSummon: false,
        onSummonEffectText: "[召喚時] あなたの山札の上から3枚を墓地に置く。その後、あなたの墓地から「ネクロマンサー」カード1枚を手札に加える。",
        onSummonEffect: { type: "mill_and_tutor", mill_value: 3, tutor_subtype: "ネクロマンサー" },
        activatedAbilityText: "[起動] 1ターンに1度、(2)マナを支払い、クリーチャー1体を生贄に捧げる：あなたの墓地からコスト3以下のクリーチャー1枚を場に召喚する。",
        activatedAbility: { type: "sacrifice_and_reanimate", cost: 2, condition: { type: "creature", cost: 3 } }
    },
    {
        id: "C_N01", type: "creature", subtype: "ネクロマンサー", name: "彷徨える魂",
        manaCost: 2, atk: 1, hp: 1, abilities: [],
        onDeathEffectText: "[破壊時] あなたの山札の上から2枚を墓地に置く。",
        onDeathEffect: { type: "mill", value: 2 }
    },
    {
        id: "C_N02", type: "creature", subtype: "ネクロマンサー", name: "魂集めのワイト",
        manaCost: 4, atk: 1, hp: 4, abilities: [],
        effectText: "[常時] このクリーチャーは、あなたの墓地にあるクリーチャー・カード1枚につきATK+1を得る。",
    },
    {
        id: "C_N03", type: "creature", subtype: "ネクロマンサー", name: "血の儀式の司祭",
        manaCost: 3, atk: 2, hp: 2, abilities: [],
        activatedAbilityText: "[起動] このクリーチャーを行動済み状態にし、あなたがコントロールする他の「ネクロマンサー」またはクリーチャー1体を生贄に捧げる：カードを1枚引き、あなたのデッキマスターのHPを1回復する。（この能力は、このクリーチャーが行動済みでない場合に1ターンに1度だけ使用できる）",
        activatedAbility: { type: "sacrifice_draw_heal", target: "other_creature", draw_value: 1, heal_value: 1 }
    },
    {
        id: "S_N01", type: "spell", subtype: "ネクロマンサー", name: "禁断の蘇生術",
        manaCost: 3, effectText: "あなたの墓地からコスト3以下の「ネクロマンサー」またはクリーチャー・カード1枚を選び、あなたの場に召喚する。",
        effect: { type: "reanimate", targetCategory: "creature", targetOwner: "self", targetSelector: "graveyard", condition: { cost: 3 }, requiresTarget: true }
    }
];

// --- ゲーム状態管理オブジェクト ---
const gameState = {
    turn: 1, currentPhase: 'draw', currentPlayer: 'self', selectedAttacker: null, awaitingSpellTarget: null,
    self: {
        currentMana: 0, maxMana: 1, deckMasters: [], hand: [], field: new Array(5).fill(null),
        destroyedDeckMastersCount: 0, spellsCastThisTurn: 0, solarisAbilityUsedThisTurn: false,
        nextSpellCostReduction: 0, licheAbilityUsedThisTurn: false
    },
    opponent: {
        currentMana: 0, maxMana: 1, deckMasters: [], hand: [], field: new Array(5).fill(null),
        destroyedDeckMastersCount: 0, spellsCastThisTurn: 0, solarisAbilityUsedThisTurn: false,
        nextSpellCostReduction: 0, licheAbilityUsedThisTurn: false
    },
    mainDeck: [], 
    graveyard: [], // 墓地はここで一元管理
    pendingSolarisEffect: null
};

// --- ルールテキスト定義 ---
const gameRulesText = `
デュエル・オブ・フュージョン ルール詳細案（最終調整版）

1. ゲームの目的
    相手の「デッキマスター」を5枚すべて破壊すること。

2. デッキの準備
    各プレイヤーは30枚のカードで構成された自身のデッキを用意します。カードの種類については後述します。
    両プレイヤーのデッキ（計60枚）を混ぜ合わせ、共通の山札とします。これを「メインデッキ」と呼びます。
    各プレイヤーは、自身のデッキの中から任意のカードを5枚選び、「デッキマスター」として表向きで自分の場に配置します。デッキマスターはゲーム開始時に配置され、ゲーム中に増減することはありません。
    デッキマスターとして選ばれたカードは、メインデッキには含まれません。
    デッキマスターは常に表向きで、その攻撃力(ATK)と体力(HP)は常に相手から確認できます。

3. ゲームの進行
    ゲームはターン制で進行します。先攻・後攻はランダムで決定します。

    各ターンのフェーズ
    ドローフェーズ: メインデッキからカードを1枚引いて手札に加えます。
        メインデッキのカードが0枚の状態でドローフェーズを迎えた場合、そのプレイヤーは直ちに敗北します。
    マナフェーズ: 自分の「マナ」を全回復します。
        ターンが経過するごとに、使用できるマナの最大値（「マナ上限」）が1ずつ増加します。ただし、マナ上限は最大10までとします。
    メインフェーズ: プレイヤーは自分の手札からカードを「マナ」を消費してプレイできます。
        プレイできるカードの枚数に制限はありませんが、マナが足りなければプレイできません。
        フィールドにカードを配置したり、能力を発動したりします。
        デッキマスターの「召喚」: メインフェーズ中、プレイヤーは自分の表向きのデッキマスターを召喚できます。召喚には以下の2つの方法があります。
        通常召喚: そのデッキマスターの持つ「マナコスト」を支払うことで、通常のクリーチャーとして場に召喚できます。
        特殊召喚: 特定の強力なデッキマスターの場合、そのカードに記された「魔方陣」カードを1枚手札から墓地に置くことで、マナコストを支払うことなく召喚できます。
        召喚されたデッキマスターは、他のクリーチャーと同じように「場」に配置され、そのターンから攻撃に参加できます。
        召喚されたデッキマスターは、攻撃力、体力、能力をそのまま持ちます。
        召喚後、そのデッキマスターがあった場所には何も置かれません（デッキマスターの枠は空きになります）。
        召喚されたデッキマスターが破壊された場合、通常のクリーチャーと同様に墓地に置かれます。
        召喚されたデッキマスターは、「デッキマスターの破壊」としてはカウントされません。相手が破壊すべきデッキマスターの総数は減ります。
    アタックフェーズ: 自分の場にいる「クリーチャー」（召喚されたデッキマスターを含む）で攻撃を行います。
        攻撃は以下のいずれかの対象に対して行えます。
        相手の場にいるクリーチャーへの攻撃: 戦闘が発生します。
        相手の「デッキマスター」への攻撃: デッキマスターが破壊される可能性があります。
        攻撃回数: 各クリーチャーは1ターンに1回のみ攻撃できます。
        ブロック: 相手のクリーチャーが攻撃してきた場合、防御側は自分のクリーチャーでブロックできます。ブロックされた攻撃は、攻撃対象がブロッククリーチャーになります。
    エンドフェーズ: ターンを終了します。
        手札の上限は7枚とします。8枚以上ある場合、7枚になるように好きなカードを捨てる必要があります。

4. カードの種類
    すべてのカードは「マナコスト」を持ちます。（「魔方陣」カードを除く）

    クリーチャーカード:
        マナコスト: カードをプレイするために必要なマナ。
        攻撃力 (ATK): 相手に与えるダメージの量。
        体力 (HP): 受けるダメージに対する耐久力。HPが0になると破壊され、墓地に置かれます。
        能力: 特殊な効果を持つ場合があります。
    スペルカード (呪文):
        マナコスト: カードをプレイするために必要なマナ。
        効果: プレイすると即座に効果を発動し、その後墓地に置かれます。
        例：相手のクリーチャー1体に3ダメージを与える、自分のクリーチャー1体のATKを+2する、手札を2枚引く、など。
        ※スペルカードはプレイヤーへの直接ダメージを与える効果は持ちません。
    魔方陣カード:
        マナコスト: ありません。（マナコストありの魔方陣も追加予定）
        効果: 手札から墓地に置くことで、特定の強力なデッキマスターをマナコストを支払うことなく召喚できます。
        このカードはゲーム中にメインデッキに含め、ドローして手札に加える必要があります。

5. デッキマスターのルール（最終調整版）
    表向き配置: デッキマスターは常に表向きで配置され、そのATKとHPは常にお互いに確認できます。
    召喚可能: メインフェーズ中、プレイヤーは自分の表向きのデッキマスターを、以下のいずれかの方法で召喚できます。
    そのカードのマナコストを支払う。
    特定のデッキマスターの場合、手札から「魔方陣」カード1枚を墓地に置く。
    召喚されたデッキマスターは、そのカードのATK、HP、能力を持ち、他のクリーチャーと同様に扱われます。
    召喚後、そのデッキマスターが元々あったデッキマスター枠は空きとなります。
    召喚されたデッキマスターが破壊されても、それは「デッキマスターの破壊」としてはカウントされず、通常のクリーチャーとして墓地に置かれます。
    デッキマスターへの攻撃: デッキマスターは攻撃を受けた際に、その攻撃の攻撃力がデッキマスターの「体力」を上回った場合に破壊されます。
    破壊されたデッキマスターは墓地に置かれます。これは「デッキマスターの破壊」としてカウントされます。
    全滅での敗北: 自分の場に残っているデッキマスター（表向きの5つの枠のうち、召喚されずに残っているデッキマスター）が5枚すべて破壊された場合、直ちに敗北します。

6. 勝利条件
    相手の場に残っているデッキマスター5枚すべてを破壊する。
    相手がドローフェーズでデッキ切れになった場合。

7. 敗北条件
    自分の場に残っているデッキマスター5枚すべてが破壊される。
    ドローフェーズで自分のデッキが0枚の場合。
`;

document.addEventListener('DOMContentLoaded', () => {

    // --- 主要な定数とグローバル変数 ---
    const MAX_DECK_SIZE = 30;
    const MAX_COPIES_PER_CARD = 3;
    const MAX_DECK_MASTERS = 5;
    const LONG_PRESS_DURATION = 1500;

    let currentEditingDeck = [];
    let currentEditingDMs = [];

    // --- UI要素のキャッシュ ---
    const uiElements = {
        startScreen: document.getElementById('start-screen'),
        startGameButton: document.getElementById('start-game-button'),
        deckEditButton: document.getElementById('deck-edit-button'),
        viewRulesButton: document.getElementById('view-rules-button'),
        gameContainer: document.querySelector('.game-container'),
        selfHandZone: document.querySelector('.self-hand-zone'),
        selfDeckMastersZone: document.querySelector('.self-deck-masters-zone'),
        opponentDeckMastersZone: document.querySelector('.opponent-deck-masters-zone'),
        selfFieldZone: document.querySelector('.self-field-zone'),
        opponentFieldZone: document.querySelector('.opponent-field-zone'),
        mainDeckCardsCount: document.getElementById('main-deck-cards-count'),
        graveyardDisplayArea: document.getElementById('graveyard-display-area'),
        graveyardCount: document.getElementById('graveyard-count'),
        selfCurrentMana: document.getElementById('self-current-mana'),
        selfMaxMana: document.getElementById('self-max-mana'),
        opponentCurrentManaDisplay: document.getElementById('opponent-current-mana'),
        opponentMaxManaDisplay: document.getElementById('opponent-max-mana'),
        currentTurnPlayer: document.getElementById('current-turn-player'),
        turnCount: document.getElementById('turn-count'),
        currentPhaseDisplay: document.getElementById('current-phase'),
        drawButton: document.getElementById('draw-button'),
        attackButton: document.getElementById('attack-button'),
        endTurnButton: document.getElementById('end-turn-button'),
        resetGameButton: document.getElementById('reset-game-button'),
        selfDestroyedDMsCount: document.getElementById('self-destroyed-dms-count'),
        opponentDestroyedDMsCount: document.getElementById('opponent-destroyed-dms-count'),
        selfHandCount: document.getElementById('self-hand-count'),
        opponentHandCount: document.getElementById('opponent-hand-count'),
        deckEditorScreen: document.getElementById('deck-editor-screen'),
        availableCardsPool: document.getElementById('available-cards-pool'),
        currentDeckDisplay: document.getElementById('current-deck-display'),
        currentDeckCardCount: document.getElementById('current-deck-card-count'),
        availableCardsCount: document.getElementById('available-cards-count'),
        saveDeckButton: document.getElementById('save-deck-button'),
        clearDeckButton: document.getElementById('clear-deck-button'),
        exitDeckEditorButton: document.getElementById('exit-deck-editor-button'),
        availableDmsPool: document.getElementById('available-dms-pool'),
        currentDmsDisplay: document.getElementById('current-dms-display'),
        currentDmsCount: document.getElementById('current-dms-count'),
        rulesScreen: document.getElementById('rules-screen'),
        rulesContent: document.getElementById('rules-content'),
        closeRulesButton: document.getElementById('close-rules-button'),
        cardDetailModal: document.getElementById('card-detail-modal'),
        modalCardDetailArea: document.getElementById('modal-card-detail-area'),
        modalCloseButton: document.getElementById('modal-close-button'),
        graveyardViewModal: document.getElementById('graveyard-view-modal'),
        graveyardModalCloseButton: document.getElementById('graveyard-modal-close-button'),
        graveyardCardsArea: document.getElementById('graveyard-cards-area'),
        graveyardModalCardCount: document.getElementById('graveyard-modal-card-count')
    };

    // --- ここから関数定義 ---

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
  
 function drawCardToHand(playerType) {
        const player = gameState[playerType];
        if (!player || !Array.isArray(player.hand)) {
            console.error(`${playerType} hand is not an array.`);
            return false;
        }
        if (gameState.mainDeck.length === 0) {
            if (gameState.currentPhase !== 'gameOver') endGame('deck_out', playerType === 'self' ? 'opponent' : 'self');
            return false;
        }
        const drawnCard = gameState.mainDeck.shift();
        if (drawnCard && drawnCard.id) {
            player.hand.push(drawnCard);
        } else {
            console.error("Attempted to draw an invalid card object from mainDeck.", drawnCard);
            return false;
        }
        console.log(`${playerType} drew ${drawnCard.name}. Hand size: ${player.hand.length}`);
        if (playerType === 'self' && uiElements.selfHandZone) renderHand();
        return true;
    }

/**
 * 攻撃エフェクトを表示する
 * @param {HTMLElement} attackerElement - 攻撃クリーチャーのカード要素
 * @param {HTMLElement} defenderElement - 防御側のカードまたはスロット要素
 */
function showAttackEffects(attackerElement, defenderElement) {
    console.log("showAttackEffects が呼び出されました。");
    console.log("攻撃者の要素:", attackerElement);
    console.log("防御側の要素:", defenderElement);

    if (attackerElement) {
        attackerElement.classList.add('is-attacking');
        console.log("攻撃者に 'is-attacking' クラスを追加しました。");
        setTimeout(() => attackerElement.classList.remove('is-attacking'), 600); // 0.6秒後にクラスを削除
    } else {
        console.error("攻撃者の要素が見つかりませんでした。");
    }

    if (defenderElement) {
        // スロット自体にエフェクト用オーバーレイがあるか確認
        const effectOverlay = defenderElement.querySelector('.summon-effect-overlay');
        if (effectOverlay) {
            effectOverlay.classList.add('is-slashed');
            console.log("防御側のエフェクトオーバーレイに 'is-slashed' クラスを追加しました。");
            setTimeout(() => effectOverlay.classList.remove('is-slashed'), 600); // 0.6秒後にクラスを削除
        } else {
            console.error("防御側のエフェクトオーバーレイ (.summon-effect-overlay) が見つかりませんでした。renderField関数を確認してください。");
        }
    } else {
        console.error("防御側の要素が見つかりませんでした。");
    }
}

    function showSummonEffect(playerType, slotIndex) {
        const slotElement = document.querySelector(`.${playerType}-field-zone .field-slot[data-slot-index="${slotIndex}"]`);
        if (slotElement) {
            const effectElement = slotElement.querySelector('.summon-effect-overlay');
            if (effectElement) {
                effectElement.classList.remove('active');
                void effectElement.offsetWidth;
                effectElement.classList.add('active');
                setTimeout(() => {
                    if (effectElement) {
                        effectElement.classList.remove('active');
                    }
                }, 500); 
            }
        }
    }

    function createCardElement(card, currentHP = null, isSummaryView = false, fieldCreatureObject = null) {
        const cardDiv = document.createElement('div');
        cardDiv.classList.add('card-placeholder');
        if (!card || !card.id) {
            cardDiv.innerHTML = '---';
            return cardDiv;
        }
        cardDiv.dataset.cardId = card.id;
        cardDiv.dataset.cardType = card.type;
        if (isSummaryView) cardDiv.classList.add('summary-view');

        let displayATK = card.atk !== undefined ? card.atk : '-';
        let displayHP = (currentHP !== null) ? currentHP : (card.hp !== undefined ? card.hp : '-');
        
        if (card.id === 'C_N02') {
            const creatureCardsInGraveyard = gameState.graveyard.filter(c => c.type === 'creature' || c.type === 'deck_master').length;
            displayATK = (card.atk || 0) + creatureCardsInGraveyard;
        }

        if (fieldCreatureObject && typeof fieldCreatureObject.powerCounters === 'number' && fieldCreatureObject.powerCounters > 0) {
            if (card.atk !== undefined && typeof displayATK === 'number') { 
                displayATK += fieldCreatureObject.powerCounters;
            }
        }
        
        if (fieldCreatureObject && fieldCreatureObject.card.id === 'DM_A01' && fieldCreatureObject.isAwakened) {
             const coreMachinaBaseData = cardData.find(c=>c.id === 'DM_A01');
             if(coreMachinaBaseData && coreMachinaBaseData.onSummonEffect && coreMachinaBaseData.onSummonEffect.awakened_stats){
                displayATK = coreMachinaBaseData.onSummonEffect.awakened_stats.atk;
             }
        }
        const cardTitle = card.subtype ? `${card.name} <span class="card-subtype">[${card.subtype}]</span>` : card.name;
        let htmlContent = `<div class="card-name">${cardTitle}</div>`;
        if (card.hasOwnProperty('manaCost') && card.type !== 'magic_square') {
            htmlContent += `<div class="card-cost">マナ:${card.manaCost}</div>`;
        }
        if (card.type === 'creature' || card.type === 'deck_master') {
            cardDiv.classList.add('creature-card');
            if (card.type === 'deck_master') {
                cardDiv.classList.add('deck-master-card-visual');
            }
            htmlContent += `
                <div class="card-stats">
                    <span class="card-atk">ATK:${displayATK}</span> / <span class="card-hp">HP:${displayHP}</span>
                </div>`;
        } else if (card.type === 'spell') {
            cardDiv.classList.add('spell-card');
        } else if (card.type === 'magic_square') {
            cardDiv.classList.add('magic-square-card');
        }
        if (!isSummaryView) {
            let abilitiesText = card.abilities ? card.abilities.join(', ') : '';
            htmlContent += `<div class="card-abilities">${abilitiesText}</div>`;
            let allEffectTexts = [];
            if (card.effectText) allEffectTexts.push(card.effectText);
            if (card.onSummonEffectText) allEffectTexts.push(card.onSummonEffectText);
            if (card.activatedAbilityText) allEffectTexts.push(card.activatedAbilityText);
            if (card.onDeathEffectText) allEffectTexts.push(card.onDeathEffectText);
            const effectDescription = allEffectTexts.join('<br><hr class="effect-divider"><br>');
            if (effectDescription) {
                htmlContent += `<div class="card-effect">${effectDescription}</div>`;
            }
        }
        cardDiv.innerHTML = htmlContent;
        return cardDiv;
    }

   function handleCardInteraction(cardElement, cardData, singleClickAction, longPressAction, currentHP = null) {
        let pressTimer = null;
        let isLongPressTriggered = false;
        let isClickHandled = false;

        const startPress = (event) => {
            if (event.target.classList.contains('play-from-hand-button')) {
                isClickHandled = true; return;
            }
            isLongPressTriggered = false; isClickHandled = false;
            pressTimer = setTimeout(() => {
                isLongPressTriggered = true; isClickHandled = true;
                if (longPressAction) longPressAction(cardData, currentHP);
            }, LONG_PRESS_DURATION);
        };
        const endPress = (event) => {
            clearTimeout(pressTimer);
            if (!isLongPressTriggered && !isClickHandled) {
                if (event.target.classList.contains('play-from-hand-button')) return;
                if (singleClickAction) singleClickAction();
            }
        };
        cardElement.addEventListener('mousedown', startPress);
        cardElement.addEventListener('mouseup', endPress);
        cardElement.addEventListener('mouseleave', () => clearTimeout(pressTimer));
        cardElement.addEventListener('touchstart', (e) => { e.preventDefault(); e.stopPropagation(); startPress(e);});
        cardElement.addEventListener('touchend', (e) => { e.preventDefault(); e.stopPropagation(); endPress(e);});
        cardElement.addEventListener('touchcancel', () => clearTimeout(pressTimer));
    }

    function openCardDetailModal(cardInfo, currentHP = null) {
        if (uiElements.cardDetailModal && uiElements.modalCardDetailArea) {
            uiElements.modalCardDetailArea.innerHTML = '';
            const cardElement = createCardElement(cardInfo, currentHP, false);
            uiElements.modalCardDetailArea.appendChild(cardElement);
            uiElements.cardDetailModal.style.display = 'flex';
        }
    }

    function closeCardDetailModal() {
        if (uiElements.cardDetailModal) uiElements.cardDetailModal.style.display = 'none';
    }

    function openGraveyardModal() {
        if (!uiElements.graveyardViewModal || !uiElements.graveyardCardsArea || !uiElements.graveyardModalCardCount) return;
        uiElements.graveyardCardsArea.innerHTML = ''; 
        uiElements.graveyardModalCardCount.textContent = gameState.graveyard.length;
        if (gameState.graveyard.length === 0) {
            uiElements.graveyardCardsArea.textContent = "墓地は空です。";
        } else {
            gameState.graveyard.forEach(card => {
                if (card && card.id) {
                    const cardElement = createCardElement(card, card.hp, true, null); 
                    handleCardInteraction(cardElement, card,
                        () => openCardDetailModal(card, card.hp),
                        () => {} 
                    );
                    uiElements.graveyardCardsArea.appendChild(cardElement);
                }
            });
        }
        uiElements.graveyardViewModal.style.display = 'flex';
    }

    function closeGraveyardModal() {
        if (uiElements.graveyardViewModal) {
            uiElements.graveyardViewModal.style.display = 'none';
        }
    }

    function initializeDeckEditor() {
        const savedEditingDeckIdsString = localStorage.getItem('editingPlayerDeck');
        currentEditingDeck = [];
        if (savedEditingDeckIdsString) {
            try {
                const savedEditingDeckIds = JSON.parse(savedEditingDeckIdsString);
                if (Array.isArray(savedEditingDeckIds)) {
                    currentEditingDeck = savedEditingDeckIds.map(id => {
                        const card = cardData.find(c => c.id === id);
                        return card ? { ...card } : null;
                    }).filter(Boolean);
                }
            } catch (e) { console.error("編集中デッキの読み込み失敗:", e); }
        }
        const savedDMIdsString = localStorage.getItem('playerDeckMasters');
        currentEditingDMs = [];
        if (savedDMIdsString) {
            try {
                const savedDMIds = JSON.parse(savedDMIdsString);
                 if (Array.isArray(savedDMIds)) {
                    currentEditingDMs = savedDMIds.map(id => cardData.find(c => c.id === id)).filter(Boolean);
                 }
            } catch (e) { console.error("デッキマスター読み込み失敗(editor):", e); }
        }
        populateAvailableDMs();
        renderCurrentDMs();
        populateAvailableCards();
        renderCurrentDeckDisplay();
        updateDeckCounts();
    }

    function populateAvailableCards() {
        if (!uiElements.availableCardsPool) return;
        uiElements.availableCardsPool.innerHTML = '';
        const mainDeckCards = cardData.filter(card => card.type !== 'deck_master' && !card.id.startsWith('T_'));
        if (uiElements.availableCardsCount) uiElements.availableCardsCount.textContent = mainDeckCards.length;
        mainDeckCards.forEach(card => {
            const cardElement = createCardElement(card, card.hp, true);
            handleCardInteraction(cardElement, card, () => addCardToDeck(card), (cData, _hp) => openCardDetailModal(cData, _hp));
            uiElements.availableCardsPool.appendChild(cardElement);
        });
    }

    function populateAvailableDMs() {
        if (!uiElements.availableDmsPool) return;
        uiElements.availableDmsPool.innerHTML = '';
        const deckMasterCards = cardData.filter(card => card.type === 'deck_master');
        deckMasterCards.forEach(card => {
            const cardElement = createCardElement(card, card.hp, true);
            handleCardInteraction(cardElement, card, () => addDMToSelection(card), (cData, _hp) => openCardDetailModal(cData, _hp));
            uiElements.availableDmsPool.appendChild(cardElement);
        });
    }

    function renderCurrentDMs() {
        if (!uiElements.currentDmsDisplay || !uiElements.currentDmsCount) return;
        uiElements.currentDmsDisplay.innerHTML = '';
        currentEditingDMs.forEach((card, index) => {
            if (!card) return;
            const cardElement = createCardElement(card, card.hp, true);
            handleCardInteraction(cardElement, card, () => removeDMFromSelection(index), (cData, _hp) => openCardDetailModal(cData, _hp));
            uiElements.currentDmsDisplay.appendChild(cardElement);
        });
        uiElements.currentDmsCount.textContent = `${currentEditingDMs.length}/${MAX_DECK_MASTERS}`;
    }

    function addDMToSelection(cardObject) {
        if (currentEditingDMs.length >= MAX_DECK_MASTERS) { alert(`デッキマスターは${MAX_DECK_MASTERS}枚までです。`); return; }
        if (currentEditingDMs.find(dm => dm.id === cardObject.id)) { alert(`「${cardObject.name}」は既に選択されています。`); return; }
        currentEditingDMs.push({ ...cardObject });
        renderCurrentDMs();
    }

    function removeDMFromSelection(cardIndex) {
        if (cardIndex < 0 || cardIndex >= currentEditingDMs.length) return;
        currentEditingDMs.splice(cardIndex, 1);
        renderCurrentDMs();
    }

    function addCardToDeck(cardObject) {
        if (currentEditingDeck.length >= MAX_DECK_SIZE) { alert(`デッキは${MAX_DECK_SIZE}枚までです。`); return; }
        const copiesInDeck = currentEditingDeck.filter(c => c.id === cardObject.id).length;
        if (copiesInDeck >= MAX_COPIES_PER_CARD) { alert(`「${cardObject.name}」はデッキに${MAX_COPIES_PER_CARD}枚までしか入れられません。`); return; }
        currentEditingDeck.push({ ...cardObject });
        renderCurrentDeckDisplay();
        updateDeckCounts();
    }

    function removeCardFromDeck(cardIndex) {
        if (cardIndex < 0 || cardIndex >= currentEditingDeck.length) return;
        currentEditingDeck.splice(cardIndex, 1);
        renderCurrentDeckDisplay();
        updateDeckCounts();
    }

    function renderCurrentDeckDisplay() {
        if (!uiElements.currentDeckDisplay) return;
        uiElements.currentDeckDisplay.innerHTML = '';
        currentEditingDeck.forEach((card, index) => {
            if (!card) return;
            const cardElement = createCardElement(card, card.hp, true);
            handleCardInteraction(cardElement, card, () => removeCardFromDeck(index), (cData, _hp) => openCardDetailModal(cData, _hp));
            uiElements.currentDeckDisplay.appendChild(cardElement);
        });
    }

    function updateDeckCounts() {
        if (uiElements.currentDeckCardCount) {
            uiElements.currentDeckCardCount.textContent = `${currentEditingDeck.length}/${MAX_DECK_SIZE}`;
        }
    }

    function initializeGame() {
        console.log("Initializing game...");
        const allPlayableCards = cardData.filter(c => c.type !== 'deck_master' && c.id && !c.id.startsWith('T_'));
        gameState.turn = 1;
        gameState.currentPhase = 'draw';
        gameState.currentPlayer = 'self';
        gameState.selectedAttacker = null;
        gameState.awaitingSpellTarget = null;
        gameState.graveyard = [];
        gameState.pendingSolarisEffect = null;
        ['self', 'opponent'].forEach(playerType => {
            gameState[playerType].currentMana = 0;
            gameState[playerType].maxMana = 0; 
            gameState[playerType].deckMasters = [];
            gameState[playerType].hand = [];
            gameState[playerType].field = new Array(5).fill(null).map(() => null);
            gameState[playerType].destroyedDeckMastersCount = 0;
            gameState[playerType].spellsCastThisTurn = 0;
            gameState[playerType].solarisAbilityUsedThisTurn = false;
            gameState[playerType].licheAbilityUsedThisTurn = false;
            gameState[playerType].nextSpellCostReduction = 0;
        });
        let player1Deck = [];
        const savedDeckIdsString = localStorage.getItem('playerDeck');
        if (savedDeckIdsString) {
            try {
                const savedDeckIds = JSON.parse(savedDeckIdsString);
                if (Array.isArray(savedDeckIds) && savedDeckIds.length === MAX_DECK_SIZE) {
                    player1Deck = savedDeckIds.map(id => {
                        const card = cardData.find(c => c.id === id && c.type !== 'deck_master');
                        return card ? { ...card } : null;
                    }).filter(Boolean);
                    if (player1Deck.length !== MAX_DECK_SIZE) player1Deck = [];
                } else player1Deck = [];
            } catch (e) { player1Deck = []; console.error("プレイヤーデッキ読み込みエラー:", e); }
        }
        if (player1Deck.length !== MAX_DECK_SIZE) {
            console.log("保存された有効なデッキが見つからないため、ランダムデッキを生成します。");
            player1Deck = [];
            for (let i = 0; i < MAX_DECK_SIZE; i++) {
                if (allPlayableCards.length > 0) {
                    player1Deck.push({ ...allPlayableCards[Math.floor(Math.random() * allPlayableCards.length)] });
                } else { console.error("プレイ可能なカードがありません。"); break; }
            }
        }
        let player2Deck = [];
        for (let i = 0; i < MAX_DECK_SIZE; i++) {
            if (allPlayableCards.length > 0) {
                player2Deck.push({ ...allPlayableCards[Math.floor(Math.random() * allPlayableCards.length)] });
            } else { console.error("プレイ可能なカードがありません。"); break; }
        }
        gameState.mainDeck = [...player1Deck, ...player2Deck];
        shuffleArray(gameState.mainDeck);
        let player1DMs = [];
        const savedPlayerDMIdsString = localStorage.getItem('playerDeckMasters');
        if (savedPlayerDMIdsString) {
            try {
                const savedIds = JSON.parse(savedPlayerDMIdsString);
                if (Array.isArray(savedIds) && savedIds.length === MAX_DECK_MASTERS) {
                    player1DMs = savedIds.map(id => {
                        const dmCard = cardData.find(c => c.id === id && c.type === 'deck_master');
                        return dmCard ? { ...dmCard } : null;
                    }).filter(Boolean);
                }
                if (player1DMs.length !== MAX_DECK_MASTERS) player1DMs = [];
            } catch (e) { player1DMs = []; console.error("プレイヤーDM読み込みエラー:", e); }
        }
        if (player1DMs.length === MAX_DECK_MASTERS) {
            gameState.self.deckMasters = player1DMs.map(dmCard => ({ card: { ...dmCard }, isSummoned: false, currentHP: dmCard.hp }));
        } else {
            console.log("保存された有効なDM構成が見つからないため、ランダムDMを生成します。");
            let availableDMs = cardData.filter(c => c.type === 'deck_master' && c.id);
            shuffleArray(availableDMs);
            gameState.self.deckMasters = [];
            for (let i = 0; i < MAX_DECK_MASTERS; i++) {
                if (availableDMs.length > i && availableDMs[i]) {
                    gameState.self.deckMasters.push({ card: { ...availableDMs[i] }, isSummoned: false, currentHP: availableDMs[i].hp });
                } else {
                    const fallbackDM = cardData.find(c => c.type === 'deck_master');
                    if (fallbackDM) gameState.self.deckMasters.push({ card: { ...fallbackDM }, isSummoned: false, currentHP: fallbackDM.hp });
                    else console.error("フォールバックDMも見つかりません。");
                }
            }
        }
        let opponentAvailableDMs = cardData.filter(c => c.type === 'deck_master' && c.id);
        shuffleArray(opponentAvailableDMs);
        gameState.opponent.deckMasters = [];
        for (let i = 0; i < MAX_DECK_MASTERS; i++) {
            if (opponentAvailableDMs.length > i && opponentAvailableDMs[i]) {
                gameState.opponent.deckMasters.push({ card: { ...opponentAvailableDMs[i] }, isSummoned: false, currentHP: opponentAvailableDMs[i].hp });
            } else {
                const fallbackDM = cardData.find(c => c.type === 'deck_master');
                if (fallbackDM) gameState.opponent.deckMasters.push({ card: { ...fallbackDM }, isSummoned: false, currentHP: fallbackDM.hp });
                else console.error("フォールバックDMも見つかりません(相手)。");
            }
        }
        gameState.self.maxMana = 1;
        gameState.self.currentMana = 1;
        for (let i = 0; i < 5; i++) if (gameState.mainDeck.length > 0) drawCardToHand('self');
        gameState.opponent.maxMana = 1;
        gameState.opponent.currentMana = 0;
        for (let i = 0; i < 5; i++) if (gameState.mainDeck.length > 0) drawCardToHand('opponent');
        updateAllUI();
        console.log("Game Initialized. Main Deck:", gameState.mainDeck.length);
        console.log("Self Hand:", gameState.self.hand.map(c => c && c.name ? c.name : 'Invalid Card'));
        console.log("Self DMs:", gameState.self.deckMasters.map(dm => dm && dm.card && dm.card.name ? dm.card.name : 'Invalid DM'));
    }

    function updateAllUI() { updateUI(); renderDeckMasters(); renderHand(); renderField(); }

    function updateUI() {
        if (!uiElements.mainDeckCardsCount) return;
        uiElements.mainDeckCardsCount.textContent = gameState.mainDeck.length;
        if (uiElements.graveyardCount) uiElements.graveyardCount.textContent = gameState.graveyard.length;
        if (uiElements.selfCurrentMana) uiElements.selfCurrentMana.textContent = gameState.self.currentMana;
        if (uiElements.selfMaxMana) uiElements.selfMaxMana.textContent = gameState.self.maxMana;
        if (uiElements.opponentCurrentManaDisplay) uiElements.opponentCurrentManaDisplay.textContent = gameState.opponent.currentMana;
        if (uiElements.opponentMaxManaDisplay) uiElements.opponentMaxManaDisplay.textContent = gameState.opponent.maxMana;
        if (uiElements.currentTurnPlayer) uiElements.currentTurnPlayer.textContent = gameState.currentPlayer === 'self' ? "あなた" : "相手";
        if (uiElements.turnCount) uiElements.turnCount.textContent = gameState.turn;
        if (uiElements.currentPhaseDisplay) uiElements.currentPhaseDisplay.textContent = gameState.currentPhase.replace("opponent_turn_", "相手 ").replace("opponent_", "相手 ").replace("processing", "処理中").replace("_phase", "フェーズ").replace("draw", "ドロー").replace("main", "メイン").replace("attack", "攻撃").replace("end", "終了");
        if (uiElements.selfHandCount) uiElements.selfHandCount.textContent = gameState.self.hand.length;
        if (uiElements.opponentHandCount) uiElements.opponentHandCount.textContent = gameState.opponent.hand.length;
        if (uiElements.selfDestroyedDMsCount) uiElements.selfDestroyedDMsCount.textContent = `${gameState.self.destroyedDeckMastersCount}/${MAX_DECK_MASTERS}`;
        if (uiElements.opponentDestroyedDMsCount) uiElements.opponentDestroyedDMsCount.textContent = `${gameState.opponent.destroyedDeckMastersCount}/${MAX_DECK_MASTERS}`;
        const isPlayerTurn = gameState.currentPlayer === 'self';
        const isGameOver = gameState.currentPhase === 'gameOver';
        if (uiElements.drawButton) uiElements.drawButton.disabled = isGameOver || gameState.currentPhase !== 'draw' || !isPlayerTurn;
        if (uiElements.attackButton) uiElements.attackButton.disabled = isGameOver || (!isPlayerTurn || (gameState.currentPhase !== 'main' && gameState.currentPhase !== 'attack'));
        if (uiElements.endTurnButton) uiElements.endTurnButton.disabled = isGameOver || !isPlayerTurn;
    }

   function renderDeckMasters() {
        ['self', 'opponent'].forEach(playerType => {
            const zone = playerType === 'self' ? uiElements.selfDeckMastersZone : uiElements.opponentDeckMastersZone;
            if (!zone) {
                console.error(`${playerType} DM zone not found!`);
                return;
            }
            zone.innerHTML = '';
            for (let i = 0; i < MAX_DECK_MASTERS; i++) {
                const dmSlot = document.createElement('div');
                dmSlot.classList.add('deck-master-slot');
                dmSlot.dataset.slotIndex = i;
                dmSlot.dataset.owner = playerType;
                const dmObject = gameState[playerType].deckMasters[i];
                if (dmObject && dmObject.card && dmObject.card.id) {
                    let isConsideredDestroyed = (!dmObject.isSummoned && dmObject.currentHP <= 0);
                    if (isConsideredDestroyed) {
                        dmSlot.textContent = "破壊済";
                        dmSlot.style.color = '#555';
                    } else if (!dmObject.isSummoned && dmObject.currentHP > 0) {
                        const dmElement = createCardElement(dmObject.card, dmObject.currentHP, true);
                        dmElement.classList.add('unsummoned-deck-master');
                        handleCardInteraction(dmElement, dmObject.card,
                            () => {
                                if (playerType === 'self') {
                                    if (gameState.awaitingSpellTarget && gameState.awaitingSpellTarget.player === 'self' && gameState.awaitingSpellTarget.effect?.type === 'heal_deck_master_in_zone' && dmObject.currentHP < dmObject.card.hp) {
                                        const spellToResolve = gameState.awaitingSpellTarget.card;
                                        applyHealDeckMasterInZoneEffect(dmObject, spellToResolve.effect.value);
                                        applySpellTargetAndCleanUp(spellToResolve, dmObject, playerType, i);
                                    } else if (!gameState.awaitingSpellTarget) {
                                        handleDeckMasterClick(dmObject.card.id, i);
                                    }
                                } else {
                                    if (gameState.currentPlayer === 'self' && gameState.awaitingSpellTarget && gameState.awaitingSpellTarget.player === 'self' && gameState.awaitingSpellTarget.effect?.targetOwner === 'opponent' && gameState.awaitingSpellTarget.effect.targetCategory === 'deck_master_in_zone') {
                                        applySpellTargetAndCleanUp(gameState.awaitingSpellTarget.card, dmObject, 'opponent', i);
                                    } else if (gameState.currentPlayer === 'self' && gameState.currentPhase === 'attack' && gameState.selectedAttacker) {
                                        handleTargetClick(dmObject.card.id, i, 'deckMaster', 'opponent');
                                    }
                                }
                            },
                            (cardDataForModal, hp) => openCardDetailModal(cardDataForModal, hp),
                            dmObject.currentHP
                        );
                        dmSlot.appendChild(dmElement);
                    } else if (dmObject.isSummoned) {
                        dmSlot.textContent = "召喚済み";
                        dmSlot.style.color = '#777';
                    } else { 
                        dmSlot.textContent = "---";
                    }
                } else {
                    dmSlot.textContent = "---"; 
                }
                zone.appendChild(dmSlot);
            }
        });
    }

    function checkCoreMachinaAwakening(playerType) {
        const playerState = gameState[playerType];
        const coreMachinaFieldObject = playerState.field.find(c => c && c.card.id === 'DM_A01');
        if (!coreMachinaFieldObject) return;
        const otherAutomataCount = playerState.field.filter(c => c && c.card.id !== 'DM_A01' && c.card.subtype === 'オートマタ').length;
        const coreMachinaBaseData = cardData.find(c => c.id === 'DM_A01');
        if (!coreMachinaBaseData?.onSummonEffect?.awaken_condition) {
            console.error("Core Machina base data or awaken condition missing for awakening check.");
            return;
        }
        const condition = coreMachinaBaseData.onSummonEffect.awaken_condition;
        const currentlyAwakened = coreMachinaFieldObject.isAwakened || false;
        let shouldAwaken = otherAutomataCount >= condition.count;
        if (shouldAwaken && !currentlyAwakened) {
            coreMachinaFieldObject.isAwakened = true;
            console.log('機構長 コア・マキナが戦闘モードに移行！');
            updateAllUI();
        } else if (!shouldAwaken && currentlyAwakened) {
            coreMachinaFieldObject.isAwakened = false;
            console.log('機構長 コア・マキナが司令官モードに移行。');
            updateAllUI();
        }
    }

    function renderHand() {
        if (!uiElements.selfHandZone) return;
        uiElements.selfHandZone.innerHTML = '';
        gameState.self.hand.forEach(card => {
            if (!card || !card.id) { console.warn("Invalid card in hand during render:", card); return; }
            const cardItemWrapper = document.createElement('div');
            cardItemWrapper.classList.add('hand-card-item');
            const cardElement = createCardElement(card, card.hp, true);
            handleCardInteraction(cardElement, card,
                () => {},
                (cData, _hp) => openCardDetailModal(cData, _hp)
            );
            const playButtonForHandCard = document.createElement('button');
            playButtonForHandCard.textContent = "使う";
            playButtonForHandCard.classList.add('play-from-hand-button');
            playButtonForHandCard.onclick = (e) => { e.stopPropagation(); handleCardClick(card.id); };
            cardItemWrapper.appendChild(cardElement);
            cardItemWrapper.appendChild(playButtonForHandCard);
            uiElements.selfHandZone.appendChild(cardItemWrapper);
        });
    }

    function renderField() {
        ['self', 'opponent'].forEach(playerType => {
            const zone = playerType === 'self' ? uiElements.selfFieldZone : uiElements.opponentFieldZone;
            if (!zone) return; zone.innerHTML = '';
            for (let i = 0; i < 5; i++) {
                const slot = document.createElement('div');
                slot.classList.add('field-slot');
                slot.dataset.slotIndex = i;
                slot.dataset.owner = playerType;
                
                const effectOverlay = document.createElement('div');
                effectOverlay.classList.add('summon-effect-overlay');
                slot.appendChild(effectOverlay);
                
                const creatureInSlot = gameState[playerType].field[i];
                if (creatureInSlot && creatureInSlot.card && creatureInSlot.card.id) {
                    const cardElement = createCardElement(creatureInSlot.card, creatureInSlot.currentHP, true, creatureInSlot); 
                    if (creatureInSlot.hasAttacked) cardElement.classList.add('has-attacked');
                    handleCardInteraction(cardElement, creatureInSlot.card, 
                        () => { 
                            if (playerType === 'self') {
                                handleFieldCreatureClick(creatureInSlot.card.id, i, 'self');
                            } else { 
                                if (gameState.currentPlayer === 'self' && gameState.awaitingSpellTarget) {
                                    handleTargetClick(creatureInSlot.card.id, i, 'creature', 'opponent');
                                } else if (gameState.currentPlayer === 'self' && gameState.currentPhase === 'attack' && gameState.selectedAttacker) {
                                    handleTargetClick(creatureInSlot.card.id, i, 'creature', 'opponent');
                                }
                            }
                        },
                        (cardForModal, hp) => openCardDetailModal(creatureInSlot.card, hp),
                        creatureInSlot.currentHP
                    );
                    slot.appendChild(cardElement);
                }
                zone.appendChild(slot);
            }
        });
    }
    




 function applySpellTargetAndCleanUp(spellCard, targetObject, targetOwner, targetSlotIndex) {
        const currentTargetInfo = gameState.awaitingSpellTarget;
        const effectToApply = currentTargetInfo?.effect || spellCard?.effect;
    
        if (!effectToApply) {
            console.error("適用する効果が見つかりません(applySpellTargetAndCleanUp)。", spellCard, currentTargetInfo);
            if(currentTargetInfo) gameState.awaitingSpellTarget = null;
            document.querySelectorAll('.potential-spell-target').forEach(el => el.classList.remove('potential-spell-target'));
            updateAllUI();
            return;
        }
        
        let effectApplied = false;
    
        if (effectToApply.type === "return_creature_to_hand" && targetOwner === 'self' && targetObject.card.type === 'creature') {
            applyReturnCreatureToHandEffect(targetObject, targetSlotIndex);
            effectApplied = true;
        } else if (effectToApply.type === "heal_deck_master_in_zone" && targetOwner === 'self' && targetObject.card.type === 'deck_master' && !targetObject.isSummoned) {
            applyHealDeckMasterInZoneEffect(targetObject, effectToApply.value);
            effectApplied = true;
        } else if (effectToApply.type === "damage" || (effectToApply.type === "heal" && targetObject.card.type === 'creature')) {
            applySpellEffectToTarget(currentTargetInfo ? currentTargetInfo.card : spellCard, targetObject, targetOwner, targetSlotIndex, effectToApply);
            effectApplied = true;
        } else {
            console.warn("applySpellTargetAndCleanUp で未対応の効果タイプ:", effectToApply.type);
        }
    
        const wasSolarisEffect = currentTargetInfo?.isSolarisEffect;

        if (effectApplied || (effectToApply && !effectToApply.requiresTarget)) { 
            if (!(wasSolarisEffect && gameState.pendingSolarisEffect)) {
                gameState.awaitingSpellTarget = null;
                document.querySelectorAll('.potential-spell-target').forEach(el => el.classList.remove('potential-spell-target'));
            }
        }
        
        if (wasSolarisEffect && gameState.pendingSolarisEffect) {
            const originalSpell = gameState.pendingSolarisEffect.originalSpell;
            gameState.pendingSolarisEffect = null; 
            gameState.awaitingSpellTarget = null;
            document.querySelectorAll('.potential-spell-target').forEach(el => el.classList.remove('potential-spell-target'));
            
            console.log("ソラリス効果解決後、元のスペルを解決します:", originalSpell.name);
            resolveSpellEffect(originalSpell, 'self'); 
        } else {
            updateAllUI(); 
        }
    }

    function applySpellEffectToTarget(spellSourceCard, targetObject, targetOwner, targetSlotIndex, effectOverride = null) {
        const currentTargetInfo = gameState.awaitingSpellTarget;
        const effectToApply = effectOverride || currentTargetInfo?.effect || spellSourceCard?.effect;
    
        if (!effectToApply) {
            console.error("適用する効果が見つかりません(applySpellEffectToTarget)。", spellSourceCard, currentTargetInfo);
            if (currentTargetInfo) gameState.awaitingSpellTarget = null;
            document.querySelectorAll('.potential-spell-target').forEach(el => el.classList.remove('potential-spell-target'));
            updateAllUI();
            return;
        }
    
        let targetTypeForDestroy = 'creature';
        if (targetObject && targetObject.card && targetObject.card.type === 'deck_master') targetTypeForDestroy = 'deck_master';
    
        const value = currentTargetInfo?.calculatedValue !== undefined ? currentTargetInfo.calculatedValue : effectToApply.value;
    
        if (typeof value !== 'number' && 
           (effectToApply.type === 'damage' || effectToApply.type === 'heal' || effectToApply.type === 'heal_deck_master_in_zone')) {
            console.error("Effect value is not a number for damage/heal type effect", effectToApply, value);
        } else {
            switch (effectToApply.type) {
                case "heal":
                    if (targetObject && targetObject.card && typeof targetObject.currentHP === 'number') {
                        targetObject.currentHP = Math.min(targetObject.card.hp, targetObject.currentHP + value);
                    }
                    break;
                case "damage":
                    if (targetObject && targetObject.card && typeof targetObject.currentHP === 'number') {
                        targetObject.currentHP -= value;
                        if (targetObject.currentHP <= 0) {
                            destroyCard(targetObject, targetSlotIndex, targetTypeForDestroy, targetOwner);
                        }
                    }
                    break;
                default: console.warn(`未対応ターゲット指定効果(applySpellEffectToTarget switch): ${effectToApply.type}`);
            }
        }
    }


    function applyReturnCreatureToHandEffect(targetCreatureObject, slotIndexInField) {
        if (!targetCreatureObject || !targetCreatureObject.card) { console.error("手札に戻す対象のクリーチャー情報がありません。"); return; }
        const returnedCardData = { ...targetCreatureObject.card };
        gameState.self.field[slotIndexInField] = null;
        if (gameState.self.hand.length < 7) { 
            gameState.self.hand.push(returnedCardData); 
        } else { 
            alert("手札がいっぱいです！戻されたカードは墓地に送られます。"); 
            gameState.graveyard.push(returnedCardData); 
        }
        checkCoreMachinaAwakening('self');
    }


 function applyHealDeckMasterInZoneEffect(targetDMObject, healValue) {
        if (!targetDMObject || !targetDMObject.card || typeof targetDMObject.currentHP !== 'number' || typeof healValue !== 'number') {
             console.error("DM回復効果の対象または値が無効です:", targetDMObject, healValue); return;
        }
        const oldHP = targetDMObject.currentHP; 
        targetDMObject.currentHP = Math.min(targetDMObject.card.hp, targetDMObject.currentHP + healValue); 
        console.log(`デッキマスター「${targetDMObject.card.name}」のHPが ${oldHP} から ${targetDMObject.currentHP} に回復しました。 (+${healValue})`);
    }

function handleCardClick(cardId) {
        if (gameState.currentPlayer !== 'self' || gameState.currentPhase !== 'main' || gameState.currentPhase === 'gameOver') return;
        
        if (gameState.awaitingSpellTarget && !gameState.awaitingSpellTarget.isSolarisEffect) {
             if (confirm("スペルのターゲット選択をキャンセルしますか？")) {
                cancelSpellTargeting();
             }
             return; 
        }
        if (gameState.awaitingSpellTarget && gameState.awaitingSpellTarget.isSolarisEffect) {
            alert("ソラリスの効果のターゲットを選択中です。他のカードはプレイできません。");
            return;
        }

        const cardIndex = gameState.self.hand.findIndex(card => card.id === cardId);
        if (cardIndex === -1) { console.warn(`Card not found in hand: ${cardId}`); return; }

        const clickedCard = gameState.self.hand[cardIndex];
        if (!clickedCard) { console.warn(`Clicked card object is null/undefined for ID: ${cardId}`); return; }

        if (clickedCard.type === 'magic_square') {
            handleMagicSquarePlay(cardIndex, clickedCard);
            return;
        }

        if (!clickedCard.hasOwnProperty('manaCost')) { console.error("Card manaCost is missing:", clickedCard); return; }
        
        let effectiveManaCost = clickedCard.manaCost;
        if (clickedCard.type === 'spell' && gameState.self.nextSpellCostReduction > 0) {
            effectiveManaCost = Math.max(0, clickedCard.manaCost - gameState.self.nextSpellCostReduction);
            console.log(`魔力循環の効果適用！ 本来コスト:${clickedCard.manaCost} → 軽減後コスト:${effectiveManaCost}`);
        }

        if (gameState.self.currentMana < effectiveManaCost) {
            alert(`マナが足りません！(必要マナ: ${effectiveManaCost})`);
            return;
        }

        if (clickedCard.type === 'creature') {
            const emptySlotIndex = gameState.self.field.findIndex(slot => slot === null);
            if (emptySlotIndex === -1) { alert("フィールドがいっぱいです！"); return; }

            gameState.self.currentMana -= effectiveManaCost;
            const playedCard = gameState.self.hand.splice(cardIndex, 1)[0];
            gameState.self.field[emptySlotIndex] = { card: { ...playedCard }, currentHP: playedCard.hp, hasAttacked: false, powerCounters: 0 };

            updateAllUI();
            showSummonEffect('self', emptySlotIndex); 
            
            resolveOnSummonEffect(playedCard, 'self', emptySlotIndex);
            checkCoreMachinaAwakening('self');

        } else if (clickedCard.type === 'spell') {
            gameState.self.currentMana -= effectiveManaCost;
            
            if (gameState.self.nextSpellCostReduction > 0 && clickedCard.id !== "S_E01") { 
                gameState.self.nextSpellCostReduction = 0; 
                alert("コスト軽減効果を消費しました。");
            }
            
            const playedSpell = gameState.self.hand.splice(cardIndex, 1)[0];
            gameState.graveyard.push(playedSpell);

            gameState.self.spellsCastThisTurn++;
            gameState.self.field.forEach((fieldCreature, index) => {
                if (fieldCreature && fieldCreature.card.id === 'C_E01') { 
                    const updatedCreature = { ...fieldCreature, powerCounters: (fieldCreature.powerCounters || 0) + 1 };
                    gameState.self.field[index] = updatedCreature;
                    console.log(`見習い詠唱者(${updatedCreature.card.name})のカウンターが ${updatedCreature.powerCounters} になりました。(handleCardClickより)`);
                }
            });
            
            const solarisOnField = gameState.self.field.find(c => c && c.card.id === 'DM_E01');
            let solarisEffectTriggeredAndAwaitingTarget = false;
            if (solarisOnField && confirm(`ソラリスの効果: (1)マナを支払って相手クリーチャー1体に1ダメージ与えますか？ 現在マナ: ${gameState.self.currentMana}`)) {
                if (gameState.self.currentMana >= 1) {
                    gameState.self.currentMana -= 1;
                    alert("ソラリス効果のターゲットを選んでください。");
                    gameState.awaitingSpellTarget = {
                        card: solarisOnField.card, 
                        player: 'self',
                        effect: { type: 'damage', value: 1, targetCategory: 'creature', targetOwner: 'opponent', requiresTarget: true },
                        isSolarisEffect: true 
                    };
                    updatePotentialSpellTargets();
                    solarisEffectTriggeredAndAwaitingTarget = true;
                } else {
                    alert("ソラリス効果のためのマナが足りません。");
                }
            }

            if (!solarisEffectTriggeredAndAwaitingTarget) {
                 resolveSpellEffect(playedSpell, 'self'); 
            } else {
                gameState.pendingSolarisEffect = { originalSpell: playedSpell };
                updateAllUI(); 
            }
            return; 
        }
        updateAllUI();
    }

    function handleMagicSquarePlay(cardIndexInHand, magicSquareCard) {
        const emptySlotIndex = gameState.self.field.findIndex(slot => slot === null);
        if (emptySlotIndex === -1) { alert("フィールドがいっぱいです。"); return; }
        gameState.self.hand.splice(cardIndexInHand, 1);
        gameState.graveyard.push(magicSquareCard);
        const summonableDM = gameState.self.deckMasters.find(dm => dm && dm.card && !dm.isSummoned && dm.card.canSpecialSummon && dm.currentHP > 0);
        if (!summonableDM) { alert("特殊召喚可能なデッキマスターがいません。"); updateAllUI(); return; }

        summonableDM.isSummoned = true;
        summonableDM.currentHP = summonableDM.card.hp;
        const summonedCard = { ...summonableDM.card };
        gameState.self.field[emptySlotIndex] = { card: summonedCard, currentHP: summonedCard.hp, hasAttacked: false, powerCounters: 0 };

        resolveOnSummonEffect(summonedCard, 'self', emptySlotIndex);
        checkCoreMachinaAwakening('self');
        updateAllUI();
    }

    function handleDeckMasterClick(cardId, slotIndex) {
        if (gameState.currentPlayer !== 'self' || gameState.currentPhase !== 'main' || gameState.awaitingSpellTarget || gameState.currentPhase === 'gameOver') return;

        const dmObject = gameState.self.deckMasters[slotIndex];
        if (!dmObject || !dmObject.card || dmObject.isSummoned || dmObject.currentHP <= 0) { return; }
        if (gameState.self.currentMana < dmObject.card.manaCost) { alert("マナが足りません！"); return; }

        const emptySlotIndex = gameState.self.field.findIndex(slot => slot === null);
        if (emptySlotIndex === -1) { alert("フィールドがいっぱいです！"); return; }

        gameState.self.currentMana -= dmObject.card.manaCost;
        dmObject.isSummoned = true;
        dmObject.currentHP = dmObject.card.hp;
        const summonedDMCard = { ...dmObject.card };
        gameState.self.field[emptySlotIndex] = { card: summonedDMCard, currentHP: summonedDMCard.hp, hasAttacked: false, powerCounters: 0 };

        resolveOnSummonEffect(summonedDMCard, 'self', emptySlotIndex);
        checkCoreMachinaAwakening('self');
        updateAllUI();
    }
    
  function updatePotentialAttackTargets() {
        document.querySelectorAll('.attack-target-potential').forEach(el => el.classList.remove('attack-target-potential'));
        if (gameState.currentPlayer === 'self' && gameState.currentPhase === 'attack' && gameState.selectedAttacker) {
            let opponentHasCreatures = gameState.opponent.field.some(c => c);
            gameState.opponent.field.forEach((creature, idx) => {
                if (creature) {
                    const el = document.querySelector(`.opponent-field-zone .field-slot[data-slot-index="${idx}"] .card-placeholder`);
                    if (el) el.classList.add('attack-target-potential');
                }
            });
            if (!opponentHasCreatures) {
                gameState.opponent.deckMasters.forEach((dm, idx) => {
                    if (dm && dm.card && !dm.isSummoned && dm.currentHP > 0) {
                        const el = document.querySelector(`.opponent-deck-masters-zone .deck-master-slot[data-slot-index="${idx}"] .card-placeholder`);
                        if (el) el.classList.add('attack-target-potential');
                    }
                });
            }
        }
    }
    
    function updatePotentialSpellTargets() { 
        document.querySelectorAll('.potential-spell-target').forEach(el => el.classList.remove('potential-spell-target'));
        if (!gameState.awaitingSpellTarget || !gameState.awaitingSpellTarget.effect) return;
        
        const { player: caster, effect: spellEffect } = gameState.awaitingSpellTarget;
    
        if (spellEffect.targetCategory === 'creature') {
            const targetOwnerType = spellEffect.targetOwner === 'self' ? caster : (caster === 'self' ? 'opponent' : 'self');
            gameState[targetOwnerType].field.forEach((creatureObj, index) => {
                if (creatureObj) { 
                    const slotElement = document.querySelector(`.${targetOwnerType}-field-zone .field-slot[data-slot-index="${index}"]`);
                    if (slotElement && slotElement.firstChild) {
                        slotElement.firstChild.classList.add('potential-spell-target');
                    }
                }
            });
        } else if (spellEffect.targetCategory === 'deck_master_in_zone') {
            const targetOwnerType = spellEffect.targetOwner === 'self' ? caster : (caster === 'self' ? 'opponent' : 'self');
            gameState[targetOwnerType].deckMasters.forEach((dmObject, index) => {
                if (dmObject && dmObject.card && !dmObject.isSummoned && dmObject.currentHP > 0) {
                    if (spellEffect.type === 'heal_deck_master_in_zone' && dmObject.currentHP >= dmObject.card.hp) {
                        // Don't highlight if already full HP
                    } else {
                        const slotElement = document.querySelector(`.${targetOwnerType}-deck-masters-zone .deck-master-slot[data-slot-index="${index}"]`);
                        if (slotElement && slotElement.firstChild && slotElement.firstChild.classList) { 
                            slotElement.firstChild.classList.add('potential-spell-target');
                        }
                    }
                }
            });
        }
        updateUI(); 
    }
    
    function cancelSpellTargeting() {
        if (gameState.awaitingSpellTarget) {
            gameState.awaitingSpellTarget = null;
            gameState.pendingSolarisEffect = null;
            document.querySelectorAll('.potential-spell-target').forEach(el => el.classList.remove('potential-spell-target'));
            updateUI(); 
        }
    }
    
    function handleFieldCreatureClick(cardId, slotIndex, owner) {
        if (gameState.currentPlayer !== 'self' || gameState.currentPhase === 'gameOver' || owner !== 'self') return;

        const clickedCreatureInField = gameState.self.field[slotIndex];
        if (!clickedCreatureInField || !clickedCreatureInField.card) { 
            console.warn("Clicked on an empty slot or invalid creature object in field", slotIndex);
            return;
        }

        // Solaris Activated Ability
        if (clickedCreatureInField.card.id === 'DM_E01' && gameState.currentPhase === 'main') {
            if (gameState.self.solarisAbilityUsedThisTurn) {
                alert('ソラリスの起動能力は、1ターンに1度しか使えません。'); return;
            }
            if (gameState.self.currentMana < 2) {
                alert('マナが足りません！(必要マナ: 2)'); return;
            }
            const graveyardSpells = gameState.graveyard.filter(c => c.type === 'spell');
            if (graveyardSpells.length === 0) {
                alert('墓地にスペルカードがありません。'); return;
            }
            if (confirm('ソラリスの能力を使いますか？ (コスト:2マナ)\n墓地からスペルを1枚手札に戻します。')) {
                const choiceNames = graveyardSpells.map((c, i) => `${i + 1}: ${c.name}`).join('\n');
                const choice = parseInt(prompt(`手札に戻すスペルを選んでください（数字のみ入力）：\n${choiceNames}`), 10) - 1;
                if (!isNaN(choice) && choice >= 0 && choice < graveyardSpells.length) {
                    gameState.self.currentMana -= 2;
                    gameState.self.solarisAbilityUsedThisTurn = true;
                    const chosenCard = graveyardSpells[choice];
                    gameState.graveyard.splice(gameState.graveyard.indexOf(chosenCard), 1);
                    gameState.self.hand.push(chosenCard);
                    alert(`「${chosenCard.name}」を手札に戻しました。`);
                    updateAllUI();
                }
            }
            return;
        }

        // Liche Activated Ability
        if (clickedCreatureInField.card.id === 'DM_N01' && gameState.currentPhase === 'main') {
            if (gameState.self.licheAbilityUsedThisTurn) { 
                alert('リッチェの起動能力は、1ターンに1度しか使えません。'); return;
            }
            const abilityCost = 2; 
            if (gameState.self.currentMana < abilityCost) {
                alert(`マナが足りません！(必要マナ: ${abilityCost})`); return;
            }
            const sacrificeOptions = gameState.self.field
                .map((creature, idx) => creature ? { creature, originalIndex: idx } : null)
                .filter(Boolean); 
            if (sacrificeOptions.length === 0) {
                alert('生贄にできる自分のクリーチャーがいません。'); return;
            }
            if (confirm(`《大巫女 リッチェ》の能力を使いますか？ (コスト:${abilityCost}マナ、クリーチャー1体生贄)\n墓地からコスト3以下のクリーチャー1体を場に召喚します。`)) {
                const sacrificeTargetNames = sacrificeOptions.map((opt, i) => `${i + 1}: ${opt.creature.card.name} (スロット ${opt.originalIndex})`).join('\n');
                const sacrificeChoiceInput = prompt(`生贄にする自分のクリーチャーを選んでください（数字のみ入力）：\n${sacrificeTargetNames}`);
                if (sacrificeChoiceInput === null) return; 
                const sacrificeChoiceIndex = parseInt(sacrificeChoiceInput, 10) - 1;
                if (isNaN(sacrificeChoiceIndex) || sacrificeChoiceIndex < 0 || sacrificeChoiceIndex >= sacrificeOptions.length) {
                    alert("無効な選択です（生贄）。"); return;
                }
                const sacrificeTargetObject = sacrificeOptions[sacrificeChoiceIndex].creature;
                const sacrificeTargetSlotIndex = sacrificeOptions[sacrificeChoiceIndex].originalIndex;

                const reanimateConditionCost = 3; 
                const graveyardTargets = gameState.graveyard.filter(c => c.type === 'creature' && c.manaCost <= reanimateConditionCost);
                if (graveyardTargets.length === 0) {
                    alert('墓地に蘇生可能なクリーチャーがいません。'); return;
                }
                const reanimateChoiceNames = graveyardTargets.map((c, i) => `${i + 1}: ${c.name} (コスト${c.manaCost})`).join('\n');
                const reanimateChoiceInput = prompt(`墓地から場に戻すクリーチャーを選んでください（数字のみ入力）：\n${reanimateChoiceNames}`);
                if (reanimateChoiceInput === null) return; 
                const reanimateChoiceIndex = parseInt(reanimateChoiceInput, 10) - 1;
                if (isNaN(reanimateChoiceIndex) || reanimateChoiceIndex < 0 || reanimateChoiceIndex >= graveyardTargets.length) {
                    alert("無効な選択です（蘇生対象）。"); return;
                }
                const chosenCardToReanimate = graveyardTargets[reanimateChoiceIndex];
                
                gameState.self.currentMana -= abilityCost;
                gameState.self.licheAbilityUsedThisTurn = true;
                console.log(`「${sacrificeTargetObject.card.name}」を生贄に捧げます。`);
                destroyCard(sacrificeTargetObject, sacrificeTargetSlotIndex, 'creature', 'self'); 
                const emptySlotIndexForReanimate = gameState.self.field.findIndex(slot => slot === null);
                if (emptySlotIndexForReanimate !== -1) {
                    gameState.graveyard.splice(gameState.graveyard.indexOf(chosenCardToReanimate), 1);
                    gameState.self.field[emptySlotIndexForReanimate] = { card: { ...chosenCardToReanimate }, currentHP: chosenCardToReanimate.hp, hasAttacked: false, powerCounters: 0 };
                    // alert(`リッチェの効果で「${chosenCardToReanimate.name}」を場に召喚しました！`);
                    showSummonEffect('self', emptySlotIndexForReanimate);
                    resolveOnSummonEffect(chosenCardToReanimate, 'self', emptySlotIndexForReanimate);
                    checkCoreMachinaAwakening('self');
                } else {
                    alert('クリーチャーを場に出すスペースがありませんでした。');
                }
                updateAllUI();
            }
            return; 
        }

        // Blood Ritual Priest Activated Ability
        if (clickedCreatureInField.card.id === 'C_N03' && gameState.currentPhase === 'main') {
            if (clickedCreatureInField.hasAttacked) { 
                alert('この司祭は既に行動済みです。'); return;
            }
            const otherCreaturesOnField = gameState.self.field.filter((c, index) => c && index !== slotIndex);
            if (otherCreaturesOnField.length === 0) {
                alert('生贄にできる他のクリーチャーがいません。'); return;
            }
            if (confirm('《血の儀式の司祭》の能力を使いますか？\n他のクリーチャー1体を生贄に捧げ、カードを1枚引き、DMのHPを1回復します。')) {
                const sacrificeTargetNames = otherCreaturesOnField.map((c, i) => `${i + 1}: ${c.card.name} (スロット ${gameState.self.field.indexOf(c)})`).join('\n');
                const choiceInput = prompt(`生贄にするクリーチャーを選んでください（数字のみ入力）：\n${sacrificeTargetNames}`);
                if (choiceInput === null) return; 
                const choiceIndex = parseInt(choiceInput, 10) - 1;
                if (!isNaN(choiceIndex) && choiceIndex >= 0 && choiceIndex < otherCreaturesOnField.length) {
                    const sacrificeTargetObject = otherCreaturesOnField[choiceIndex];
                    const sacrificeTargetSlotIndex = gameState.self.field.indexOf(sacrificeTargetObject);
                    console.log(`「${sacrificeTargetObject.card.name}」を生贄に捧げます。`);
                    destroyCard(sacrificeTargetObject, sacrificeTargetSlotIndex, 'creature', 'self');
                    clickedCreatureInField.hasAttacked = true; 
                    drawCardToHand('self');
                    let healedDM = false;
                    for (const dm of gameState.self.deckMasters) {
                        if (dm && dm.card && !dm.isSummoned && dm.currentHP > 0 && dm.currentHP < dm.card.hp) {
                            dm.currentHP = Math.min(dm.card.hp, dm.currentHP + 1);
                            console.log(`デッキマスター「${dm.card.name}」のHPが1回復しました。`);
                            healedDM = true;
                            break; 
                        }
                    }
                    if (!healedDM) {
                        console.log("回復対象のダメージを受けたデッキマスターがいませんでした。");
                    }
                    updateAllUI();
                } else {
                    alert("無効な選択です。");
                }
            }
            return; 
        }
    
        // Spell Targeting on own creatures
        if (gameState.awaitingSpellTarget && gameState.awaitingSpellTarget.player === 'self' &&
            gameState.awaitingSpellTarget.effect &&
            gameState.awaitingSpellTarget.effect.targetCategory === 'creature' &&
            gameState.awaitingSpellTarget.effect.targetOwner === 'self') {

            const spellToResolve = gameState.awaitingSpellTarget.card;
            const targetCreatureObject = gameState.self.field[slotIndex];
            const effectType = gameState.awaitingSpellTarget.effect.type;

            if (targetCreatureObject && effectType === "return_creature_to_hand") {
                applySpellTargetAndCleanUp(spellToResolve, targetCreatureObject, owner, slotIndex); return;
            } else if (targetCreatureObject && effectType === "heal") {
                applySpellTargetAndCleanUp(spellToResolve, targetCreatureObject, owner, slotIndex); return;
            }
        }
    
        // Attacker Selection
        if (gameState.currentPhase === 'main' || gameState.currentPhase === 'attack') {
            if (gameState.currentPhase === 'attack' && clickedCreatureInField.hasAttacked) { 
                alert("このクリーチャーは既に攻撃済みです。"); return; 
            }
            if (gameState.selectedAttacker && gameState.selectedAttacker.slotIndex === slotIndex) { 
                document.querySelector(`.self-field-zone .field-slot[data-slot-index="${slotIndex}"] .card-placeholder`)?.classList.remove('selected-attacker');
                gameState.selectedAttacker = null;
            } else { 
                if (gameState.selectedAttacker && gameState.selectedAttacker.slotIndex !== undefined && gameState.self.field[gameState.selectedAttacker.slotIndex]) { 
                    document.querySelector(`.self-field-zone .field-slot[data-slot-index="${gameState.selectedAttacker.slotIndex}"] .card-placeholder`)?.classList.remove('selected-attacker');
                }
                gameState.selectedAttacker = { card: { ...clickedCreatureInField.card }, currentHP: clickedCreatureInField.currentHP, slotIndex: slotIndex };
                document.querySelector(`.self-field-zone .field-slot[data-slot-index="${slotIndex}"] .card-placeholder`)?.classList.add('selected-attacker');
            }
            updatePotentialAttackTargets(); 
            updateUI(); 
        }
    }

    // handleTargetClickの先頭に async を追加
    async function handleTargetClick(targetCardId, targetSlotIndex, targetType, targetOwner) {
        if (gameState.currentPlayer !== 'self' || gameState.currentPhase === 'gameOver') return;

        if (gameState.awaitingSpellTarget && gameState.awaitingSpellTarget.player === 'self') {
            const spellTargetInfo = gameState.awaitingSpellTarget;
            if (spellTargetInfo.effect &&
                ((targetType === 'creature' && spellTargetInfo.effect.targetCategory === 'creature') ||
                 (targetType === 'deckMaster' && spellTargetInfo.effect.targetCategory === 'deck_master_in_zone')) &&
                spellTargetInfo.effect.targetOwner === targetOwner) {

                let targetObject = null;
                if (targetType === 'creature') targetObject = gameState[targetOwner].field[targetSlotIndex];
                else if (targetType === 'deckMaster') targetObject = gameState[targetOwner].deckMasters[targetSlotIndex];

                if (targetObject && targetObject.card) {
                    applySpellTargetAndCleanUp(spellTargetInfo.card, targetObject, targetOwner, targetSlotIndex);
                } else {
                    alert("無効なターゲットです。");
                    if(gameState.awaitingSpellTarget) gameState.awaitingSpellTarget = null;
                    document.querySelectorAll('.potential-spell-target').forEach(el => el.classList.remove('potential-spell-target'));
                }
                return;
            }
        }
        
        if (gameState.currentPhase === 'attack' && gameState.selectedAttacker && targetOwner === 'opponent') {
            const attackerState = gameState.selectedAttacker;
            let targetObject = null;

            if (targetType === 'creature') {
                targetObject = gameState.opponent.field[targetSlotIndex];
                if (!targetObject) { return; }
            } else if (targetType === 'deckMaster') {
                targetObject = gameState.opponent.deckMasters[targetSlotIndex];
                if (!targetObject || !targetObject.card || targetObject.isSummoned || targetObject.currentHP <= 0) { alert("選択できないDMです。"); return; }
                if (gameState.opponent.field.some(c => c)) { alert("相手フィールドにクリーチャーがいるためDMを攻撃できません。"); return; }
            }
            if (!targetObject) return;
            // performCombatをawaitで呼び出す
            await performCombat('self', attackerState, targetObject, targetSlotIndex, targetType, 'opponent');

            const attackerOnFieldAfterCombat = gameState.self.field[attackerState.slotIndex];
            if (attackerOnFieldAfterCombat && attackerOnFieldAfterCombat.card.id === attackerState.card.id && attackerOnFieldAfterCombat.currentHP > 0) {
                attackerOnFieldAfterCombat.hasAttacked = true;
            }
            resetAttackState();
            if (!checkGameEnd(true)) updateAllUI();
        }
    }
    
    // performCombat関数の先頭に async を追加
    async function performCombat(attackerOwner, attackerState, defenderObject, defenderSlotIndex, defenderType, defenderOwner) {
        const attackerField = gameState[attackerOwner].field;
        const attackerOnField = attackerField[attackerState.slotIndex];

        if (!attackerOnField || !attackerOnField.card || attackerOnField.currentHP <= 0) {
            if (attackerOwner === 'self') resetAttackState();
            return;
        }
        if (!defenderObject || !defenderObject.card) {
            console.warn("performCombat: Defender object is invalid.", defenderObject);
            if (attackerOwner === 'self') resetAttackState();
            return;
        }
        
        // エフェクト用の要素を特定するセレクタを定義
        const attackerSelector = `.${attackerOwner}-field-zone .field-slot[data-slot-index="${attackerState.slotIndex}"] .card-placeholder`;
        const defenderSelector = `.${defenderOwner}-${defenderType === 'creature' ? 'field' : 'deck-masters'}-zone [data-slot-index="${defenderSlotIndex}"]`;
    
        console.log("performCombat: エフェクト対象を探します。");
        console.log("攻撃者のセレクタ:", attackerSelector);
        console.log("防御側のセレクタ:", defenderSelector);
        
        const attackerElement = document.querySelector(attackerSelector);
        const defenderElement = document.querySelector(defenderSelector);
    
        showAttackEffects(attackerElement, defenderElement);
        await new Promise(r => setTimeout(r, 600)); 

        // --- ダメージ計算ロジック ---
        let finalAttackerAtk = attackerOnField.card.atk;
        if (attackerOnField.card.id === 'C_N02') {
            const creatureCardsInGraveyard = gameState.graveyard.filter(c => c.type === 'creature' || c.type === 'deck_master').length;
            finalAttackerAtk = (attackerOnField.card.atk || 0) + creatureCardsInGraveyard;
        }
        if (attackerOnField.card.id === 'DM_A01' && attackerOnField.isAwakened) {
            const coreMachinaBase = cardData.find(c=>c.id === 'DM_A01');
            if(coreMachinaBase?.onSummonEffect?.awakened_stats){
                finalAttackerAtk = coreMachinaBase.onSummonEffect.awakened_stats.atk;
            }
        }
        finalAttackerAtk += (attackerOnField.powerCounters || 0);

        let finalDefenderAtk = 0;
        if (defenderType === 'creature' && defenderObject.card) { 
            finalDefenderAtk = defenderObject.card.atk || 0;
            if (defenderObject.card.id === 'C_N02') {
                const creatureCardsInGraveyard = gameState.graveyard.filter(c => c.type === 'creature' || c.type === 'deck_master').length;
                finalDefenderAtk = (defenderObject.card.atk || 0) + creatureCardsInGraveyard;
            }
            if (defenderObject.card.id === 'DM_A01' && defenderObject.isAwakened) { 
                const coreMachinaBase = cardData.find(c=>c.id === 'DM_A01');
                if(coreMachinaBase?.onSummonEffect?.awakened_stats){
                    finalDefenderAtk = coreMachinaBase.onSummonEffect.awakened_stats.atk;
                }
            }
            finalDefenderAtk += (defenderObject.powerCounters || 0);
        }
        
        const initialDefenderHP = defenderObject.currentHP;
        const initialAttackerHP = attackerOnField.currentHP;

        defenderObject.currentHP -= finalAttackerAtk;

        if (defenderType === 'creature' && defenderObject.card) { 
            attackerOnField.currentHP -= finalDefenderAtk;
        }

        console.log(`${attackerOnField.card.name}(ATK:${finalAttackerAtk}) attacks ${defenderObject.card.name}(ATK:${finalDefenderAtk}, HP:${initialDefenderHP} -> ${defenderObject.currentHP})`);
        if(defenderType === 'creature' && defenderObject.card) {
            console.log(`${defenderObject.card.name} retaliates. ${attackerOnField.card.name}(HP:${initialAttackerHP} -> ${attackerOnField.currentHP})`);
        }

        if (defenderObject.currentHP <= 0) {
            destroyCard(defenderObject, defenderSlotIndex, defenderType, defenderOwner);
        }
        
        const currentAttackerInArray = attackerField[attackerState.slotIndex]; 
        if (currentAttackerInArray && currentAttackerInArray.currentHP <= 0) {
            destroyCard(currentAttackerInArray, attackerState.slotIndex, 'creature', attackerOwner);
        }
        updateAllUI();
    }

    function performDirectAttack(attackerOwner) {
        endGame('direct_attack', attackerOwner);
    }

    function resetAttackState() {
        if (gameState.selectedAttacker && gameState.selectedAttacker.slotIndex !== undefined && 
            gameState.self.field[gameState.selectedAttacker.slotIndex]) {
            const attackerSlotElement = document.querySelector(`.self-field-zone .field-slot[data-slot-index="${gameState.selectedAttacker.slotIndex}"] .card-placeholder`);
            if (attackerSlotElement) attackerSlotElement.classList.remove('selected-attacker');
        }
        gameState.selectedAttacker = null;
        updatePotentialAttackTargets();
    }

    function checkGameEnd(showMessages = false) {
        let gameHasEnded = false;
        if (gameState.currentPhase === 'gameOver') return true;
        if (gameState.opponent.destroyedDeckMastersCount >= MAX_DECK_MASTERS) {
            if (showMessages) endGame('deck_master_destruction', 'self');
            gameHasEnded = true;
        } else if (gameState.self.destroyedDeckMastersCount >= MAX_DECK_MASTERS) {
            if (showMessages) endGame('deck_master_destruction', 'opponent');
            gameHasEnded = true;
        }
        return gameHasEnded;
    }

    function endGame(reason, winner) {
        if (gameState.currentPhase === 'gameOver') return;
        gameState.currentPhase = 'gameOver';
        let message = `ゲーム終了！\n理由: `;
        if (reason === 'deck_master_destruction') message += 'デッキマスター全破壊';
        else if (reason === 'direct_attack') message += 'ダイレクトアタック';
        else if (reason === 'deck_out') message += 'デッキ切れ';
        else message += reason;
        message += `\n${winner === 'self' ? 'あなたの勝利！' : 'あなたの敗北！'}`;
        alert(message);
        const buttonsToDisable = [uiElements.drawButton, uiElements.attackButton, uiElements.endTurnButton];
        buttonsToDisable.forEach(btn => { if (btn) btn.disabled = true; });
        if (uiElements.resetGameButton) uiElements.resetGameButton.style.display = 'inline-block';
    }
    
    function resetGame() {
        if (uiElements.resetGameButton) {
            uiElements.resetGameButton.style.display = 'none';
        }
        initializeGame();
    }

    // --- イベントリスナー登録 ---
    if (uiElements.modalCloseButton) uiElements.modalCloseButton.addEventListener('click', closeCardDetailModal);
    if (uiElements.cardDetailModal) { uiElements.cardDetailModal.addEventListener('click', (event) => { if (event.target === uiElements.cardDetailModal) closeCardDetailModal(); });}
    if (uiElements.startGameButton) uiElements.startGameButton.addEventListener('click', () => { if (uiElements.startScreen) uiElements.startScreen.style.display = 'none'; if (uiElements.deckEditorScreen) uiElements.deckEditorScreen.style.display = 'none'; if (uiElements.rulesScreen) uiElements.rulesScreen.style.display = 'none'; if (uiElements.gameContainer) uiElements.gameContainer.style.display = 'flex'; resetGame(); });
    if (uiElements.deckEditButton) uiElements.deckEditButton.addEventListener('click', () => { if (uiElements.startScreen) uiElements.startScreen.style.display = 'none'; if (uiElements.deckEditorScreen) uiElements.deckEditorScreen.style.display = 'flex'; initializeDeckEditor(); });
    if (uiElements.viewRulesButton) uiElements.viewRulesButton.addEventListener('click', () => { if (uiElements.startScreen) uiElements.startScreen.style.display = 'none'; if (uiElements.rulesContent) uiElements.rulesContent.textContent = gameRulesText; if (uiElements.rulesScreen) uiElements.rulesScreen.style.display = 'flex'; });
    if (uiElements.closeRulesButton) uiElements.closeRulesButton.addEventListener('click', () => { if (uiElements.rulesScreen) uiElements.rulesScreen.style.display = 'none'; if (uiElements.startScreen) uiElements.startScreen.style.display = 'flex'; });
    if (uiElements.exitDeckEditorButton) uiElements.exitDeckEditorButton.addEventListener('click', () => { localStorage.setItem('editingPlayerDeck', JSON.stringify(currentEditingDeck.map(card => card.id))); alert("編集中のデッキ内容は一時保存されました。"); if (uiElements.deckEditorScreen) uiElements.deckEditorScreen.style.display = 'none'; if (uiElements.startScreen) uiElements.startScreen.style.display = 'flex'; });
    if (uiElements.clearDeckButton) uiElements.clearDeckButton.addEventListener('click', () => { if (confirm("編集中デッキと選択中デッキマスターをクリアしますか？")) { currentEditingDeck = []; currentEditingDMs = []; renderCurrentDeckDisplay(); renderCurrentDMs(); updateDeckCounts(); }});
    if (uiElements.saveDeckButton) uiElements.saveDeckButton.addEventListener('click', () => { if (currentEditingDeck.length !== MAX_DECK_SIZE) { alert(`デッキは${MAX_DECK_SIZE}枚。現在${currentEditingDeck.length}枚`); return; } if (currentEditingDMs.length !== MAX_DECK_MASTERS) { alert(`DMは${MAX_DECK_MASTERS}枚。現在${currentEditingDMs.length}枚`); return; } localStorage.setItem('playerDeck', JSON.stringify(currentEditingDeck.map(card => card.id))); localStorage.setItem('playerDeckMasters', JSON.stringify(currentEditingDMs.map(dm => dm.id))); localStorage.removeItem('editingPlayerDeck'); alert('デッキとDMを保存しました！'); if (uiElements.deckEditorScreen) uiElements.deckEditorScreen.style.display = 'none'; if (uiElements.startScreen) uiElements.startScreen.style.display = 'flex'; });
    
    if (uiElements.graveyardDisplayArea) {
        uiElements.graveyardDisplayArea.addEventListener('click', openGraveyardModal);
    } else {
        console.error("墓地表示エリア(#graveyard-display-area)が見つかりません。");
    }

    if (uiElements.graveyardModalCloseButton) {
        uiElements.graveyardModalCloseButton.addEventListener('click', closeGraveyardModal);
    } else {
        console.error("墓地モーダル閉じるボタン(#graveyard-modal-close-button)が見つかりません。");
    }

    if (uiElements.graveyardViewModal) {
        uiElements.graveyardViewModal.addEventListener('click', (event) => {
            if (event.target === uiElements.graveyardViewModal) {
                closeGraveyardModal();
            }
        });
    }
    
    if (uiElements.drawButton) { 
        uiElements.drawButton.addEventListener('click', () => { 
            if (gameState.currentPlayer !== 'self' || gameState.currentPhase !== 'draw' || gameState.currentPhase === 'gameOver') { 
                alert("今はドローできません。"); return; 
            } 
            if (drawCardToHand('self')) { 
                gameState.currentPhase = 'main'; 
            } 
            updateAllUI(); 
        }); 
    } else { console.error("ドローボタンが見つかりません。"); }

    if (uiElements.attackButton) { 
        uiElements.attackButton.addEventListener('click', () => { 
            if (gameState.currentPlayer !== 'self' || gameState.currentPhase === 'gameOver') return; 
            if (gameState.currentPhase === 'main') { 
                gameState.currentPhase = 'attack'; 
                alert("攻撃フェーズへ。攻撃する自分のクリーチャーをシングルクリックで選択してください。"); 
                cancelSpellTargeting();
                resetAttackState(); 
            } else if (gameState.currentPhase === 'attack') { 
                if (!gameState.selectedAttacker) alert("攻撃する自分のクリーチャーをシングルクリックで選択してください。"); 
                else { 
                    const opponentHasFieldCreatures = gameState.opponent.field.some(c => c);
                    const opponentHasNonSummonedDMs = gameState.opponent.deckMasters.some(dm => dm && dm.card && !dm.isSummoned && dm.currentHP > 0);
                    if (!opponentHasFieldCreatures && !opponentHasNonSummonedDMs){
                         if(confirm("相手の場はがら空きです。ダイレクトアタックしますか？")){
                             performDirectAttack('self');
                         }
                    } else {
                        alert("攻撃対象をシングルクリックで選択してください。");
                    }
                }
            } 
            updateAllUI(); 
        }); 
    } else { console.error("攻撃ボタンが見つかりません。"); }

    if (uiElements.endTurnButton) { 
        uiElements.endTurnButton.addEventListener('click', () => { 
            if (gameState.currentPlayer !== 'self' || gameState.currentPhase === 'gameOver' || checkGameEnd(true)) return; 
            resetAttackState(); 
            cancelSpellTargeting(); 
            gameState.self.field.forEach(c => { if (c) c.hasAttacked = false; });
            while (gameState.self.hand.length > 7) { 
                const discarded = gameState.self.hand.pop(); 
                gameState.graveyard.push(discarded); 
                alert(`手札が8枚以上なので「${discarded.name}」を捨てました。`);
            }
            renderHand(); 
            gameState.opponent.spellsCastThisTurn = 0; 
            gameState.opponent.solarisAbilityUsedThisTurn = false; 
            gameState.opponent.licheAbilityUsedThisTurn = false; 
            gameState.opponent.nextSpellCostReduction = 0; 
            gameState.currentPlayer = 'opponent'; 
            updateUI(); 
            setTimeout(startOpponentTurn, 1000); 
        });
    } else { console.error("ターン終了ボタンが見つかりません。"); }

    if (uiElements.resetGameButton) { 
        uiElements.resetGameButton.addEventListener('click', resetGame); 
    } else { console.error("リセットゲームボタンが見つかりません。");}

    async function startOpponentTurn() {
        if (gameState.currentPlayer !== 'opponent' || gameState.currentPhase === 'gameOver' || checkGameEnd(true)) return;

        console.log("--- 相手のターン ---");
        gameState.currentPhase = 'opponent_turn_processing';
        updateUI();

        try {
            // ドローフェーズ
            console.log("相手: ドローフェーズ");
            await new Promise(r => setTimeout(r, 800));
            if (!drawCardToHand('opponent')) {
                updateAllUI(); return;
            }
            updateAllUI();

            // マナフェーズ
            console.log("相手: マナフェーズ");
            await new Promise(r => setTimeout(r, 800));
            gameState.opponent.maxMana = Math.min(10, gameState.opponent.maxMana + 1);
            gameState.opponent.currentMana = gameState.opponent.maxMana;
            updateAllUI();

            // メインフェーズ (クリーチャー召喚試行)
            console.log("相手: メインフェーズ (クリーチャー召喚試行)");
            await new Promise(r => setTimeout(r, 1000));
            const emptyOpponentSlotsCount = gameState.opponent.field.filter(s => s === null).length;
            if (emptyOpponentSlotsCount > 0) {
                const playableCreatures = gameState.opponent.hand
                    .filter(card => card && card.type === 'creature' && gameState.opponent.currentMana >= card.manaCost)
                    .sort((a,b) => b.manaCost - a.manaCost); 

                if(playableCreatures.length > 0){
                    const cardToPlay = playableCreatures[0];
                    const cardIndexInHand = gameState.opponent.hand.findIndex(c => c.id === cardToPlay.id);
                    if (cardIndexInHand !== -1) {
                        const playedCreature = gameState.opponent.hand.splice(cardIndexInHand, 1)[0];
                        gameState.opponent.currentMana -= playedCreature.manaCost;
                        const targetSlotIndex = gameState.opponent.field.findIndex(s => s === null);
                        if (targetSlotIndex !== -1) {
                            gameState.opponent.field[targetSlotIndex] = { card: { ...playedCreature }, currentHP: playedCreature.hp, hasAttacked: false, powerCounters: 0 };
                            
                            console.log(`相手が ${playedCreature.name} を召喚。`);
                            updateAllUI(); 
                            showSummonEffect('opponent', targetSlotIndex);
                            await new Promise(r => setTimeout(r, 500)); 

                            resolveOnSummonEffect(playedCreature, 'opponent', targetSlotIndex);
                            checkCoreMachinaAwakening('opponent');
                        }
                    }
                } else {
                    console.log("相手はプレイできるクリーチャー/マナがありませんでした。");
                }
            } else {
                console.log("相手のフィールドは満杯。");
            }
            updateAllUI(); 

            // アタックフェーズ
            console.log("相手: アタックフェーズ");
            await new Promise(r => setTimeout(r, 1500));
            const availableAiAttackers = gameState.opponent.field.map((c, i) => c ? { ...c, originalIndex: i } : null).filter(c => c && !c.hasAttacked);

            for (const aiAttacker of availableAiAttackers) {
                if (checkGameEnd(true)) break;
                if (!aiAttacker || !aiAttacker.card) continue;

                let targetObject = null; let targetSlotIndex = -1; let targetType = '';
                const playerCreatures = gameState.self.field.map((c, i) => c ? { object: c, originalIndex: i, type: 'creature' } : null).filter(item => item);
                const playerDMs = gameState.self.deckMasters.map((dmObj, i) => (dmObj && dmObj.card && !dmObj.isSummoned && dmObj.currentHP > 0) ? { object: dmObj, originalIndex: i, type: 'deckMaster' } : null).filter(item => item);

                if (playerCreatures.length > 0) {
                    playerCreatures.sort((a, b) => a.object.currentHP - b.object.currentHP);
                    targetObject = playerCreatures[0].object;
                    targetSlotIndex = playerCreatures[0].originalIndex;
                    targetType = playerCreatures[0].type;
                } else if (playerDMs.length > 0) {
                    playerDMs.sort((a, b) => a.object.currentHP - b.object.currentHP);
                    targetObject = playerDMs[0].object;
                    targetSlotIndex = playerDMs[0].originalIndex;
                    targetType = playerDMs[0].type;
                }

                if (targetObject && targetObject.card) {
                    console.log(`相手の ${aiAttacker.card.name} があなたの ${targetObject.card.name} に攻撃！`);
                    const aiAttackerState = { card: aiAttacker.card, currentHP: aiAttacker.currentHP, slotIndex: aiAttacker.originalIndex };
                    await performCombat('opponent', aiAttackerState, targetObject, targetSlotIndex, targetType, 'self');

                    const attackerOnField = gameState.opponent.field[aiAttacker.originalIndex];
                    if (attackerOnField && attackerOnField.currentHP > 0) attackerOnField.hasAttacked = true;

                    updateAllUI();
                    await new Promise(r => setTimeout(r, 1200));
                    if (checkGameEnd(true)) break;
                } else {
                    const playerHasNoBlockers = !gameState.self.field.some(c => c) && !gameState.self.deckMasters.some(dm => dm && dm.card && !dm.isSummoned && dm.currentHP > 0);
                    if(playerHasNoBlockers){
                        console.log(`相手 ${aiAttacker.card.name} がダイレクトアタック！`);
                        performDirectAttack('opponent');
                        break;
                    } else {
                         console.log(`相手 ${aiAttacker.card.name} は攻撃対象なし。`);
                    }
                }
            }
            if (availableAiAttackers.length === 0) console.log("相手は攻撃できるクリーチャーがいません。");
        } catch (error) {
            console.error("相手ターン中にエラーが発生しました:", error);
        } finally {
            if (gameState.currentPhase !== 'gameOver') {
                console.log("相手: エンドフェーズ");
                await new Promise(r => setTimeout(r, 800));
                gameState.opponent.field.forEach(c => { if (c) c.hasAttacked = false; });
                while (gameState.opponent.hand.length > 7) {
                    const discarded = gameState.opponent.hand.pop();
                    gameState.graveyard.push(discarded);
                    console.log(`相手が手札上限超過で「${discarded.name}」を捨てました。`);
                }
                updateAllUI();

                if (checkGameEnd(true)) return;

                console.log("--- あなたのターン ---");
                gameState.currentPlayer = 'self';
                gameState.currentPhase = 'draw';
                gameState.turn++;
                gameState.self.spellsCastThisTurn = 0;
                gameState.self.solarisAbilityUsedThisTurn = false;
                gameState.self.licheAbilityUsedThisTurn = false; 
                gameState.self.nextSpellCostReduction = 0;
                gameState.self.maxMana = Math.min(10, gameState.self.maxMana + 1);
                gameState.self.currentMana = gameState.self.maxMana;
                updateAllUI();
            }
        }
    }

});


function resolveOnSummonEffect(card, ownerPlayerType, fieldSlotIndex) {
        if (!card.onSummonEffect) {
            return;
        }
        const effect = card.onSummonEffect;
        const playerState = gameState[ownerPlayerType];
        console.log(`召喚時効果発動: ${card.name}, 効果タイプ: ${effect.type}`);

        switch (effect.type) {
            case "scry": {
                const topCard = gameState.mainDeck[0];
                if (topCard) {
                    if (ownerPlayerType === 'self') {
                        if (confirm(`山札の一番上は「${topCard.name}」です。山札の下に送りますか？`)) {
                            gameState.mainDeck.push(gameState.mainDeck.shift());
                            alert(`「${topCard.name}」を山札の下に送りました。`);
                        } else {
                            alert(`「${topCard.name}」を山札の一番上に残しました。`);
                        }
                    } else { // opponent
                        if (Math.random() < 0.5) {
                            gameState.mainDeck.push(gameState.mainDeck.shift());
                            console.log(`AI scry: ${topCard.name} was bottomed by opponent.`);
                        } else {
                            console.log(`AI scry: ${topCard.name} was kept on top by opponent.`);
                        }
                    }
                }
                break;
            }
            case "tutor_automata": {
                const topCards = gameState.mainDeck.slice(0, effect.condition.count);
                const targets = topCards.filter(c => c.subtype === 'オートマタ' && c.manaCost <= effect.condition.cost);
                if (ownerPlayerType === 'self') {
                    if (targets.length > 0) {
                        const choiceNames = targets.map((c, i) => `${i + 1}: ${c.name}`).join('\n');
                        const choice = parseInt(prompt(`手札に加えるカードを選んでください（数字のみ入力）：\n${choiceNames}`), 10) - 1;
                        if (!isNaN(choice) && choice >= 0 && choice < targets.length) {
                            const chosenCard = targets[choice];
                            const indexInDeck = gameState.mainDeck.findIndex(deckCard => deckCard === chosenCard);
                            if (indexInDeck > -1) {
                                gameState.mainDeck.splice(indexInDeck, 1);
                                playerState.hand.push(chosenCard);
                                alert(`「${chosenCard.name}」を手札に加えました。`);
                            }
                        }
                    } else {
                        alert('対象のカードが見つかりませんでした。');
                    }
                } else { // opponent
                    if (targets.length > 0) {
                        const chosenCard = targets[0];
                        const indexInDeck = gameState.mainDeck.findIndex(deckCard => deckCard === chosenCard);
                        if (indexInDeck > -1) {
                            gameState.mainDeck.splice(indexInDeck, 1);
                            playerState.hand.push(chosenCard);
                            console.log(`AI tutor: ${chosenCard.name} added to opponent's hand.`);
                        }
                    } else {
                        console.log("AI tutor: No valid targets found for opponent.");
                    }
                }
                break;
            }
            case "summon_token": {
                const tokenData = cardData.find(c => c.id === effect.token_id);
                if (tokenData) {
                    const emptySlotIndexToken = playerState.field.findIndex(slot => slot === null);
                    if (emptySlotIndexToken !== -1) {
                        playerState.field[emptySlotIndexToken] = { card: { ...tokenData }, currentHP: tokenData.hp, hasAttacked: false, powerCounters: 0 };
                        showSummonEffect(ownerPlayerType, emptySlotIndexToken);
                    } else {
                        alert('トークンを召喚するスペースがありません！');
                    }
                }
                break;
            }
            case "awakenable_commander": {
                checkCoreMachinaAwakening(ownerPlayerType);
                break;
            }
            case "draw":
                 if (effect.targetOwner === ownerPlayerType) {
                    for (let i = 0; i < effect.value; i++) drawCardToHand(ownerPlayerType);
                }
                break;
            case "mill_and_tutor": {
                const millValue = effect.mill_value || 0;
                const tutorSubtype = effect.tutor_subtype;
                let milledCardNames = [];
                for (let i = 0; i < millValue; i++) {
                    if (gameState.mainDeck.length > 0) {
                        const milledCard = gameState.mainDeck.shift();
                        gameState.graveyard.push(milledCard);
                        milledCardNames.push(milledCard.name);
                    } else {
                        break;
                    }
                }
                if (milledCardNames.length > 0) {
                    console.log(`「${card.name}」の効果で${milledCardNames.length}枚が墓地に送られました。`);
                }
                const tutorTargetsInGraveyard = gameState.graveyard.filter(c => c.subtype === tutorSubtype);
                if (ownerPlayerType === 'self') {
                    if (tutorTargetsInGraveyard.length > 0) {
                        const choiceNames = tutorTargetsInGraveyard.map((c, i) => `${i + 1}: ${c.name}`).join('\n');
                        const choice = parseInt(prompt(`手札に加える「${tutorSubtype}」カードを墓地から選んでください（数字のみ入力）：\n${choiceNames}`), 10) - 1;
                        if (!isNaN(choice) && choice >= 0 && choice < tutorTargetsInGraveyard.length) {
                            const chosenCardToHand = tutorTargetsInGraveyard[choice];
                            const indexInGrave = gameState.graveyard.findIndex(graveCard => graveCard === chosenCardToHand);
                            if(indexInGrave > -1) {
                                gameState.graveyard.splice(indexInGrave, 1);
                                playerState.hand.push(chosenCardToHand);
                                alert(`墓地から「${chosenCardToHand.name}」を手札に加えました。`);
                            }
                        }
                    }
                } else { // opponent
                    if (tutorTargetsInGraveyard.length > 0) {
                        const chosenCardToHand = tutorTargetsInGraveyard[0];
                        const indexInGrave = gameState.graveyard.findIndex(graveCard => graveCard === chosenCardToHand);
                        if(indexInGrave > -1) {
                            gameState.graveyard.splice(indexInGrave, 1);
                            playerState.hand.push(chosenCardToHand);
                            console.log(`AI Liche tutor: ${chosenCardToHand.name} added to opponent's hand from graveyard.`);
                        }
                    }
                }
                break;
            }
            default:
                console.warn(`未対応の召喚時効果: ${effect.type}`);
        }
        updateAllUI();
    }

    function resolveSpellEffect(spellCard, casterPlayerType) {
        const playerState = gameState[casterPlayerType];
        console.log(`スペル効果発動: ${spellCard.name}, ID: ${spellCard.id}`);

        switch (spellCard.id) {
            case "S_E01": // 魔力循環
                drawCardToHand(casterPlayerType);
                playerState.nextSpellCostReduction = 1;
                break;
            case "S_E02": { // アーク・ボルト
                const boltDamage = playerState.spellsCastThisTurn > 1 ? 4 : 2;
                alert(`アーク・ボルト！[連鎖]で${boltDamage}ダメージ！対象を選んでください。`);
                gameState.awaitingSpellTarget = {
                    card: spellCard, player: casterPlayerType, calculatedValue: boltDamage,
                    effect: { type: 'damage', targetCategory: 'creature', targetOwner: 'opponent', requiresTarget: true }
                };
                updatePotentialSpellTargets();
                break;
            }
            case "S_E03": { // 叡智の奔流
                const drawCount = playerState.spellsCastThisTurn > 1 ? 3 : 2;
                alert(`叡智の奔流！[連鎖]でカードを${drawCount}枚引きます。`);
                for (let i = 0; i < drawCount; i++) drawCardToHand(casterPlayerType);
                break;
            }
            case "S_A01": { // オーバークロック命令
                console.log('オーバークロック命令のロジックは未実装です。');
                drawCardToHand(casterPlayerType);
                break;
            }
            case "S_A02":   // 再起動シークエンス
            case "S_N01": { // 禁断の蘇生術
                const effectDef = cardData.find(c => c.id === spellCard.id)?.effect;
                if (!effectDef || !effectDef.condition) {
                     console.error(`${spellCard.name}のeffect.conditionが見つかりません`); break;
                }
                const filterSubtype = spellCard.id === "S_A02" ? 'オートマタ' : undefined;
                const graveyardTargets = gameState.graveyard.filter(c => 
                    c.type === 'creature' && 
                    (filterSubtype ? c.subtype === filterSubtype : true) && 
                    c.manaCost <= effectDef.condition.cost
                );
                 if (graveyardTargets.length > 0) {
                    const choiceNames = graveyardTargets.map((c, i) => `${i + 1}: ${c.name} (コスト${c.manaCost})`).join('\n');
                    const choice = parseInt(prompt(`場に戻すカードを選んでください（数字のみ入力）：\n${choiceNames}`), 10) - 1;
                    if (!isNaN(choice) && choice >= 0 && choice < graveyardTargets.length) {
                        const chosenCard = graveyardTargets[choice];
                        const emptySlotIndex = playerState.field.findIndex(slot => slot === null);
                        if (emptySlotIndex !== -1) {
                            gameState.graveyard.splice(gameState.graveyard.indexOf(chosenCard), 1);
                            playerState.field[emptySlotIndex] = { card: { ...chosenCard }, currentHP: chosenCard.hp, hasAttacked: false, powerCounters: 0 };
                            showSummonEffect(casterPlayerType, emptySlotIndex);
                            resolveOnSummonEffect(chosenCard, casterPlayerType, emptySlotIndex);
                            checkCoreMachinaAwakening(casterPlayerType);
                        } else {
                            alert('クリーチャーを場に出すスペースがありません！');
                        }
                    }
                } else {
                    alert('墓地に対象となるカードがありません。');
                }
                break;
            }
            default: 
                const effect = spellCard.effect;
                if (!effect) {
                     console.warn(`Effect object missing for spell: ${spellCard.name} (ID: ${spellCard.id})`);
                     updateAllUI(); return;
                }
                if (!effect.requiresTarget) {
                    switch (effect.type) {
                        case "draw": if (effect.targetOwner === casterPlayerType) { for (let i = 0; i < effect.value; i++) drawCardToHand(casterPlayerType); } break;
                        case "gain_mana": if (effect.targetOwner === casterPlayerType) { playerState.currentMana = Math.min(playerState.maxMana, playerState.currentMana + effect.value); } break;
                        default: console.warn(`未対応ターゲット不要効果(default): ${effect.type} for ${spellCard.name}`);
                    }
                } else {
                    const standardTargetEffects = ["damage", "heal", "return_creature_to_hand", "heal_deck_master_in_zone"];
                    if (standardTargetEffects.includes(effect.type)) {
                        gameState.awaitingSpellTarget = { card: spellCard, player: casterPlayerType, effect: effect };
                        alert(`スペル「${spellCard.name}」(${spellCard.effectText}) の対象を選択してください。`);
                        updatePotentialSpellTargets();
                        updateAllUI(); return;
                    } else {
                        console.warn(`未対応のターゲット指定効果(default): ${effect.type} for ${spellCard.name}`);
                    }
                }
        }
        updateAllUI();
    }

    function handleTargetClick(targetCardId, targetSlotIndex, targetType, targetOwner) {
        if (gameState.currentPlayer !== 'self' || gameState.currentPhase === 'gameOver') return;

        if (gameState.awaitingSpellTarget && gameState.awaitingSpellTarget.player === 'self') {
            const spellTargetInfo = gameState.awaitingSpellTarget;
            if (spellTargetInfo.effect &&
                ((targetType === 'creature' && spellTargetInfo.effect.targetCategory === 'creature') ||
                 (targetType === 'deckMaster' && spellTargetInfo.effect.targetCategory === 'deck_master_in_zone')) &&
                spellTargetInfo.effect.targetOwner === targetOwner) {

                let targetObject = null;
                if (targetType === 'creature') targetObject = gameState[targetOwner].field[targetSlotIndex];
                else if (targetType === 'deckMaster') targetObject = gameState[targetOwner].deckMasters[targetSlotIndex];

                if (targetObject && targetObject.card) {
                    applySpellTargetAndCleanUp(spellTargetInfo.card, targetObject, targetOwner, targetSlotIndex);
                } else {
                    alert("無効なターゲットです。");
                    cancelSpellTargeting();
                }
                return;
            }
        }
        
        if (gameState.currentPhase === 'attack' && gameState.selectedAttacker && targetOwner === 'opponent') {
            const attackerState = gameState.selectedAttacker;
            let targetObject = null;

            if (targetType === 'creature') {
                targetObject = gameState.opponent.field[targetSlotIndex];
                if (!targetObject) { return; }
            } else if (targetType === 'deckMaster') {
                targetObject = gameState.opponent.deckMasters[targetSlotIndex];
                if (!targetObject || !targetObject.card || targetObject.isSummoned || targetObject.currentHP <= 0) { alert("選択できないDMです。"); return; }
                if (gameState.opponent.field.some(c => c)) { alert("相手フィールドにクリーチャーがいるためDMを攻撃できません。"); return; }
            }
            if (!targetObject) return;

            performCombat('self', attackerState, targetObject, targetSlotIndex, targetType, 'opponent');

            const attackerOnFieldAfterCombat = gameState.self.field[attackerState.slotIndex];
            if (attackerOnFieldAfterCombat && attackerOnFieldAfterCombat.card.id === attackerState.card.id && attackerOnFieldAfterCombat.currentHP > 0) {
                attackerOnFieldAfterCombat.hasAttacked = true;
            }
            resetAttackState();
            if (!checkGameEnd(true)) updateAllUI();
        }
    }
    
    async function performCombat(attackerOwner, attackerState, defenderObject, defenderSlotIndex, defenderType, defenderOwner) {
        const attackerField = gameState[attackerOwner].field;
        const attackerOnField = attackerField[attackerState.slotIndex];

        if (!attackerOnField || !attackerOnField.card || attackerOnField.currentHP <= 0) {
            if (attackerOwner === 'self') resetAttackState();
            return;
        }
        if (!defenderObject || !defenderObject.card) {
            console.warn("performCombat: Defender object is invalid.", defenderObject);
            if (attackerOwner === 'self') resetAttackState();
            return;
        }
        
        const attackerSelector = `.${attackerOwner}-field-zone .field-slot[data-slot-index="${attackerState.slotIndex}"] .card-placeholder`;
        const defenderSelector = `.${defenderOwner}-${defenderType === 'creature' ? 'field' : 'deck-masters'}-zone [data-slot-index="${defenderSlotIndex}"]`;
    
        const attackerElement = document.querySelector(attackerSelector);
        const defenderElement = document.querySelector(defenderSelector);
    
        showAttackEffects(attackerElement, defenderElement);
        await new Promise(r => setTimeout(r, 600)); 

        let finalAttackerAtk = attackerOnField.card.atk;
        if (attackerOnField.card.id === 'C_N02') {
            const creatureCardsInGraveyard = gameState.graveyard.filter(c => c.type === 'creature' || c.type === 'deck_master').length;
            finalAttackerAtk = (attackerOnField.card.atk || 0) + creatureCardsInGraveyard;
        }
        if (attackerOnField.card.id === 'DM_A01' && attackerOnField.isAwakened) {
            const coreMachinaBase = cardData.find(c=>c.id === 'DM_A01');
            if(coreMachinaBase?.onSummonEffect?.awakened_stats){
                finalAttackerAtk = coreMachinaBase.onSummonEffect.awakened_stats.atk;
            }
        }
        finalAttackerAtk += (attackerOnField.powerCounters || 0);

        let finalDefenderAtk = 0;
        if (defenderType === 'creature' && defenderObject.card) { 
            finalDefenderAtk = defenderObject.card.atk || 0;
            if (defenderObject.card.id === 'C_N02') {
                const creatureCardsInGraveyard = gameState.graveyard.filter(c => c.type === 'creature' || c.type === 'deck_master').length;
                finalDefenderAtk = (defenderObject.card.atk || 0) + creatureCardsInGraveyard;
            }
            if (defenderObject.card.id === 'DM_A01' && defenderObject.isAwakened) { 
                const coreMachinaBase = cardData.find(c=>c.id === 'DM_A01');
                if(coreMachinaBase?.onSummonEffect?.awakened_stats){
                    finalDefenderAtk = coreMachinaBase.onSummonEffect.awakened_stats.atk;
                }
            }
            finalDefenderAtk += (defenderObject.powerCounters || 0);
        }
        
        const initialDefenderHP = defenderObject.currentHP;
        const initialAttackerHP = attackerOnField.currentHP;

        defenderObject.currentHP -= finalAttackerAtk;

        if (defenderType === 'creature' && defenderObject.card) { 
            attackerOnField.currentHP -= finalDefenderAtk;
        }

        console.log(`${attackerOnField.card.name}(ATK:${finalAttackerAtk}) attacks ${defenderObject.card.name}(ATK:${finalDefenderAtk}, HP:${initialDefenderHP} -> ${defenderObject.currentHP})`);
        if(defenderType === 'creature' && defenderObject.card) {
            console.log(`${defenderObject.card.name} retaliates. ${attackerOnField.card.name}(HP:${initialAttackerHP} -> ${attackerOnField.currentHP})`);
        }

        if (defenderObject.currentHP <= 0) {
            destroyCard(defenderObject, defenderSlotIndex, defenderType, defenderOwner);
        }
        
        const currentAttackerInArray = attackerField[attackerState.slotIndex]; 
        if (currentAttackerInArray && currentAttackerInArray.currentHP <= 0) {
            destroyCard(currentAttackerInArray, attackerState.slotIndex, 'creature', attackerOwner);
        }
        updateAllUI();
    }
    
    function destroyCard(destroyedObject, slotIndex, type, owner) {
        if (!destroyedObject || !destroyedObject.card) { console.error("Destroy target is invalid", destroyedObject); return; }
        const cardToDestroyCopy = { ...destroyedObject.card }; 
        const fieldObjectCopy = { ...destroyedObject }; 
    
        gameState.graveyard.push(cardToDestroyCopy);
        console.log(`${owner}の${type}「${cardToDestroyCopy.name}」が破壊された。`);
    
        if (owner === 'self') {
            if (type === 'creature' || (type === 'deck_master' && destroyedObject.isSummoned)) {
                if (gameState.self.field[slotIndex] && gameState.self.field[slotIndex].card.id === destroyedObject.card.id) gameState.self.field[slotIndex] = null;
            } else if (type === 'deckMaster' && !destroyedObject.isSummoned) {
                if (gameState.self.deckMasters[slotIndex] && gameState.self.deckMasters[slotIndex].card.id === cardToDestroyCopy.id) {
                    gameState.self.deckMasters[slotIndex].currentHP = 0;
                    gameState.self.destroyedDeckMastersCount++;
                }
            }
        } else if (owner === 'opponent') {
            if (type === 'creature' || (type === 'deck_master' && destroyedObject.isSummoned)) {
                if (gameState.opponent.field[slotIndex] && gameState.opponent.field[slotIndex].card.id === destroyedObject.card.id) gameState.opponent.field[slotIndex] = null;
            } else if (type === 'deckMaster' && !destroyedObject.isSummoned) {
                if (gameState.opponent.deckMasters[slotIndex] && gameState.opponent.deckMasters[slotIndex].card.id === cardToDestroyCopy.id) {
                    gameState.opponent.deckMasters[slotIndex].currentHP = 0;
                    gameState.opponent.destroyedDeckMastersCount++;
                }
            }
        }
    
        if (owner === 'self' && gameState.selectedAttacker && gameState.selectedAttacker.card.id === cardToDestroyCopy.id && slotIndex === gameState.selectedAttacker.slotIndex) {
            resetAttackState();
        }
        
        if (cardToDestroyCopy.onDeathEffect) { 
            const playerStateForEffect = gameState[owner];
            console.log(`「${cardToDestroyCopy.name}」の破壊時効果を発動します: ${cardToDestroyCopy.onDeathEffect.type}`);
            switch (cardToDestroyCopy.onDeathEffect.type) {
                case "mill":
                    const millCount = cardToDestroyCopy.onDeathEffect.value || 0;
                    let actualMilledCount = 0;
                    for (let i = 0; i < millCount; i++) {
                        if (gameState.mainDeck.length > 0) {
                            const milledCard = gameState.mainDeck.shift();
                            gameState.graveyard.push(milledCard);
                            console.log(`「${cardToDestroyCopy.name}」の効果で「${milledCard.name}」が山札から墓地に送られた。`);
                            actualMilledCount++;
                        } else {
                            console.log("山札が空のため、これ以上ミルできません。");
                            break; 
                        }
                    }
                    if (actualMilledCount > 0) {
                        console.log(`「${cardToDestroyCopy.name}」の破壊時効果で山札から${actualMilledCount}枚のカードが墓地に送られました。`);
                    }
                    break;
                default:
                    console.warn(`未対応の破壊時効果タイプ: ${cardToDestroyCopy.onDeathEffect.type}`);
            }
        }
    
        checkCoreMachinaAwakening('self');
        checkCoreMachinaAwakening('opponent');
        checkGameEnd(true);
    }
    
    function performDirectAttack(attackerOwner) { endGame('direct_attack', attackerOwner); }

    function resetAttackState() {
        if (gameState.selectedAttacker && gameState.selectedAttacker.slotIndex !== undefined && 
            gameState.self.field[gameState.selectedAttacker.slotIndex]) {
            const attackerSlotElement = document.querySelector(`.self-field-zone .field-slot[data-slot-index="${gameState.selectedAttacker.slotIndex}"] .card-placeholder`);
            if (attackerSlotElement) attackerSlotElement.classList.remove('selected-attacker');
        }
        gameState.selectedAttacker = null;
        updatePotentialAttackTargets();
    }

    function checkGameEnd(showMessages = false) {
        let gameHasEnded = false;
        if (gameState.currentPhase === 'gameOver') return true;
        if (gameState.opponent.destroyedDeckMastersCount >= MAX_DECK_MASTERS) {
            if (showMessages) endGame('deck_master_destruction', 'self'); gameHasEnded = true;
        } else if (gameState.self.destroyedDeckMastersCount >= MAX_DECK_MASTERS) {
            if (showMessages) endGame('deck_master_destruction', 'opponent'); gameHasEnded = true;
        }
        return gameHasEnded;
    }

    function endGame(reason, winner) {
        if (gameState.currentPhase === 'gameOver') return;
        gameState.currentPhase = 'gameOver';
        let message = `ゲーム終了！\n理由: `;
        if (reason === 'deck_master_destruction') message += 'デッキマスター全破壊';
        else if (reason === 'direct_attack') message += 'ダイレクトアタック';
        else if (reason === 'deck_out') message += 'デッキ切れ';
        else message += reason;
        message += `\n${winner === 'self' ? 'あなたの勝利！' : 'あなたの敗北！'}`;
        alert(message);
        const buttonsToDisable = [uiElements.drawButton, uiElements.attackButton, uiElements.endTurnButton];
        buttonsToDisable.forEach(btn => { if (btn) btn.disabled = true; });
        if (uiElements.resetGameButton) uiElements.resetGameButton.style.display = 'inline-block';
    }
    
    function resetGame() {
        if (uiElements.resetGameButton) {
            uiElements.resetGameButton.style.display = 'none';
        }
        initializeGame();
    }

    // --- イベントリスナー登録 ---
    if (uiElements.modalCloseButton) uiElements.modalCloseButton.addEventListener('click', closeCardDetailModal);
    if (uiElements.cardDetailModal) { uiElements.cardDetailModal.addEventListener('click', (event) => { if (event.target === uiElements.cardDetailModal) closeCardDetailModal(); });}
    if (uiElements.startGameButton) uiElements.startGameButton.addEventListener('click', () => { if (uiElements.startScreen) uiElements.startScreen.style.display = 'none'; if (uiElements.deckEditorScreen) uiElements.deckEditorScreen.style.display = 'none'; if (uiElements.rulesScreen) uiElements.rulesScreen.style.display = 'none'; if (uiElements.gameContainer) uiElements.gameContainer.style.display = 'flex'; resetGame(); });
    if (uiElements.deckEditButton) uiElements.deckEditButton.addEventListener('click', () => { if (uiElements.startScreen) uiElements.startScreen.style.display = 'none'; if (uiElements.deckEditorScreen) uiElements.deckEditorScreen.style.display = 'flex'; initializeDeckEditor(); });
    if (uiElements.viewRulesButton) uiElements.viewRulesButton.addEventListener('click', () => { if (uiElements.startScreen) uiElements.startScreen.style.display = 'none'; if (uiElements.rulesContent) uiElements.rulesContent.textContent = gameRulesText; if (uiElements.rulesScreen) uiElements.rulesScreen.style.display = 'flex'; });
    if (uiElements.closeRulesButton) uiElements.closeRulesButton.addEventListener('click', () => { if (uiElements.rulesScreen) uiElements.rulesScreen.style.display = 'none'; if (uiElements.startScreen) uiElements.startScreen.style.display = 'flex'; });
    if (uiElements.exitDeckEditorButton) uiElements.exitDeckEditorButton.addEventListener('click', () => { localStorage.setItem('editingPlayerDeck', JSON.stringify(currentEditingDeck.map(card => card.id))); alert("編集中のデッキ内容は一時保存されました。"); if (uiElements.deckEditorScreen) uiElements.deckEditorScreen.style.display = 'none'; if (uiElements.startScreen) uiElements.startScreen.style.display = 'flex'; });
    if (uiElements.clearDeckButton) uiElements.clearDeckButton.addEventListener('click', () => { if (confirm("編集中デッキと選択中デッキマスターをクリアしますか？")) { currentEditingDeck = []; currentEditingDMs = []; renderCurrentDeckDisplay(); renderCurrentDMs(); updateDeckCounts(); }});
    if (uiElements.saveDeckButton) uiElements.saveDeckButton.addEventListener('click', () => { if (currentEditingDeck.length !== MAX_DECK_SIZE) { alert(`デッキは${MAX_DECK_SIZE}枚。現在${currentEditingDeck.length}枚`); return; } if (currentEditingDMs.length !== MAX_DECK_MASTERS) { alert(`DMは${MAX_DECK_MASTERS}枚。現在${currentEditingDMs.length}枚`); return; } localStorage.setItem('playerDeck', JSON.stringify(currentEditingDeck.map(card => card.id))); localStorage.setItem('playerDeckMasters', JSON.stringify(currentEditingDMs.map(dm => dm.id))); localStorage.removeItem('editingPlayerDeck'); alert('デッキとDMを保存しました！'); if (uiElements.deckEditorScreen) uiElements.deckEditorScreen.style.display = 'none'; if (uiElements.startScreen) uiElements.startScreen.style.display = 'flex'; });
    
    if (uiElements.graveyardDisplayArea) {
        uiElements.graveyardDisplayArea.addEventListener('click', openGraveyardModal);
    } else {
        console.error("墓地表示エリア(#graveyard-display-area)が見つかりません。");
    }

    if (uiElements.graveyardModalCloseButton) {
        uiElements.graveyardModalCloseButton.addEventListener('click', closeGraveyardModal);
    } else {
        console.error("墓地モーダル閉じるボタン(#graveyard-modal-close-button)が見つかりません。");
    }

    if (uiElements.graveyardViewModal) {
        uiElements.graveyardViewModal.addEventListener('click', (event) => {
            if (event.target === uiElements.graveyardViewModal) {
                closeGraveyardModal();
            }
        });
    }
    
    if (uiElements.drawButton) { 
        uiElements.drawButton.addEventListener('click', () => { 
            if (gameState.currentPlayer !== 'self' || gameState.currentPhase !== 'draw' || gameState.currentPhase === 'gameOver') { 
                alert("今はドローできません。"); return; 
            } 
            if (drawCardToHand('self')) { 
                gameState.currentPhase = 'main'; 
            } 
            updateAllUI(); 
        }); 
    } else { console.error("ドローボタンが見つかりません。"); }

    if (uiElements.attackButton) { 
        uiElements.attackButton.addEventListener('click', () => { 
            if (gameState.currentPlayer !== 'self' || gameState.currentPhase === 'gameOver') return; 
            if (gameState.currentPhase === 'main') { 
                gameState.currentPhase = 'attack'; 
                alert("攻撃フェーズへ。攻撃する自分のクリーチャーをシングルクリックで選択してください。"); 
                cancelSpellTargeting();
                resetAttackState(); 
            } else if (gameState.currentPhase === 'attack') { 
                if (!gameState.selectedAttacker) alert("攻撃する自分のクリーチャーをシングルクリックで選択してください。"); 
                else { 
                    const opponentHasFieldCreatures = gameState.opponent.field.some(c => c);
                    const opponentHasNonSummonedDMs = gameState.opponent.deckMasters.some(dm => dm && dm.card && !dm.isSummoned && dm.currentHP > 0);
                    if (!opponentHasFieldCreatures && !opponentHasNonSummonedDMs){
                         if(confirm("相手の場はがら空きです。ダイレクトアタックしますか？")){
                             performDirectAttack('self');
                         }
                    } else {
                        alert("攻撃対象をシングルクリックで選択してください。");
                    }
                }
            } 
            updateAllUI(); 
        }); 
    } else { console.error("攻撃ボタンが見つかりません。"); }

    if (uiElements.endTurnButton) { 
        uiElements.endTurnButton.addEventListener('click', () => { 
            if (gameState.currentPlayer !== 'self' || gameState.currentPhase === 'gameOver' || checkGameEnd(true)) return; 
            resetAttackState(); 
            cancelSpellTargeting(); 
            gameState.self.field.forEach(c => { if (c) c.hasAttacked = false; });
            while (gameState.self.hand.length > 7) { 
                const discarded = gameState.self.hand.pop(); 
                gameState.graveyard.push(discarded); 
                alert(`手札が8枚以上なので「${discarded.name}」を捨てました。`);
            }
            renderHand(); 
            gameState.opponent.spellsCastThisTurn = 0; 
            gameState.opponent.solarisAbilityUsedThisTurn = false; 
            gameState.opponent.licheAbilityUsedThisTurn = false; 
            gameState.opponent.nextSpellCostReduction = 0; 
            gameState.currentPlayer = 'opponent'; 
            updateUI(); 
            setTimeout(startOpponentTurn, 1000); 
        });
    } else { console.error("ターン終了ボタンが見つかりません。"); }

    if (uiElements.resetGameButton) { 
        uiElements.resetGameButton.addEventListener('click', resetGame); 
    } else { console.error("リセットゲームボタンが見つかりません。");}

    async function startOpponentTurn() {
        if (gameState.currentPlayer !== 'opponent' || gameState.currentPhase === 'gameOver' || checkGameEnd(true)) return;
        console.log("--- 相手のターン ---");
        gameState.currentPhase = 'opponent_turn_processing';
        updateUI();
        try {
            console.log("相手: ドローフェーズ");
            await new Promise(r => setTimeout(r, 800));
            if (!drawCardToHand('opponent')) { updateAllUI(); return; }
            updateAllUI();
            console.log("相手: マナフェーズ");
            await new Promise(r => setTimeout(r, 800));
            gameState.opponent.maxMana = Math.min(10, gameState.opponent.maxMana + 1);
            gameState.opponent.currentMana = gameState.opponent.maxMana;
            updateAllUI();
            console.log("相手: メインフェーズ (クリーチャー召喚試行)");
            await new Promise(r => setTimeout(r, 1000));
            if (gameState.opponent.field.filter(s => s === null).length > 0) {
                const playableCreatures = gameState.opponent.hand
                    .filter(card => card && card.type === 'creature' && gameState.opponent.currentMana >= card.manaCost)
                    .sort((a,b) => b.manaCost - a.manaCost); 
                if(playableCreatures.length > 0){
                    const cardToPlay = playableCreatures[0];
                    const cardIndexInHand = gameState.opponent.hand.findIndex(c => c.id === cardToPlay.id);
                    if (cardIndexInHand !== -1) {
                        const playedCreature = gameState.opponent.hand.splice(cardIndexInHand, 1)[0];
                        gameState.opponent.currentMana -= playedCreature.manaCost;
                        const targetSlotIndex = gameState.opponent.field.findIndex(s => s === null);
                        if (targetSlotIndex !== -1) {
                            gameState.opponent.field[targetSlotIndex] = { card: { ...playedCreature }, currentHP: playedCreature.hp, hasAttacked: false, powerCounters: 0 };
                            console.log(`相手が ${playedCreature.name} を召喚。`);
                            updateAllUI();
                            showSummonEffect('opponent', targetSlotIndex);
                            await new Promise(r => setTimeout(r, 500)); 
                            resolveOnSummonEffect(playedCreature, 'opponent', targetSlotIndex);
                            checkCoreMachinaAwakening('opponent');
                        }
                    }
                }
            }
            updateAllUI(); 
            console.log("相手: アタックフェーズ");
            await new Promise(r => setTimeout(r, 1500));
            const availableAiAttackers = gameState.opponent.field.map((c, i) => c ? { ...c, originalIndex: i } : null).filter(c => c && !c.hasAttacked);
            for (const aiAttacker of availableAiAttackers) {
                if (checkGameEnd(true)) break;
                if (!aiAttacker || !aiAttacker.card) continue;
                let targetObject = null; let targetSlotIndex = -1; let targetType = '';
                const playerCreatures = gameState.self.field.map((c, i) => c ? { object: c, originalIndex: i, type: 'creature' } : null).filter(item => item);
                const playerDMs = gameState.self.deckMasters.map((dmObj, i) => (dmObj && dmObj.card && !dmObj.isSummoned && dmObj.currentHP > 0) ? { object: dmObj, originalIndex: i, type: 'deckMaster' } : null).filter(item => item);
                if (playerCreatures.length > 0) {
                    playerCreatures.sort((a, b) => a.object.currentHP - b.object.currentHP);
                    targetObject = playerCreatures[0].object;
                    targetSlotIndex = playerCreatures[0].originalIndex;
                    targetType = playerCreatures[0].type;
                } else if (playerDMs.length > 0) {
                    playerDMs.sort((a, b) => a.object.currentHP - b.object.currentHP);
                    targetObject = playerDMs[0].object;
                    targetSlotIndex = playerDMs[0].originalIndex;
                    targetType = playerDMs[0].type;
                }
                if (targetObject && targetObject.card) {
                    console.log(`相手の ${aiAttacker.card.name} があなたの ${targetObject.card.name} に攻撃！`);
                    const aiAttackerState = { card: aiAttacker.card, currentHP: aiAttacker.currentHP, slotIndex: aiAttacker.originalIndex };
                    await performCombat('opponent', aiAttackerState, targetObject, targetSlotIndex, targetType, 'self');
                    const attackerOnField = gameState.opponent.field[aiAttacker.originalIndex];
                    if (attackerOnField && attackerOnField.currentHP > 0) attackerOnField.hasAttacked = true;
                    updateAllUI();
                    await new Promise(r => setTimeout(r, 1200));
                    if (checkGameEnd(true)) break;
                } else {
                    if(!gameState.self.field.some(c => c) && !gameState.self.deckMasters.some(dm => dm && dm.card && !dm.isSummoned && dm.currentHP > 0)){
                        console.log(`相手 ${aiAttacker.card.name} がダイレクトアタック！`);
                        performDirectAttack('opponent');
                        break;
                    }
                }
            }
        } catch (error) {
            console.error("相手ターン中にエラーが発生しました:", error);
        } finally {
            if (gameState.currentPhase !== 'gameOver') {
                console.log("相手: エンドフェーズ");
                await new Promise(r => setTimeout(r, 800));
                gameState.opponent.field.forEach(c => { if (c) c.hasAttacked = false; });
                while (gameState.opponent.hand.length > 7) {
                    const discarded = gameState.opponent.hand.pop();
                    gameState.graveyard.push(discarded);
                    console.log(`相手が手札上限超過で「${discarded.name}」を捨てました。`);
                }
                updateAllUI();
                if (checkGameEnd(true)) return;
                console.log("--- あなたのターン ---");
                gameState.currentPlayer = 'self';
                gameState.currentPhase = 'draw';
                gameState.turn++;
                gameState.self.spellsCastThisTurn = 0;
                gameState.self.solarisAbilityUsedThisTurn = false;
                gameState.self.licheAbilityUsedThisTurn = false; 
                gameState.self.nextSpellCostReduction = 0;
                gameState.self.maxMana = Math.min(10, gameState.self.maxMana + 1);
                gameState.self.currentMana = gameState.self.maxMana;
                updateAllUI();
            }
        }
    }

