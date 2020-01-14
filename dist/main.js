/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/main.ts");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/Alpha.json":
/*!************************!*\
  !*** ./src/Alpha.json ***!
  \************************/
/*! exports provided: imageFileName, bar, ID, cardName, cardType, monsterType, level, race, attribute, atkPoint, defPoint, default */
/***/ (function(module) {

eval("module.exports = JSON.parse(\"{\\\"imageFileName\\\":\\\"Alpha.jpg\\\",\\\"bar\\\":123,\\\"ID\\\":111,\\\"cardName\\\":\\\"Alpha\\\",\\\"cardType\\\":\\\"monster\\\",\\\"monsterType\\\":\\\"Normal\\\",\\\"level\\\":4,\\\"race\\\":\\\"ROCK\\\",\\\"attribute\\\":\\\"EARTH\\\",\\\"atkPoint\\\":1400,\\\"defPoint\\\":1700}\");\n\n//# sourceURL=webpack:///./src/Alpha.json?");

/***/ }),

/***/ "./src/Beta.json":
/*!***********************!*\
  !*** ./src/Beta.json ***!
  \***********************/
/*! exports provided: imageFileName, bar, ID, cardName, cardType, monsterType, level, race, attribute, atkPoint, defPoint, default */
/***/ (function(module) {

eval("module.exports = JSON.parse(\"{\\\"imageFileName\\\":\\\"Beta.jpg\\\",\\\"bar\\\":123,\\\"ID\\\":111,\\\"cardName\\\":\\\"Beta\\\",\\\"cardType\\\":\\\"monster\\\",\\\"monsterType\\\":\\\"Normal\\\",\\\"level\\\":4,\\\"race\\\":\\\"ROCK\\\",\\\"attribute\\\":\\\"EARTH\\\",\\\"atkPoint\\\":1400,\\\"defPoint\\\":1700}\");\n\n//# sourceURL=webpack:///./src/Beta.json?");

/***/ }),

/***/ "./src/Gumma.json":
/*!************************!*\
  !*** ./src/Gumma.json ***!
  \************************/
/*! exports provided: imageFileName, bar, ID, cardName, cardType, monsterType, level, race, attribute, atkPoint, defPoint, default */
/***/ (function(module) {

eval("module.exports = JSON.parse(\"{\\\"imageFileName\\\":\\\"Gumma.jpg\\\",\\\"bar\\\":123,\\\"ID\\\":111,\\\"cardName\\\":\\\"Gumma\\\",\\\"cardType\\\":\\\"monster\\\",\\\"monsterType\\\":\\\"Normal\\\",\\\"level\\\":4,\\\"race\\\":\\\"ROCK\\\",\\\"attribute\\\":\\\"EARTH\\\",\\\"atkPoint\\\":1400,\\\"defPoint\\\":1700}\");\n\n//# sourceURL=webpack:///./src/Gumma.json?");

/***/ }),

/***/ "./src/createButton.ts":
/*!*****************************!*\
  !*** ./src/createButton.ts ***!
  \*****************************/
/*! exports provided: createButton */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"createButton\", function() { return createButton; });\n/**\n * ボタン作成\n * @param {String} text ボタンラベル\n * @param {Number} width\n * @param {Number} height\n * @param {String} keyColor\n * @returns {createjs.Container} 参照先\n */\nfunction createButton(text, width, height, keyColor) {\n    // ボタン要素をグループ化\n    var button = new createjs.Container();\n    button.name = text; // ボタンに参考までに名称を入れておく(必須ではない)\n    button.cursor = \"pointer\"; // ホバー時にカーソルを変更する\n    // 通常時の座布団を作成\n    var bgUp = new createjs.Shape();\n    bgUp.graphics\n        .setStrokeStyle(1.0)\n        .beginStroke(keyColor)\n        .beginFill(\"white\")\n        .drawRoundRect(0.5, 0.5, width - 1.0, height - 1.0, 4);\n    button.addChild(bgUp);\n    bgUp.visible = true; // 表示する\n    // ロールオーバー時の座布団を作成\n    var bgOver = new createjs.Shape();\n    bgOver.graphics\n        .beginFill(keyColor)\n        .drawRoundRect(0, 0, width, height, 4);\n    bgOver.visible = false; // 非表示にする\n    button.addChild(bgOver);\n    // ラベルを作成\n    var label = new createjs.Text(text, \"18px sans-serif\", keyColor);\n    label.x = width / 2;\n    label.y = height / 2;\n    label.textAlign = \"center\";\n    label.textBaseline = \"middle\";\n    button.addChild(label);\n    // ロールオーバーイベントを登録\n    button.addEventListener(\"mouseover\", handleMouseOver);\n    button.addEventListener(\"mouseout\", handleMouseOut);\n    function handleMouseOver(event) {\n        bgUp.visible = false;\n        bgOver.visible = true;\n        label.color = \"white\";\n    }\n    function handleMouseOut(event) {\n        bgUp.visible = true;\n        bgOver.visible = false;\n        label.color = keyColor;\n    }\n    return button;\n}\n\n\n//# sourceURL=webpack:///./src/createButton.ts?");

/***/ }),

/***/ "./src/main.ts":
/*!*********************!*\
  !*** ./src/main.ts ***!
  \*********************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _createButton__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./createButton */ \"./src/createButton.ts\");\n/* harmony import */ var _Alpha_json__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Alpha.json */ \"./src/Alpha.json\");\nvar _Alpha_json__WEBPACK_IMPORTED_MODULE_1___namespace = /*#__PURE__*/__webpack_require__.t(/*! ./Alpha.json */ \"./src/Alpha.json\", 1);\n/* harmony import */ var _Beta_json__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./Beta.json */ \"./src/Beta.json\");\nvar _Beta_json__WEBPACK_IMPORTED_MODULE_2___namespace = /*#__PURE__*/__webpack_require__.t(/*! ./Beta.json */ \"./src/Beta.json\", 1);\n/* harmony import */ var _Gumma_json__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./Gumma.json */ \"./src/Gumma.json\");\nvar _Gumma_json__WEBPACK_IMPORTED_MODULE_3___namespace = /*#__PURE__*/__webpack_require__.t(/*! ./Gumma.json */ \"./src/Gumma.json\", 1);\nvar __extends = (undefined && undefined.__extends) || (function () {\n    var extendStatics = function (d, b) {\n        extendStatics = Object.setPrototypeOf ||\n            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||\n            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };\n        return extendStatics(d, b);\n    };\n    return function (d, b) {\n        extendStatics(d, b);\n        function __() { this.constructor = d; }\n        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());\n    };\n})();\n\n\n\n\nvar DEFAULT_LIFE = 8000;\nvar cardImgSize = { x: 122, y: 178, margin: 10 };\nvar Grid = /** @class */ (function () {\n    function Grid(front, back) {\n        this.front = front;\n        this.back = back;\n    }\n    return Grid;\n}());\nvar Game = /** @class */ (function () {\n    function Game() {\n        this.field = [];\n        this.monsterZone = [undefined, undefined, undefined, undefined, undefined];\n        this.spellOrTrapZone = [undefined, undefined, undefined, undefined, undefined];\n        this.graveYard = [];\n        this.extra = [];\n        this.hand = [];\n        this.deck = [];\n        this.myLifePoint = DEFAULT_LIFE;\n        this.enemyLifePoint = DEFAULT_LIFE;\n        this.normalSummon = true;\n        var front_position = (function () {\n            var array = [];\n            for (var i = 0; i < 7; i++) {\n                array.push([cardImgSize.x / 2 + (cardImgSize.y + cardImgSize.margin) * i, cardImgSize.y / 2 + 20]);\n            }\n            return array;\n        })();\n        var back_position = (function () {\n            var array = [];\n            for (var i = 7; i < 14; i++) {\n                array.push([cardImgSize.x / 2 + (cardImgSize.y + cardImgSize.margin) * (i - 7), cardImgSize.y * 1.5 + 40]);\n            }\n            return array;\n        })();\n        this.grid = new Grid(front_position, back_position);\n        this.displayOrder = { field: [this.grid.front[0]],\n            mon: [this.grid.front[3], this.grid.front[2], this.grid.front[4], this.grid.front[1], this.grid.front[5]],\n            gy: [this.grid.front[6]],\n            ex: [this.grid.back[0]],\n            st: [this.grid.back[3], this.grid.back[2], this.grid.back[4], this.grid.back[1], this.grid.back[5]],\n            deck: [this.grid.back[6]],\n            hand: [this.grid.front[3][0], this.grid.front[3][1] * 5]\n        };\n    }\n    return Game;\n}());\nvar Card = /** @class */ (function () {\n    function Card() {\n        this.cardBackImageFileName = \"cardback.jpeg\";\n        this.location = \"DECK\";\n    }\n    return Card;\n}());\nvar MonsterCard = /** @class */ (function (_super) {\n    __extends(MonsterCard, _super);\n    function MonsterCard() {\n        var _this = _super.call(this) || this;\n        _this.cardType = \"Monster\";\n        return _this;\n    }\n    return MonsterCard;\n}(Card));\nvar SpellCard = /** @class */ (function (_super) {\n    __extends(SpellCard, _super);\n    function SpellCard() {\n        var _this = _super.call(this) || this;\n        _this.cardType = \"Spell\";\n        return _this;\n    }\n    return SpellCard;\n}(Card));\n/**\n * jsonからカードオブジェクト生成\n */\nvar generateMonsterCard = function (json) {\n    var newCard = new MonsterCard;\n    Object.keys(json).map(function (key, index, array) {\n        newCard[key] = json[key];\n    });\n    return newCard;\n};\nwindow.onload = function () {\n    /**\n     * 指定のstageに指定のcardを指定座標で描画する\n     *\n     * @param stage ステージ\n     * @param card\n     * @param x 座標\n     * @param y 座標\n     */\n    function puton(stage, card, x, y) {\n        var _a;\n        card.imgContainer = new createjs.Container();\n        stage.addChild(card.imgContainer);\n        card.imgContainer.cursor = \"pointer\";\n        card.frontImg = new createjs.Bitmap(card.imageFileName);\n        card.imgContainer.addChild(card.frontImg);\n        card.frontImg.regX = cardImgSize.x / 2;\n        card.frontImg.regY = cardImgSize.y / 2;\n        card.frontImg.scaleX = 0;\n        card.cardBackImg = new createjs.Bitmap(card.cardBackImageFileName);\n        card.imgContainer.addChild(card.cardBackImg);\n        card.cardBackImg.regX = cardImgSize.x / 2;\n        card.cardBackImg.regY = cardImgSize.y / 2;\n        card.imgContainer.regX = -30;\n        card.imgContainer.regY = 0;\n        _a = [x, y], card.imgContainer.x = _a[0], card.imgContainer.y = _a[1];\n    }\n    /**\n     * ボードのカード置き場の枠を描画する\n     */\n    var setBoard = function () {\n        var drawzone = function (x, y, i) {\n            var zone = new createjs.Shape();\n            // 線の色\n            zone.graphics.beginStroke(\"#0055bb\");\n            // 枠を描く\n            zone.graphics.drawRect((cardImgSize.y - cardImgSize.x) / 2, 0, cardImgSize.x, cardImgSize.y);\n            if ((1 <= i && i <= 5)) {\n                zone.graphics.drawRect(0, (cardImgSize.y - cardImgSize.x) / 2, cardImgSize.y, cardImgSize.x);\n            }\n            ;\n            stage.addChild(zone);\n            zone.regX = cardImgSize.x / 2;\n            zone.regY = cardImgSize.y / 2;\n            zone.x = x;\n            zone.y = y;\n        };\n        for (var i = 0; i < 14; i++) {\n            if (i < 7) {\n                var target = game.grid.front[i];\n            }\n            else {\n                var target = game.grid.back[i - 7];\n            }\n            ;\n            drawzone(target[0], target[1], i);\n        }\n    };\n    function BoardToGY(card) {\n        if (card.cardType == \"Spell\" || \"Trap\") {\n            game.spellOrTrapZone.splice(game.spellOrTrapZone.indexOf(card), 1, undefined);\n        }\n        else {\n            if (card.cardType == \"Monster\") {\n                game.monsterZone.splice(game.monsterZone.indexOf(card), 1, undefined);\n            }\n        }\n        ;\n        game.graveYard.push(card);\n    }\n    function animationBoardToGY(card) {\n        var toX = game.displayOrder.GY[0][0];\n        var toY = game.displayOrder.GY[0][1];\n        if (card.face == \"DOWN\") {\n            createjs.Tween.get(card.imgContainer)\n                .to({ x: toX, y: toY }, 500, createjs.Ease.cubicOut);\n            createjs.Tween.get(card.imgContainer)\n                .to({ rotation: 0 }, 500, createjs.Ease.cubicOut);\n            createjs.Tween.get(card.frontImg)\n                .to({ scaleX: 0.0 }, 150);\n            createjs.Tween.get(card.cardBackImg)\n                .to({ scaleX: 1.0 }, 300);\n        }\n    }\n    var normalSummon = function (card, position) {\n        handtoMonsterzone(card, position);\n        animationHandToboard(card, position);\n        game.normalSummon = false;\n        // cardステータス NSed=true,position=position\n    };\n    function handtoMonsterzone(card, position) {\n        game.monsterZone.splice(game.monsterZone.indexOf(undefined), 1, card);\n        game.hand = game.hand.filter(function (n) { return n !== card; });\n    }\n    function animationHandToboard(card, position) {\n        var toX = game.displayOrder.mon[game.monsterZone.indexOf(card)][0];\n        var toY = game.displayOrder.mon[game.monsterZone.indexOf(card)][1];\n        if (position == \"ATK\") {\n            createjs.Tween.get(card.imgContainer)\n                .to({ x: toX, y: toY }, 500, createjs.Ease.cubicOut);\n        }\n        ;\n        if (position == \"SET\") {\n            createjs.Tween.get(card.imgContainer)\n                .to({ x: toX, y: toY }, 500, createjs.Ease.cubicOut);\n            createjs.Tween.get(card.imgContainer)\n                .to({ rotation: -90 }, 500, createjs.Ease.cubicOut);\n            createjs.Tween.get(card.frontImg)\n                .to({ scaleX: 0.0 }, 150)\n                .call(function () {\n                createjs.Tween.get(card.cardBackImg)\n                    .to({ scaleX: 1.0 }, 300);\n            });\n        }\n        ;\n        var leftEndPosition = game.displayOrder.hand[0] - (game.hand.length - 1) / 2 * (cardImgSize.x + 10);\n        game.hand.map(function (card, index, array) {\n            createjs.Tween.get(card.imgContainer)\n                .to({ x: leftEndPosition + ((cardImgSize.x + 10) * index), y: game.displayOrder.hand[1] }, 500, createjs.Ease.cubicInOut);\n        });\n    }\n    /**\n     * デッキをシャッフルする\n     */\n    function deckShuffle() {\n        if (game.deck.length <= 1) {\n            return false;\n        }\n        game.deck = shuffle(game.deck);\n        game.deck.map(function (card, index, array) {\n            var orgX = card.imgContainer.x;\n            createjs.Tween.get(card.imgContainer)\n                .wait(index * (100 / array.length))\n                .to({ x: orgX + 100 - (200 * (index % 2)) }, 100)\n                .to({ x: orgX - 100 + (200 * (index % 2)) }, 200)\n                .to({ x: game.displayOrder.deck[0][0] + index * 2, y: game.displayOrder.deck[0][1] - index * 2 }, 100)\n                .call(function () { stage.setChildIndex(card.imgContainer, stage.numChildren - array.length + index); });\n        });\n    }\n    /**\n     * デッキを場に置く\n     */\n    function deckset(stage, deck) {\n        game.deck = deck;\n        for (var i = 0, len = deck.length; i < len; ++i) {\n            puton(stage, deck[i], game.displayOrder.deck[0][0] + i * 2, game.displayOrder.deck[0][1] - i * 2);\n        }\n    }\n    /**\n     * 手札を現在のデータに合わせた位置に移動する\n     *\n     */\n    function animationToHand(count) {\n        var CardSizeX = cardImgSize.x + cardImgSize.margin;\n        var leftEndPosition = game.displayOrder.hand[0] - (game.hand.length - 1) / 2 * CardSizeX;\n        var cardFlip = function () {\n            game.hand.slice(-count).map(function (card, index, array) {\n                createjs.Tween.get(card.cardBackImg)\n                    .to({ scaleX: 0.0 }, 170, createjs.Ease.cubicOut);\n                createjs.Tween.get(card.frontImg)\n                    .to({ scaleX: 1.0 }, 340, createjs.Ease.cubicIn);\n            });\n        };\n        game.hand.map(function (card, index, array) {\n            createjs.Tween.get(card.imgContainer)\n                .to({ x: leftEndPosition + ((CardSizeX) * index), y: game.displayOrder.hand[1] }, 500, createjs.Ease.cubicInOut);\n        });\n        cardFlip();\n    }\n    /**\n     * カードを、\b\b\bデッキから手札に入れる\n     */\n    function toHandFromDeck() {\n    }\n    /**\n     * デッキから任意の枚数をドローする\n     * @param count\n     */\n    function draw(count) {\n        // デッキ残り枚数が０だったら引けない\n        if (game.deck.length < count) {\n            return false;\n        }\n        // ハンドボタン設定\n        var targetCards = game.deck.slice(-count);\n        targetCards.map(function (card, index, array) {\n            card.location = \"HAND\";\n            card.imgContainer.addEventListener(\"mouseover\", handleHandMover);\n            function handleHandMover(event) {\n                var disprayButton = [];\n                if (game.normalSummon) {\n                    disprayButton.push(NSButton);\n                    disprayButton.push(SETButton);\n                }\n                disprayButton.map(function (button, index, array) {\n                    button.x = -cardImgSize.x / 2;\n                    button.y = 40 * (array.length - 2) + 40 * (index) + 10;\n                    button.visible = true;\n                });\n            }\n            card.imgContainer.addEventListener(\"mouseout\", handleHandMout);\n            function handleHandMout(event) {\n                NSButton.visible = false;\n                SETButton.visible = false;\n            }\n            ;\n            var NSButton = Object(_createButton__WEBPACK_IMPORTED_MODULE_0__[\"createButton\"])(\"NS\", cardImgSize.x, 40, \"#0275d8\");\n            var SETButton = Object(_createButton__WEBPACK_IMPORTED_MODULE_0__[\"createButton\"])(\"SET\", cardImgSize.x, 40, \"#0275d8\");\n            card.imgContainer.addChild(NSButton);\n            card.imgContainer.addChild(SETButton);\n            NSButton.visible = false;\n            SETButton.visible = false;\n            NSButton.addEventListener(\"click\", handleNSbuttonClick);\n            function handleNSbuttonClick(event) {\n                normalSummon(card, \"ATK\");\n                card.imgContainer.removeChild(NSButton);\n                card.imgContainer.removeChild(SETButton);\n                card.imgContainer.removeEventListener(\"mouseover\", handleHandMover);\n                card.imgContainer.removeEventListener(\"mouseout\", handleHandMout);\n            }\n            ;\n            SETButton.addEventListener(\"click\", handleSETbuttonClick);\n            function handleSETbuttonClick(event) {\n                normalSummon(card, \"SET\");\n                card.imgContainer.removeChild(NSButton);\n                card.imgContainer.removeChild(SETButton);\n                card.imgContainer.removeEventListener(\"mouseover\", handleHandMover);\n                card.imgContainer.removeEventListener(\"mouseout\", handleHandMout);\n            }\n            ;\n        });\n        game.hand = game.hand.concat(targetCards);\n        game.deck = game.deck.slice(0, game.deck.length - count);\n        game.hand.map(function (h, i, a) { console.log(\"hand: \" + h.cardName); });\n        game.deck.map(function (h, i, a) { console.log(\"deck: \" + h.cardName); });\n        animationToHand(count);\n    }\n    var shuffle = function (target) {\n        var _a;\n        for (var i = target.length - 1; i >= 0; i--) {\n            var j = Math.floor(Math.random() * (i + 1));\n            _a = [target[j], target[i]], target[i] = _a[0], target[j] = _a[1];\n        }\n        return target;\n    };\n    var game = new Game;\n    var stage = new createjs.Stage(\"canv\");\n    stage.enableMouseOver();\n    setBoard();\n    var ALPHA = generateMonsterCard(_Alpha_json__WEBPACK_IMPORTED_MODULE_1__);\n    var BETA = generateMonsterCard(_Beta_json__WEBPACK_IMPORTED_MODULE_2__);\n    var GUMMA = generateMonsterCard(_Gumma_json__WEBPACK_IMPORTED_MODULE_3__);\n    var myDeck = [ALPHA, BETA, GUMMA];\n    deckset(stage, myDeck);\n    console.log(game.displayOrder.deck);\n    // const potOfGreed = new SpellCard\n    // potOfGreed.effectArray = {\n    // 1:{\"EffctType\":\"Ignnition\",\n    //     \"spellSpeed\":1,\n    //     \"range\":[\"field\"],\n    //     \"target\":undefined}\n    // }\n    // potOfGreed.effect(() => {\n    //     draw(2)    \n    // })\n    var drawButton = Object(_createButton__WEBPACK_IMPORTED_MODULE_0__[\"createButton\"])(\"draw\", 150, 40, \"#0275d8\");\n    drawButton.x = 1200;\n    drawButton.y = 450;\n    stage.addChild(drawButton);\n    drawButton.on(\"click\", function (e) {\n        draw(1);\n    }, null, false);\n    var shuffleButton = Object(_createButton__WEBPACK_IMPORTED_MODULE_0__[\"createButton\"])(\"shuffle\", 150, 40, \"#0275d8\");\n    shuffleButton.x = 1200;\n    shuffleButton.y = 500;\n    stage.addChild(shuffleButton);\n    shuffleButton.on(\"click\", function (e) {\n        deckShuffle();\n    }, null, false);\n    createjs.Ticker.addEventListener(\"tick\", handleTick);\n    function handleTick() {\n        stage.update();\n    }\n};\n\n\n//# sourceURL=webpack:///./src/main.ts?");

/***/ })

/******/ });