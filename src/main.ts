// EaselJS系の読み込み
import { Shape, Stage, Bitmap, Container, Tween, Timeline} from 'createjs-module';
import { createButton }  from './createButton';
import Alpha from './Alpha.json';
import Beta from './Beta.json';
import Gamma from './Gamma.json';
import Airman from './Airman.json';
const DEFAULT_LIFE = 8000;
const cardImgSize = {x:123,y:180,margin:10} 
const windowSize = {w:cardImgSize.x*7, h:cardImgSize.y+20}
let selectedCardImgArray = [];

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
    selectedCards : Card[];
    chainArray : effect[];
    time : Time;
    constructor(){
        this.field = [undefined];
        this.monsterZone = [undefined,undefined,undefined,undefined,undefined];
        this.spellOrTrapZone = [undefined,undefined,undefined,undefined,undefined];
        this.graveYard = [];
        this.extra = [];
        this.hand = [];
        this.deck = [];
        this.myLifePoint = DEFAULT_LIFE;
        this.enemyLifePoint= DEFAULT_LIFE;
        this.normalSummon = true;
        this.chainArray = [];
        this.time = new Time;


        const front_position: number[][] = (() => {
            const array: number[][] = [];
            for(let i = 0; i < 7 ; i++){
                array.push([cardImgSize.x/2+20+(cardImgSize.y+cardImgSize.margin)*i,cardImgSize.y/2+20]);
            }
            return array
        })();

        const back_position = (() => {
            const array: number[][] = [];
            for(let i = 7; i < 14 ; i++){
                array.push([cardImgSize.x/2+20+(cardImgSize.y+cardImgSize.margin)*(i-7),cardImgSize.y*1.5+40]);
            }
            return array
        })();

        this.grid = new Grid(front_position, back_position);

        this.displayOrder  = {
                field:[this.grid.front[0]],
                mon:[this.grid.front[3],this.grid.front[2],this.grid.front[4],this.grid.front[1],this.grid.front[5]],
                gy:[this.grid.front[6]],
                ex:[this.grid.back[0]],
                st:[this.grid.back[3],this.grid.back[2],this.grid.back[4],this.grid.back[1],this.grid.back[5]],
                deck:[this.grid.back[6]],
                hand:[this.grid.front[3][0],this.grid.front[3][1]*5]
                    };
    }
};

class Time{
    summon?:{type:"NS"|"SS";
            card:MonsterCard;
            position : "ATK"|"DEF";
        };
    spellSpeed:1|2|3
};


interface CardProps {
    frontImg : Bitmap;  cardBackImg : Bitmap;
    imageFileName : String;  cardBackImageFileName : String;
    ID : Number;
    cardName : String;
    location : "MO"|"ST"|"FIELD"|"DECK"|"HAND"|"GY"|"DD";
    fromLocation : String;
    imgContainer : Container;
    cardType : "Monster"|"Spell"|"Trap";
    face : "UP"|"DOWN" ;
    effect : effect

    monsterType : "Normal"|"Effect";
    level : Number;
    race : String;
    attribute : String;
    atkPoint : Number;
    defPoint : Number;
    position : "ATK"|"DEF";
    canNS : Boolean
    NSed : Boolean;

    spellType : "Normal"|"Quick"|"Equip"|"Field"|"Continuous";
    actionPossible : {key: boolean[]};
    effectArray : {[n: number]:{[s: string]: string|number|string[]|Card[]}}; 
};


class Card  {
    frontImg : Bitmap;  cardBackImg : Bitmap;
    imageFileName : String;  cardBackImageFileName : String;
    ID : Number;
    cardName : String;
    location : "MO"|"ST"|"FIELD"|"DECK"|"HAND"|"GY"|"DD";
    fromLocation : String;
    imgContainer : Container;
    cardType : "Monster"|"Spell"|"Trap";
    face : "UP"|"DOWN" ;
    effect : effect
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
    effectArray : {[n: number]:{[s: string]: string|number|string[]|Card[]}}; 
    constructor(){
        super();
        this.cardType = "Spell"
    };
};

class effect {
    card : Card;
    effType : string;
    spellSpeed : number;
    range : string[];
    effCondition : {};
    target : Card[];
    actionPossible :(time:Time) => boolean;
    whenActive : () => Promise<any>;
    whenResolve : () => Promise<any>;
    constructor(card:Card){
        this.card = card
        this.target = [];
    };
};


/**
 * jsonからカードオブジェクト生成
 */
const genMonsterCard = (json:Object) => {
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

        card.imgContainer.regX = 0;
        card.imgContainer.regY = 0;

        [card.imgContainer.x,card.imgContainer.y] = [x,y];
    }

    /**
     * ボードのカード置き場の枠を描画する
     */
    const setBoard = (stage:Stage) => {
        const drawzone = (x,y,i) => {
            let zone = new createjs.Shape();
            // 線の色
            zone.graphics.beginStroke("#0055bb");
            // 枠を描く
            zone.graphics.drawRect((cardImgSize.y-cardImgSize.x)/2, 0, cardImgSize.x, cardImgSize.y);
            if((1<=i && i<=5)){
                zone.graphics.drawRect(0, (cardImgSize.y-cardImgSize.x)/2, cardImgSize.y, cardImgSize.x);
            };
            stage.addChild(zone);
            zone.regX = cardImgSize.y/2;
            zone.regY = cardImgSize.y/2;
            zone.x = x;
            zone.y = y;
        };

        for(let i = 0; i < 14 ; i++){
            const target = (() => {
                if(i < 7){
                    return game.grid.front[i];
                }else{
                    return game.grid.back[i-7];
                };
            })();
            drawzone(target[0],target[1],i);
        }
    }


    /**
     * エフェクトチェック
     */
    const effectCheck = (time: Time) =>{
        let CardArray = myDeck;
        CardArray = CardArray.filter(card => "effect" in card && "actionPossible" in card.effect &&  card.effect.actionPossible(time));
        return CardArray
    };

    /**
     * カード検索
     */
    type CondetionProps = { [k in keyof CardProps]?: CardProps[k][] }
    const genCardArray = (conditions: CondetionProps)=> {
        let CardArray = myDeck
        for (let key in conditions) {
            CardArray = CardArray.filter(card => key in card && conditions[key].includes(card[key]));
        };
        return CardArray
    };

    /**
     * カードオブジェクトを場から墓地に移動
     */
    const BoardToGY = async(card: Card) => {
            const fromZone = (() => {
            if(card instanceof MonsterCard){
                return game.monsterZone;
            };
            if(card instanceof SpellCard){
                if(card.spellType=="Field"){
                    return game.field;
                }else{
                    return game.spellOrTrapZone;
                };
            }
            // TODO: Trapのことあとでかく
            return game.spellOrTrapZone;
        })();

        fromZone[fromZone.indexOf(card)]=void 0;
        game.graveYard.push(card);
        card.location = "GY";
        return;
        
    }

    /**
     * カードを場から墓地に送るアニメーション
     */
    const animationBoardToGY = (card: Card) => {
        const toX : number = game.displayOrder.gy[0][0]+(game.graveYard.length-1)*2
        const toY : number = game.displayOrder.gy[0][1]-(game.graveYard.length-1)*2
        
        return new Promise((resolve, reject) => {
            if (card.face=="DOWN"){
            cardFlip(card);
        };
            createjs.Tween.get(card.imgContainer)
                .to({x:toX,y:toY,rotation:0},500,createjs.Ease.cubicOut)
                .call(()=>{resolve()});
        });
    }

    /**
     * チェーンに乗る効果発動アニメーション
     */
    const animationChainEffectActivate = (card: Card) => {
        const effImg = new createjs.Bitmap(card.imageFileName);
        effImg.regX = cardImgSize.x/2;
        effImg.regY = cardImgSize.y/2;
        card.imgContainer.addChild(effImg);
        return new Promise((resolve, reject) => {
            createjs.Tween.get(effImg)
                    .to({scaleX:3,scaleY:3,alpha:0},500,createjs.Ease.cubicOut)
                    .call(()=>{card.imgContainer.removeChild(effImg)})
                    .call(()=>{resolve()});
        });
    }

    /**
     * 手札の魔法発動
     */
    const handSpellActivate = async(card: SpellCard) => {
        mainCanv.style.pointerEvents = "none"
        handToBoard(card);
        await animationHandToBoard(card,"ATK");
        await animationChainEffectActivate(card);
        await card.effect.whenActive();
        await card.effect.whenResolve();
        await BoardToGY(card);
        await animationBoardToGY(card);
        mainCanv.style.pointerEvents = "auto"
        return
    };

    /**
     * 場の魔法発動
     */
    const fieldSpellActivate =  async(card: SpellCard) => {
        mainCanv.style.pointerEvents = "none"
        if (card.face=="DOWN"){
            await cardFlip(card)
        };
        await animationChainEffectActivate(card);
        await card.effect.whenActive();
        await card.effect.whenResolve();
        await BoardToGY(card);
        await animationBoardToGY(card);
        mainCanv.style.pointerEvents = "auto"
        return
    };

    /**
     * 効果発動
     */
    const EffctActivate = async(card: Card) => {
        mainCanv.style.pointerEvents = "none"
        await animationChainEffectActivate(card);
        await card.effect.whenActive();
        await card.effect.whenResolve();
        mainCanv.style.pointerEvents = "auto"
        return
    };

    /**
     * 通常召喚する
     */
    const normalSummon = async(card: MonsterCard, position: "ATK"|"SET") => {
        // game.normalSummon = false;
        card.NSed=true;
        handToBoard(card);
        if(position=="ATK"){
            card.position=position;
        }else{
            card.position="DEF";
        };
        await animationHandToBoard(card,position);
        console.log("NS");
        // animationChainEffectActivate(card);

        game.time.summon = {type:"NS",
                            card:card,
                            position:card.position
                        };
        game.time.spellSpeed = 1 ;
        console.log(effectCheck(game.time));
        if (effectCheck(game.time).length > 0){
            await EffctActivate(effectCheck(game.time)[0])
        };
    };
    
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
     * カードオブジェクトを手札から場に移動
     */
    const handToBoard = async(card: Card) => {
        const targetZone = (() => {
            if(card instanceof MonsterCard){
                card.location = "MO";
                return game.monsterZone;
            };
            if (card instanceof SpellCard){
                if(card.spellType=="Field"){
                    card.location = "FIELD";
                    return game.field;
                }else{
                    card.location = "ST";
                    return game.spellOrTrapZone;
                }
            };
            // トラップあとでかく
            return game.spellOrTrapZone;
        })();
        targetZone.splice( targetZone.indexOf(undefined), 1, card);
        game.hand = game.hand.filter(n => n !== card);
        return;

    };

    /**
     * カードを手札から場に移動するアニメーション
     */
    const animationHandToBoard = (card: Card, position: "ATK"|"DEF"|"SET") => {
        return new Promise(async(resolve, reject) => {
            const toGrid = () => {
                if(card instanceof MonsterCard){
                    let toX : Number = game.displayOrder.mon[game.monsterZone.indexOf(card)][0];
                    let toY : Number = game.displayOrder.mon[game.monsterZone.indexOf(card)][1];
                    return{toX,toY};
                }
                else{
                    let toX : Number = game.displayOrder.st[game.spellOrTrapZone.indexOf(card)][0];
                    let toY : Number = game.displayOrder.st[game.spellOrTrapZone.indexOf(card)][1];
                    return{toX,toY};
                };
            };
            const {toX,toY} = toGrid();
            const TWEEN = () => {
                if(position=="ATK"){
                    return createjs.Tween.get(card.imgContainer)
                        .to({x:toX,y:toY},500,createjs.Ease.cubicOut)
                };
                if(position=="SET"){
                    if(card instanceof MonsterCard){
                        return createjs.Tween.get(card.imgContainer)
                                .call(()=>{cardFlip(card)})
                                .to({x:toX,y:toY,rotation:-90},500,createjs.Ease.cubicOut);
                    };
                    if(card instanceof SpellCard){
                        return createjs.Tween.get(card.imgContainer)
                                .call(()=>{cardFlip(card)})
                                .to({x:toX,y:toY},500,createjs.Ease.cubicOut);
                    };
                };
            };
            stage.setChildIndex(card.imgContainer,stage.numChildren-1);
            animationHandAdjust();
            console.log(position);
            TWEEN().call(()=>{resolve()})
        });
    };

    /**
     * デッキをシャッフルする
     */
    function deckShuffle(){
        if(game.deck.length <= 1) {
            return false;
        }
        game.deck = shuffle(game.deck);
        const PromiseArray :Promise<unknown>[] = [];
        game.deck.map((card, index, array) => {
            const twPromise = () => {
                return new Promise((resolve, reject) => {
                const orgX = card.imgContainer.x;
                createjs.Tween.get(card.imgContainer)
                    .wait(index*(100/array.length))
                    .to({x:orgX+100-(200*(index%2))},100)
                    .to({x:orgX-100+(200*(index%2))},200)
                    .to({x:game.displayOrder.deck[0][0]+index*1,y:game.displayOrder.deck[0][1]-index*2},100)
                    .call(()=>{stage.setChildIndex(card.imgContainer,stage.numChildren - array.length + index)})
                    .call(()=>{resolve()});                
                });
            };
            PromiseArray.push(twPromise());
        });
        return Promise.all(PromiseArray); 
    };
    

    /**
     * 配列をランダム化
     */
    const shuffle = (target:Card[]) => {
        for (let i = target.length - 1; i >= 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [target[i], target[j]] = [target[j], target[i]];
        }
        return target;
    }

    /**
     * 表裏反転
     */
    const cardFlip = (card:Card) => {
        const front = createjs.Tween.get(card.frontImg);
        const back = createjs.Tween.get(card.cardBackImg);

        const close = (target:Tween) => {
            return new Promise((resolve, reject) => {
                target.to({scaleX:0.0},180,createjs.Ease.cubicOut)
                    .call(()=>{resolve()});
            });
        };
        const open = (target:Tween) => {
            return new Promise((resolve, reject) => {
                target.to({scaleX:1.0},320,createjs.Ease.cubicIn)
                    .call(()=>{resolve()});
            });
        };

        const PromiseArray = () => {
            if(card.face=="UP"){
                card.face = "DOWN";
                return [close(front),open(back)];
            };
            if(card.face=="DOWN"){
                card.face = "UP";
                return [close(back),open(front)]
            };
        };
        return new Promise<void>(async(resolve, reject) => {
            await Promise.all(PromiseArray());
            resolve();
        });
        // return Promise.all(PromiseArray());
    };

    /**
     * デッキを場に置く
     */
    function deckset(stage: Stage, deck:Card[]){
        game.deck = deck;
        game.deck.map((card, index, array) => {
            puton(stage, card, game.displayOrder.deck[0][0]+index*1,game.displayOrder.deck[0][1]-index*1);
        })
    }

    /**
     * 手札を現在のデータに合わせた位置に移動するアニメーション
     * 手札出し入れの際に呼ぶやつ
     */
    const animationHandAdjust = () => {  
        const leftEndPosition = game.displayOrder.hand[0] - (game.hand.length - 1) / 2 * (cardImgSize.x+cardImgSize.margin)
        const PromiseArray :Promise<unknown>[] = [];
        game.hand.map((card, index, array) => {
            const twPromise = () => {
                if(card.face=="DOWN"){

                    return new Promise((resolve, reject) => {
                        createjs.Tween.get(card.imgContainer) 
                            .call(()=>{cardFlip(card)})
                            .to({x:leftEndPosition+((cardImgSize.x+cardImgSize.margin)*index),y:game.displayOrder.hand[1]},500,createjs.Ease.cubicInOut)
                            .call(()=>{resolve()});
                    });
            }else{
                return new Promise((resolve, reject) => {
                    createjs.Tween.get(card.imgContainer) 
                        .to({x:leftEndPosition+((cardImgSize.x+cardImgSize.margin)*index),y:game.displayOrder.hand[1]},500,createjs.Ease.cubicInOut)
                        .call(()=>{resolve()});
                    });
                };
            };
            PromiseArray.push(twPromise());
        });
        return Promise.all(PromiseArray);
    };
   

    /**
     * デッキから任意の枚数をドローする
     * @param count
     */
    const draw = (count: number) => {
        // デッキ残り枚数が０だったら引けない
        if(game.deck.length < count) {
            console.log("deck0");
            return ;
        };
        return new Promise<void>(async(resolve, reject) => {
            for(let i = 0; i < count ; i++){
                const targetCard = game.deck.pop();
                targetCard.location = "HAND";
                game.hand.push(targetCard);

                game.hand.map((h,i,a) =>{ console.log("hand: " + h.cardName)})
                game.deck.map((h,i,a) =>{ console.log("deck: " + h.cardName)})

                await animationHandAdjust();
                console.log("draw");
                CardInHandButtonSetting(targetCard);
            };
            resolve();
        });
    } ;

        /**
     * デッキからサーチする
     * @param count
     */
    const search = (target: Card[]) => {
        return new Promise<void>(async(resolve, reject) => {
            target.map((card, index, array) => {
                if(game.deck.includes(card)){
                    game.deck = game.deck.filter(i => i !== card);
                    game.hand.push(card);
                    card.location = "HAND";
                    console.log("search"+card.cardName);
                    CardInHandButtonSetting(card);                    
                };
            });
            await animationHandAdjust();
            await deckShuffle();
            resolve();
        });
    } 

    /**
     * 場カードボタン設定
     */
    function CardInFieldButtonSetting(card:Card){
        const ChangePositionButton = createButton("POSITION", cardImgSize.x, 40, "#0275d8");
        const FlipButton = createButton("FLIP", cardImgSize.x, 40, "#0275d8");
        const ActivateButton = createButton("ACTIVEATE", cardImgSize.x, 40, "#0275d8");
        const fieldButton = {
            "Monster":[ChangePositionButton,FlipButton,ActivateButton],
            "Spell":[ActivateButton],
            "Trap":[ActivateButton]
        };

        if(card instanceof MonsterCard){
            fieldButton.Monster.map((button, index, array) => {
                card.imgContainer.addChild(button);
                button.visible = false;
            })
        }else{
            if(card instanceof SpellCard){
                fieldButton.Spell.map((button, index, array) => {
                    card.imgContainer.addChild(button);
                    button.visible = false;
                });
            };
        };

        //Field MouseOver
        card.imgContainer.addEventListener("mouseover", handleFieldMover);
         /**
         * 条件を満たすボタンを表示
         */
        function handleFieldMover(event) {
            const disprayButton = (() => {
                const disprayButtonArray = [];
                if(card instanceof MonsterCard){
                    if(card.monsterType=="Effect"){
                        disprayButtonArray.push(ActivateButton);
                    };
                    if(card.face=="DOWN"){
                        disprayButtonArray.push(FlipButton);
                    }else{
                        disprayButtonArray.push(ChangePositionButton);
                    };
                    return disprayButtonArray;
                };
                if (card instanceof SpellCard){
                    return [ActivateButton];
                };
            });

            disprayButton().map((button, index, array) => {
                button.x = -cardImgSize.x/2;
                button.y = cardImgSize.x/2-40*(array.length) + 40*(index+1);
                button.visible = true 
            });
        };

        //Field MouseOut
        card.imgContainer.addEventListener("mouseout", handleFieldMout);
        /**
         * 全てのボタンを非表示
         */
        function handleFieldMout(event) {
            if(card instanceof MonsterCard){
                fieldButton.Monster.map((button, index, array) => {
                    button.visible = false;
                })
            }
            if(card instanceof SpellCard){
                fieldButton.Spell.map((button, index, array) => {
                    button.visible = false;
                });
            };
        };

        //Fieldボタンクリック 
        ActivateButton.addEventListener("click",handleActivatebuttonClick);
        function handleActivatebuttonClick(event) {
            if(card instanceof SpellCard){
                fieldSpellActivate(card);
                card.imgContainer.removeChild(ActivateButton);
            };
            card.imgContainer.removeAllEventListeners();
        };

        //mouseover,outイベント消去
    };
    
    /**
     * 手札カードボタン設定
     */
    function CardInHandButtonSetting(card:Card){
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
                });
            };
        };

        //Hand MouseOver
        card.imgContainer.addEventListener("mouseover", handleHandMover);
        /**
         * 条件を満たすボタンを表示
         */
        function handleHandMover(event) {
            const disprayButton = (() => {
                if(card instanceof MonsterCard){
                    if(JudgeNS(card)){
                        return [NSButton,SETButton];
                    };
                };
                if (card instanceof SpellCard){
                    return [ActivateButton,SETButton];
                };
            });

            disprayButton().map((button, index, array) => {
                button.x = -cardImgSize.x/2;
                button.y = cardImgSize.x/2-40*(array.length) + 40*(index+1);
                button.visible = true 
            });
            
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
            if(card instanceof SpellCard){
                handButton.Spell.map((button, index, array) => {
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
                card.imgContainer.removeChild(NSButton);
                card.imgContainer.removeChild(SETButton);
            };
            card.imgContainer.removeAllEventListeners();
        };

        SETButton.addEventListener("click",handleSETbuttonClick);
        function handleSETbuttonClick(event) {
            if(card instanceof MonsterCard){
                normalSummon(card,"SET");
                card.imgContainer.removeChild(NSButton);
                card.imgContainer.removeChild(SETButton);
            };
            if(card instanceof SpellCard){
                handToBoard(card)
                animationHandToBoard(card,"SET");
                card.imgContainer.removeChild(ActivateButton);
                card.imgContainer.removeChild(SETButton);
            };
            card.imgContainer.removeAllEventListeners();
            CardInFieldButtonSetting(card);
        };

        ActivateButton.addEventListener("click",handleACTbuttonClick);
        function handleACTbuttonClick(event) {
            if(card instanceof SpellCard){
                handSpellActivate(card);
                card.imgContainer.removeChild(ActivateButton);
                card.imgContainer.removeChild(SETButton);
            };
            card.imgContainer.removeAllEventListeners();
        };
    };
    
    const game = new Game;

    const mainCanv =<HTMLCanvasElement>document.getElementById("canv") ;
    const stage = new createjs.Stage(mainCanv);
    stage.enableMouseOver();

    const divSelectMenuContainer =<HTMLElement>document.getElementById("selectMenuContainer") ;

    const windowBackCanv =<HTMLCanvasElement>document.getElementById("selectMenuBack") ;
    const windowBackStage = new createjs.Stage(windowBackCanv);
    windowBackStage.enableMouseOver();
    const scrollAreaContainer =<HTMLElement>document.getElementById("scrollAreaContainer") ;

    const disprayCanv =<HTMLCanvasElement>document.getElementById("displayCanv") ;
    const disprayStage = new createjs.Stage(disprayCanv);
    disprayStage.enableMouseOver();

    setBoard(stage);

    const ALPHA = genMonsterCard(Alpha);
    const BETA = genMonsterCard(Beta);
    const GAMMA = genMonsterCard(Gamma);
    const AIRMAN = genMonsterCard(Airman);
    
    AIRMAN.effect = new effect(AIRMAN)
    AIRMAN.effect.actionPossible = (time:Time) =>{
        const boolarray = [time.summon.type=="NS",
                        time.summon.card==AIRMAN,
                        time.spellSpeed==1]
        return boolarray.every(value => value)
    };
    AIRMAN.effect.whenActive = () => {
        return new Promise((resolve, reject) => {
            const cardlist = genCardArray({race:["ROCK"]});
            openCardSelectWindow(cardlist,reinforcement,1);
            OkButton.addEventListener("click",clickOkButton);
            function clickOkButton(e) {
                divSelectMenuContainer.style.visibility = "hidden";
                disprayStage.removeAllChildren();
                resolve();
            };
        });
    };
    AIRMAN.effect.whenResolve = () => {
        return new Promise<void>(async(resolve, reject) => {
            await search(reinforcement.effect.target);
            resolve();
        });
    };


    const potOfGreed = new SpellCard
    potOfGreed.effectArray = {
    1:{"EffctType":"Ignnition",
        "spellSpeed":1,
        "range":["field"],
        "target":undefined}
    };
    potOfGreed.imageFileName = "PotOfGreed.png"
    potOfGreed.cardName = "PotOfGreed"
    potOfGreed.effect = new effect(potOfGreed);
    potOfGreed.effect.whenActive = () => {
        return new Promise<void>((resolve, reject) => {
            resolve();
        });
    };
    potOfGreed.effect.whenResolve = () => {
        return new Promise<void>(async(resolve, reject) => {
            await draw(2);
            resolve();
        });
    };
    
    const reinforcement = new SpellCard
    reinforcement.effectArray = {
    1:{"EffctType":"Ignnition",
        "spellSpeed":1,
        "range":["field"],
        "target":undefined}
    };
    
    reinforcement.imageFileName = "Reinforcement.jpg";
    reinforcement.effect = new effect(reinforcement);
    reinforcement.cardName = "Reinforcement"
    reinforcement.effect.whenActive = () => {
        return new Promise((resolve, reject) => {
            const cardlist = genCardArray({race:["ROCK"]});
            openCardSelectWindow(cardlist,reinforcement,1);
            OkButton.addEventListener("click",clickOkButton);
            function clickOkButton(e) {
                divSelectMenuContainer.style.visibility = "hidden";
                disprayStage.removeAllChildren();
                resolve();
            }
        });
    };
    reinforcement.effect.whenResolve = () => {
        return new Promise<void>(async(resolve, reject) => {
            await search(reinforcement.effect.target);
            resolve();
        });
    };

    const myDeck : Card[]= [ALPHA,BETA,GAMMA,potOfGreed,reinforcement,AIRMAN];
    deckset(stage, myDeck);
    console.log(game.deck); 
    console.log(genCardArray({race:["ROCK"]})); 

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
        windowBackStage.update();
        disprayStage.update();
    };

    const selectMenuBack = new createjs.Shape();
    selectMenuBack.graphics.beginFill("Gray"); 
    selectMenuBack.graphics.drawRect(0, 0, windowBackCanv.width, windowBackCanv.height);
    selectMenuBack.alpha = 0.5;
    windowBackStage.addChild(selectMenuBack);

    // selectMenuBack.on("click", function(e){
    //     divSelectMenuContainer.style.visibility = "hidden";
    //     disprayStage.removeAllChildren();
    // }, null, false);

    const OkButton = createButton("OK", 150, 40, "#0275d8");
    OkButton.x = windowBackCanv.width/2 - 75;
    OkButton.y = 650;
    windowBackStage.addChild(OkButton);

    scrollAreaContainer.style.width = String(windowSize.w)+"px";
    scrollAreaContainer.style.height = String(windowSize.h)+"px";

    const openCardSelectWindow = (disprayCards :Card[], activeCard :Card, count :Number) => {
        divSelectMenuContainer.style.visibility = "visible";
        activeCard.effect.target = [];
        selectedCardImgArray = [];
        OkButton.mouseEnabled = false ;

        disprayCanv.style.width = String((10+cardImgSize.x)*disprayCards.length+10)+"px";
        disprayCanv.width = (10+cardImgSize.x)*disprayCards.length+10;
        disprayCanv.style.height = String(100+cardImgSize.y)+"px";
        disprayCanv.height = 100+cardImgSize.y;

        const createLocLabelBox = (card :Card) => {
            const labelBox = new createjs.Container();
            const labelBG = new createjs.Shape();
            labelBG.graphics
                .setStrokeStyle(1)
                .beginStroke("black")
                .beginFill("white")
                .drawRoundRect(0.5, 0.5, cardImgSize.x-1, 25-1, 0);
            labelBox.addChild(labelBG);
            const label = new createjs.Text(card.location, "18px sans-serif");
            label.x = cardImgSize.x / 2;
            label.y =12.5;
            label.textAlign = "center";
            label.textBaseline = "middle";
            labelBox.addChild(label);
            return labelBox
        };
            
        const PromiseArray :Promise<unknown>[] = [];

        disprayCards.map((card, index, array) => {
            const ImgLabelContainer = new createjs.Container();
            disprayStage.addChild(ImgLabelContainer);

            const cardImgContainer = new createjs.Container();
            const cardImg = new createjs.Bitmap(card.imageFileName);
            cardImgContainer.addChild(cardImg);
            cardImgContainer.cursor = "pointer";
            cardImgContainer.y = 0;

            const selected = new createjs.Bitmap("selected.png");
            selected.setTransform (cardImgSize.x/4,cardImgSize.y/4,0.5,0.5); 
            selected.visible = false;
            cardImgContainer.addChild(selected);            

            const selectedMouseOver = new createjs.Bitmap("selectedMouseOver.png");
            selectedMouseOver.setTransform (cardImgSize.x/4,cardImgSize.y/4,0.5,0.5);      
            selectedMouseOver.alpha = 0.5;
            selectedMouseOver.visible = false;
            cardImgContainer.addChild(selectedMouseOver);

            const selectedCardImg = {imgContainer: cardImgContainer,
                                    selected: selected
            };

            cardImgContainer.addEventListener("mouseover", handleSelectMover);
            function handleSelectMover(event) {
                selectedMouseOver.visible = true;
            };
            cardImgContainer.addEventListener("mouseout", handleSelectMout);
            function handleSelectMout(event) {
                selectedMouseOver.visible = false;
            };
            cardImgContainer.addEventListener("click", handleSelectClick);
            function handleSelectClick(event) {
                if(selected.visible==false){
                    if(activeCard.effect.target.length==count){
                        selectedCardImgArray[0].selected.visible = false;
                        activeCard.effect.target.shift();
                        selectedCardImgArray.shift();
                    }
                    selected.visible = true;
                    activeCard.effect.target.push(card);
                    selectedCardImgArray.push(selectedCardImg);
                }else{
                    selected.visible = false; 
                    activeCard.effect.target = activeCard.effect.target.filter(i => i !== card);
                    selectedCardImgArray = selectedCardImgArray.filter(i => i !== selectedCardImg);
                };
                OkButton.mouseEnabled = activeCard.effect.target.length===count;
                selectedMouseOver.visible = false;
            };

            const newlabelBox = createLocLabelBox(card);
            newlabelBox.y = cardImgSize.y+10;

            ImgLabelContainer.addChild(cardImgContainer);
            ImgLabelContainer.addChild(newlabelBox);

            ImgLabelContainer.x = 10+((10+cardImgSize.x)*index);
            ImgLabelContainer.y = 10;
            ImgLabelContainer.alpha = 0

            const twPromise = () => {
                return new Promise((resolve, reject) => {
                    createjs.Tween.get(ImgLabelContainer)
                        .wait(50*(index+1))
                        .to({alpha:1},100)
                        .call(()=>{resolve()});
                        
                });
            };
            PromiseArray.push(twPromise());
        });
        
        return Promise.all(PromiseArray);
    };
}
