// EaselJS系の読み込み
import { Shape, Stage, Bitmap, Container} from 'createjs-module';
import { createButton }  from './createButton';
import Alpha from './Alpha.json';
import Beta from './Beta.json';
import Gamma from './Gamma.json';
const DEFAULT_LIFE = 8000;
const cardImgSize = {x:123,y:180,margin:10} 
// {x:122,y:178,margin:10} 

class Grid {
    front: number[][];
    back: number[][];

    constructor(front: number[][],back: number[][]) {
        this.front = front;
        this.back = back;
    }
}
class Game{
    field : Card[];
    monsterZone : Card[];
    spellOrTrapZone : Card[];
    graveYard : Card[];
    extra : Card[];
    deck : Card[];
    hand : Card[];
    myLifePoint : number;
    enemyLifePoint : number;
    normalSummon : boolean;
    grid : Grid;
    displayOrder : any;
    constructor(){
        this.field = [];
        this.monsterZone = [undefined,undefined,undefined,undefined,undefined];
        this.spellOrTrapZone = [undefined,undefined,undefined,undefined,undefined];
        this.graveYard = [];
        this.extra = [];
        this.hand = [];
        this.deck = [];
        this.myLifePoint = DEFAULT_LIFE;
        this.enemyLifePoint= DEFAULT_LIFE;
        this.normalSummon = true;


        const front_position: number[][] = (() => {
            const array: number[][] = [];
            for(let i = 0; i < 7 ; i++){
                array.push([cardImgSize.x/2+(cardImgSize.y+cardImgSize.margin)*i,cardImgSize.y/2+20]);
            }
            return array
        })();

        const back_position = (() => {
            const array: number[][] = [];
            for(let i = 7; i < 14 ; i++){
                array.push([cardImgSize.x/2+(cardImgSize.y+cardImgSize.margin)*(i-7),cardImgSize.y*1.5+40]);
            }
            return array
        })();

        this.grid = new Grid(front_position, back_position);

        this.displayOrder  = {field:[this.grid.front[0]],
                    mon:[this.grid.front[3],this.grid.front[2],this.grid.front[4],this.grid.front[1],this.grid.front[5]],
                    gy:[this.grid.front[6]],
                    ex:[this.grid.back[0]],
                    st:[this.grid.back[3],this.grid.back[2],this.grid.back[4],this.grid.back[1],this.grid.back[5]],
                    deck:[this.grid.back[6]],
                    hand:[this.grid.front[3][0],this.grid.front[3][1]*5]
                    };
    }
}

class Card {
    frontImg : Bitmap;  cardBackImg : Bitmap;
    imageFileName : String;  cardBackImageFileName : String;
    ID : Number;
    cardName : String;
    location : String;
    fromLocation : String;
    imgContainer : Container;
    cardType : "Monster"|"Spell"|"Trap";
    face : "UP"|"DOWN" ;
    constructor(){
        this.cardBackImageFileName = "cardback.jpeg";
        this.location = "DECK"
        this.face = "DOWN"
    }
}

class MonsterCard extends Card {
    monsterType : "Normal"|"Effect";
    level : Number;
    race : String;
    attribute : String;
    atkPoint : Number;
    defPoint : Number;
    position : "ATK"|"DEF";
    canNS : Boolean
    NSed : Boolean;
    actionPossible : {key: boolean[]}; 
    constructor(){
        super();
        this.cardType = "Monster";
        this.canNS = true;
    }
}

class SpellCard extends Card {
    spellType : "Normal"|"Quick"|"Equip"|"Field"|"Continuous";
    actionPossible : {key: boolean[]};
    effectArray : {[n: number]:{[s: string]: string|number|string[]}}; 
    effect : Function
    constructor(){
        super();
        this.cardType = "Spell"
        
    }
}


/**
 * jsonからカードオブジェクト生成
 */
const generateMonsterCard = (json:Object) => {
    const newCard = new MonsterCard;
    Object.keys(json).map((key, index, array) => {
        newCard[key] = json[key]
    });
    return newCard;
}

window.onload = function() {

    /**
     * 指定のstageに指定のcardを指定座標で描画する
     * 
     * @param stage ステージ
     * @param card 
     * @param x 座標
     * @param y 座標
     */
    function puton(stage:Stage, card: Card,x: number, y: number){
        card.imgContainer = new createjs.Container();
        stage.addChild(card.imgContainer);
        card.imgContainer.cursor = "pointer";

        card.frontImg = new createjs.Bitmap(card.imageFileName);
        card.imgContainer.addChild(card.frontImg)
        card.frontImg.regX = cardImgSize.x/2;
        card.frontImg.regY = cardImgSize.y/2;
        card.frontImg.scaleX = 0;

        card.cardBackImg = new createjs.Bitmap(card.cardBackImageFileName);
        card.imgContainer.addChild(card.cardBackImg)
        card.cardBackImg.regX = cardImgSize.x/2;
        card.cardBackImg.regY = cardImgSize.y/2;

        card.imgContainer.regX = -30;
        card.imgContainer.regY = 0;

        [card.imgContainer.x,card.imgContainer.y] = [x,y];
    }

    /**
     * ボードのカード置き場の枠を描画する
     */
    const setBoard = () => {
        const drawzone = (x,y,i) => {
            var zone = new createjs.Shape();
 
            // 線の色
            zone.graphics.beginStroke("#0055bb");

            // 枠を描く
            zone.graphics.drawRect((cardImgSize.y-cardImgSize.x)/2, 0, cardImgSize.x, cardImgSize.y);
            if((1<=i && i<=5)){
                zone.graphics.drawRect(0, (cardImgSize.y-cardImgSize.x)/2, cardImgSize.y, cardImgSize.x);
            };
            stage.addChild(zone);
            zone.regX = cardImgSize.x/2;
            zone.regY = cardImgSize.y/2;
            zone.x = x;
            zone.y = y;
        }

        for(let i = 0; i < 14 ; i++){
            if(i < 7){
                var target = game.grid.front[i];
            }else{
                var target = game.grid.back[i-7];
            };
            drawzone(target[0],target[1],i);
        }
    }
    /**
     * カードを場から墓地に送る
     */
    function BoardToGY(card: Card){
        if(card.cardType=="Spell"||"Trap"){
            game.spellOrTrapZone.splice( game.spellOrTrapZone.indexOf(card), 1, undefined);
        }else{
            if(card.cardType=="Monster"){
                game.monsterZone.splice( game.monsterZone.indexOf(card), 1, undefined)
            }
        };
        game.graveYard.push(card);
        animationBoardToGY(card);
    }

    /**
     * カードを場から墓地に送るアニメーション
     */
    function animationBoardToGY(card: Card){
        const toX : number = game.displayOrder.GY[0][0]+(game.graveYard.length-1)*2
        const toY : number = game.displayOrder.GY[0][1]-(game.graveYard.length-1)*2

        if (card.face=="DOWN"){
            createjs.Tween.get(card.frontImg)
            cardFlip(card);
        }
        createjs.Tween.get(card.imgContainer)
                .to({x:toX,y:toY},500,createjs.Ease.cubicOut);
        createjs.Tween.get(card.imgContainer)   
                .to({rotation:0},500,createjs.Ease.cubicOut);
    }

    /**
     * 通常召喚する
     */
    const normalSummon = (card: MonsterCard, position: "ATK"|"SET") => {
        handtoMonsterzone(card);
        animationHandToBoard(card,position);
        game.normalSummon = false;
        card.NSed=true;
        if(position="ATK"){
            card.position=position;
            card.face="UP";
        }else{
            card.position="DEF";
            card.face="DOWN";
        };
    }
    
    /**
     * 通常召喚可能か判定する
     */
    const JudgeNS = (card : MonsterCard) => {
        if(card.level<=4){
            return(game.normalSummon && card.canNS);
        }else{
            let countMonster:number = game.monsterZone.filter(i => i === undefined).length
            return(game.normalSummon && card.canNS && 0<=countMonster);
        }
    }

    /**
     * カードデータを手札からモンスターゾーンに移動
     */
    function handtoMonsterzone(card: MonsterCard){
            game.monsterZone.splice( game.monsterZone.indexOf(undefined), 1, card);
            game.hand = game.hand.filter(n => n !== card);
    }

    /**
     * カードを手札から場に移動するアニメーション
     */
    function animationHandToBoard(card: Card, position: "ATK"|"DEF"|"SET"){
        const toX : Number = game.displayOrder.mon[game.monsterZone.indexOf(card)][0]
        const toY : Number = game.displayOrder.mon[game.monsterZone.indexOf(card)][1]

        if(position=="ATK"){
            createjs.Tween.get(card.imgContainer)
                .to({x:toX,y:toY},500,createjs.Ease.cubicOut)
        };
        if(position=="SET"){
            createjs.Tween.get(card.imgContainer)
                .to({x:toX,y:toY},500,createjs.Ease.cubicOut);
            createjs.Tween.get(card.imgContainer)   
                .to({rotation:-90},500,createjs.Ease.cubicOut);
            createjs.Tween.get(card.frontImg)
                .to({scaleX:0.0},150)
                .call(()=>{createjs.Tween.get(card.cardBackImg)
                            .to({scaleX:1.0},300);})
        };

        const leftEndPosition = game.displayOrder.hand[0] - (game.hand.length - 1) / 2 * (cardImgSize.x+10)
        game.hand.map((card, index, array) => {
            createjs.Tween.get(card.imgContainer)
                    .to({x:leftEndPosition+((cardImgSize.x+10)*index),y:game.displayOrder.hand[1]},500,createjs.Ease.cubicInOut)
        });
        }

    /**
     * デッキをシャッフルする
     */
    function deckShuffle(){
        if(game.deck.length <= 1) {
            return false;
        }
        game.deck = shuffle(game.deck)

        game.deck.map((card, index, array) => {
            const orgX = card.imgContainer.x
            createjs.Tween.get(card.imgContainer)
                .wait(index*(100/array.length))
                .to({x:orgX+100-(200*(index%2))},100)
                .to({x:orgX-100+(200*(index%2))},200)
                .to({x:game.displayOrder.deck[0][0]+index*2,y:game.displayOrder.deck[0][1]-index*2},100)
                .call(()=>{stage.setChildIndex(card.imgContainer,stage.numChildren - array.length + index)})
        });
    }

    /**
     * 配列をランダム化
     */
    const shuffle = (target : Card[]) => {
        for (let i = target.length - 1; i >= 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [target[i], target[j]] = [target[j], target[i]];
        }
        return target;
    }

    /**
     * 表裏反転
     */
    const cardFlip = (card : Card) => {
        
        if(card.face=="UP"){
            createjs.Tween.get(card.frontImg)
                .to({scaleX:0.0},170,createjs.Ease.cubicOut);
            createjs.Tween.get(card.cardBackImg)
                .to({scaleX:1.0},340,createjs.Ease.cubicIn);
            card.face = "DOWN"
        }else{
            createjs.Tween.get(card.cardBackImg)
                .to({scaleX:0.0},170,createjs.Ease.cubicOut);
            createjs.Tween.get(card.frontImg)
                .to({scaleX:1.0},340,createjs.Ease.cubicIn);
            card.face = "UP"
        }
    }

    /**
     * デッキを場に置く
     */
    function deckset(stage: Stage, deck:Card[]){
        game.deck = deck;
        game.deck.map((card, index, array) => {
            puton(stage, card, game.displayOrder.deck[0][0]+index*2,game.displayOrder.deck[0][1]-index*2);
        })
    }

    /**
     * 手札を現在のデータに合わせた位置に移動するアニメーション
     */
    function animationToHand(count: number){
        const CardSizeX = cardImgSize.x+cardImgSize.margin;
        const leftEndPosition = game.displayOrder.hand[0] - (game.hand.length - 1) / 2 * CardSizeX

        game.hand.map((card, index, array) => {
            createjs.Tween.get(card.imgContainer)
                .to({x:leftEndPosition+((CardSizeX)*index),y:game.displayOrder.hand[1]},500,createjs.Ease.cubicInOut)
        });
        game.hand.slice(-count).map((card, index, array) => {
            if(card.face=="DOWN"){
                cardFlip(card);
            }
        })
    }
    

    /**
     * カードを、デッキから手札に入れる
     */
    function toHandFromDeck(){        
    }

    /**
     * デッキから任意の枚数をドローする
     * @param count
     */
    function draw(count: number){
        // デッキ残り枚数が０だったら引けない
        if(game.deck.length < count) {
            console.log("deck0");
            return false;
        }
        const targetCards = game.deck.slice(-count);
        targetCards.map((card, index, array) => {
            card.location = "HAND";
            HandButtonSetting(card);
        });
        game.hand = game.hand.concat(targetCards);
        game.deck = game.deck.slice(0, game.deck.length - count);

        animationToHand(count);

        game.hand.map((h,i,a) =>{ console.log("hand: " + h.cardName)})
        game.deck.map((h,i,a) =>{ console.log("deck: " + h.cardName)})
    } 
    
    /**
     * 手札ボタン設定
     */
    function HandButtonSetting(card:Card){
        // ボタン生成
        const NSButton = createButton("NS", cardImgSize.x, 40, "#0275d8");
        const ActivateButton = createButton("ACTIVEATE", cardImgSize.x, 40, "#0275d8");
        const SETButton = createButton("SET", cardImgSize.x, 40, "#0275d8");
        // カードタイプ毎のボタンリスト
        const handButton = {"Monster":[NSButton,SETButton],"Spell":[ActivateButton,SETButton],"Trap":[SETButton]}

        // カードイメージコンテナにボタン追加、非表示にする
        if(card instanceof MonsterCard){
            handButton.Monster.map((button, index, array) => {
                card.imgContainer.addChild(button);
                button.visible = false;
            })
        }else{
            if(card instanceof SpellCard){
                handButton.Spell.map((button, index, array) => {
                    card.imgContainer.addChild(button);
                    button.visible = false;
                })
            }
        }

        //Hand MouseOver
        card.imgContainer.addEventListener("mouseover", handleHandMover);
        /**
         * 条件を満たすボタンを表示
         */
        function handleHandMover(event) {
            let disprayButton : Container[] = [];
            if(card instanceof MonsterCard){
                if(JudgeNS(card)){
                    disprayButton.push(NSButton);
                    disprayButton.push(SETButton);
                }
                disprayButton.map((button, index, array) => {
                    button.x = -cardImgSize.x/2;
                    button.y = 40*(array.length-2) + 40*(index) + 10;
                    button.visible = true 
                });
            }
        }

        //Hand MouseOut
        card.imgContainer.addEventListener("mouseout", handleHandMout);
        /**
         * 全てのボタンを非表示
         */
        function handleHandMout(event) {
            if(card instanceof MonsterCard){
                handButton.Monster.map((button, index, array) => {
                    button.visible = false;
                })
            }
        };

        //Handボタンクリック 
        //mouseover,outイベント消去
        NSButton.addEventListener("click",handleNSbuttonClick);
        function handleNSbuttonClick(event) {
            if(card instanceof MonsterCard){
            normalSummon(card,"ATK");
            card.imgContainer.removeEventListener("mouseover", handleHandMover);
            card.imgContainer.removeEventListener("mouseout", handleHandMout);
            card.imgContainer.removeChild(NSButton);
            card.imgContainer.removeChild(SETButton);
            }
        };

        SETButton.addEventListener("click",handleSETbuttonClick);
        function handleSETbuttonClick(event) {
            if(card instanceof MonsterCard){
                normalSummon(card,"SET");
                card.imgContainer.removeEventListener("mouseover", handleHandMover);
                card.imgContainer.removeEventListener("mouseout", handleHandMout)
                card.imgContainer.removeChild(NSButton);
                card.imgContainer.removeChild(SETButton);
            }
        };

        ActivateButton.addEventListener("click",handleACTbuttonClick);
        function handleACTbuttonClick(event) {
            if(card instanceof SpellCard){
            card.effect()
            card.imgContainer.removeEventListener("mouseover", handleHandMover);
            card.imgContainer.removeEventListener("mouseout", handleHandMout);
            card.imgContainer.removeChild(ActivateButton);
            card.imgContainer.removeChild(SETButton);
            };
        };
    };

    const game = new Game;
    const stage = new createjs.Stage("canv");
    stage.enableMouseOver();

    setBoard();

    const ALPHA = generateMonsterCard(Alpha);
    const BETA = generateMonsterCard(Beta);
    const GAMMA = generateMonsterCard(Gamma);
    const myDeck : Card[]= [ALPHA,BETA,GAMMA];
    deckset(stage, myDeck);
    console.log(game.deck); 

    // const potOfGreed = new SpellCard
    // potOfGreed.effectArray = {
    // 1:{"EffctType":"Ignnition",
    //     "spellSpeed":1,
    //     "range":["field"],
    //     "target":undefined}
    // }
    // potOfGreed.effect(() => {
    //     draw(2);    
    // })

    const drawButton = createButton("draw", 150, 40, "#0275d8");
    drawButton.x = 1200;
    drawButton.y = 450;
    stage.addChild(drawButton);

    drawButton.on("click", function(e){
        draw(1);
    }, null, false);

    const shuffleButton = createButton("shuffle", 150, 40, "#0275d8");
    shuffleButton.x = 1200;
    shuffleButton.y = 500;
    stage.addChild(shuffleButton);

    shuffleButton.on("click", function(e){
        deckShuffle();
    }, null, false);

    createjs.Ticker.addEventListener("tick", handleTick);
    function handleTick() {
        stage.update();
    }
}
