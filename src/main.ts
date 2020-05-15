// EaselJS系の読み込み
import { Shape, Stage, Bitmap, Container, Tween, Timeline} from 'createjs-module';
import { createButton }  from './createButton';
import Alpha from './Alpha.json';
import Beta from './Beta.json';
import Gamma from './Gamma.json';
import Airman from './Airman.json';
import Disk from './Disk.json';
import Dogma from './Dogma.json';
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
    chain : effect[];
    timeArray : Time[];
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
        this.chain = [];
        this.timeArray = [];


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
    };
};

class Time{
    phase?:"DP"|"SP"|"M1"|"BP"|"M2"|"EP";
    summon?:{
            card : MonsterCard;
            type : "NS"|"SS";
            position : "ATK"|"DEF";
            face : "UP"|"DOWN";
            from? : "MO"|"ST"|"FIELD"|"DECK"|"HAND"|"GY"|"DD";
        };
    spellSpeed:1|2|3;
};


interface CardCondetionProps {
    frontImg : Bitmap;  cardBackImg : Bitmap;
    imageFileName : string;  cardBackImageFileName : string;
    ID : Number;
    cardName : string;
    category : string ;
    location : "MO"|"ST"|"FIELD"|"DECK"|"HAND"|"GY"|"DD";
    fromLocation : string;
    imgContainer : Container;
    cardType : "Monster"|"Spell"|"Trap";
    face : "UP"|"DOWN" ;
    effect : effect

    monsterType : "Normal"|"Effect";
    level : Number;
    race : string;
    attribute : string;
    atkPoint : Number;
    defPoint : Number;
    position : "ATK"|"DEF";
    canNS : Boolean;
    NSed : Boolean;

    spellType : "Normal"|"Quick"|"Equip"|"Field"|"Continuous";
};


class Card  {
    frontImg : Bitmap;  cardBackImg : Bitmap;
    imageFileName : string;  cardBackImageFileName : string;
    ID : Number;
    cardName : string;
    location : "MO"|"ST"|"FIELD"|"DECK"|"HAND"|"GY"|"DD";
    fromLocation : string;
    imgContainer : Container;
    cardType : "Monster"|"Spell"|"Trap";
    face : "UP"|"DOWN" ;
    effect : effect[];
    
    category : string ;
    constructor(){
        this.cardBackImageFileName = "cardback.jpeg";
        this.location = "DECK"
        this.face = "DOWN"
        this.effect = [];
    };
};

class MonsterCard extends Card {
    monsterType : "Normal"|"Effect";
    level : Number;
    race : string;
    attribute : string;
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
    };
};

class SpellCard extends Card {
    spellType : "Normal"|"Quick"|"Equip"|"Field"|"Continuous";
    actionPossible : {key: boolean[]};
    constructor(){
        super();
        this.cardType = "Spell"
    };
};

class effect {
    card : Card;
    effType : "CardActived"|"Ignition"|"Trigger"|"Continuous"|"Quick";
    spellSpeed : 1|2|3;
    range : string[];
    whetherToActivate : "Any"|"Forced";
    costCard : Card[];
    targetCard : Card[];
    actionPossible :(time:Time) => boolean;
    whenActive : (eff?: effect) => Promise<any>;
    whenResolve : (eff?: effect) => Promise<any>;
    constructor(card:Card){
        this.card = card;
        this.targetCard = [];
        this.costCard = [];
    };
};

function timeout(ms: number): Promise<void> {
    return new Promise<void>(resolve => setTimeout(resolve, ms));
}

/**
 * jsonからカードオブジェクト生成
 */
const genMonsterCard = (json:Object) => {
    const newCard = new MonsterCard;
    Object.keys(json).map((key, index, array) => {
        newCard[key] = json[key]
    });
    return newCard;
};

/**
 * 公開 非公開領域判定
 */
const publicOrPrivate = (card:Card)=>{
    const PublicArea = ["MO","ST","FIELD","GY","DD"]
    if (PublicArea.includes(card.location)){
        return "Public"
    }else{
        return "Private"
    };
};

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
    };

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
        };
    };

    const TriggerQuickeEffect = async() =>{
        mainCanv.style.pointerEvents = "none";

        const canActiveEffects =(EffArray:effect[],time:Time[])=>{
            return EffArray.filter(eff => 
                time.map(t => eff.actionPossible(t))
                .includes(true)
            );
        };

        do{
            const AllTrigger = (()=>{
                const tmpTriggerArray :effect[] = [];
                [...myDeck].map((card,index,array)=>{
                    tmpTriggerArray.push(
                        ...(
                            card.effect.filter(eff => 
                            eff.effType == "Trigger" )
                        )
                    );
                });
                return tmpTriggerArray
            })();

            const　TriggerObj = (() => { 
                const TriggerPublicForced = AllTrigger.filter(eff => 
                    eff.whetherToActivate == "Forced" &&
                    publicOrPrivate(eff.card) == "Public"
                );
                const TriggerPublicAny = AllTrigger.filter(eff => 
                    eff.whetherToActivate == "Any" &&
                    publicOrPrivate(eff.card) == "Public"
                );
                const TriggerPrivateForced = AllTrigger.filter(eff => 
                    eff.whetherToActivate == "Forced" &&
                    publicOrPrivate(eff.card) == "Private"
                );
                const TriggerPrivateAny = AllTrigger.filter(eff => 
                    eff.whetherToActivate == "Any" &&
                    publicOrPrivate(eff.card) == "Private"
                );
                
                return {
                    "PublicForced":TriggerPublicForced,
                    "PublicAny":TriggerPublicAny,
                    "PrivateForced":TriggerPrivateForced,
                    "PrivateAny":TriggerPrivateAny
                };
            })();

            const tmpCard = new Card
            const tmpEff = new effect(tmpCard)
            const selectCardPromise = (effArray:effect[]) => {
            return new Promise<Card>((resolve, reject) => {
                    const cardlist = effArray.flatMap(eff => eff.card)
                    openCardListWindow.select(cardlist,1,tmpEff);
                    SelectOkButton.addEventListener("click",clickOkButton);
                    function clickOkButton(e) {
                        divSelectMenuContainer.style.visibility = "hidden";
                        disprayStage.removeAllChildren();
                        resolve(tmpEff.targetCard.pop());
                    };
                });
            };

            const TriggerTime = [...game.timeArray];
            game.timeArray = [];

            do{
                const PubForced = canActiveEffects(TriggerObj.PublicForced,TriggerTime);
                if(PubForced.length >1){
                    const activeEffOrg = (await selectCardPromise(PubForced)).effect.filter(eff => 
                        eff.effType == "Trigger" && canActiveEffects([eff],TriggerTime) ).pop();
                    const result :effect = {...activeEffOrg,targetCard:[],costCard:[]};
                    await animationChainEffectActivate(result.card);
                    await result.whenActive(result);
                    game.chain.push(result);
                    TriggerObj.PublicForced = TriggerObj.PublicForced.filter(eff => 
                        eff !== activeEffOrg );
                }else if(PubForced.length ==1){
                    const activeEffOrg = PubForced.pop()
                    const result :effect = {...activeEffOrg,targetCard:[],costCard:[]};
                    await animationChainEffectActivate(result.card);
                    await result.whenActive(result);
                    game.chain.push(result);
                    TriggerObj.PublicForced = TriggerObj.PublicForced.filter(eff => 
                        eff !== activeEffOrg );
                };
            }while(canActiveEffects(TriggerObj.PublicForced,TriggerTime).length > 0);

            do{
                const PubAny = canActiveEffects(TriggerObj.PublicAny,TriggerTime);
                if(PubAny.length >1){
                    const activeEffOrg = (await selectCardPromise(PubAny)).effect.filter(eff => 
                        eff.effType == "Trigger" && canActiveEffects([eff],TriggerTime) ).pop();
                    const result :effect = {...activeEffOrg,targetCard:[],costCard:[]};
                    await animationChainEffectActivate(result.card);
                    await result.whenActive(result);
                    console.log(result.card.cardName + " Effect")
                    game.chain.push(result);
                    TriggerObj.PublicAny = TriggerObj.PublicAny.filter(eff => 
                        eff !== activeEffOrg );
                }else if(PubAny.length ==1){
                    const activeEffOrg = PubAny.pop()
                    if(await(OpenYesNoWindow(activeEffOrg.card.cardName + "の効果を発動しますか？"))){
                        const result :effect = {...activeEffOrg,targetCard:[],costCard:[]};
                        await animationChainEffectActivate(result.card);
                        await result.whenActive(result);
                        console.log(result.card.cardName + " Effect")
                        game.chain.push(result);
                    };
                   
                    TriggerObj.PublicAny = TriggerObj.PublicAny.filter(eff => 
                        eff !== activeEffOrg );
                };
            }while(canActiveEffects(TriggerObj.PublicAny,TriggerTime).length > 0);

            if(game.chain.length==0){
            console.log("NO TriggerEffect")
            }else{
                await (async () => {
                    for(let eff of game.chain.reverse()) {
                        await eff.whenResolve(eff);
                    };
                })();
                await (async () => {
                    for(let eff of game.chain){
                        if(eff.card instanceof SpellCard && (eff.card.spellType=="Normal"||eff.card.spellType=="Quick")){
                            await BoardToGY(eff.card);
                            await animationBoardToGY(eff.card); 
                        };
                    };
                })();
                game.chain = [];
            };


        }while(game.timeArray.length != 0);

        mainCanv.style.pointerEvents = "auto";
    };

    /**
     * カード検索
     */
    type CondetionProps = { [k in keyof CardCondetionProps]?: CardCondetionProps[k][] }
    const genCardArray = (conditions: CondetionProps)=> {
        let CardArray = [...myDeck]
        for (let key in conditions) {
            CardArray = CardArray.filter(card => key in card && conditions[key].includes(card[key]));
        };
        return CardArray
    };


    /**
     * カードを手札から墓地に送る
     */
    const HandToGY = (target: Card[]) => {
        const PromiseArray :Promise<unknown>[] = [];
        target.map((card, index, array) => {
            const twPromise = () => {
                return new Promise((resolve, reject) => {
                    game.graveYard.push(card);
                    game.hand = game.hand.filter(n => n !== card); 
                    card.location = "GY";
                    const toX : number = game.displayOrder.gy[0][0]+(game.graveYard.length-1)*2
                    const toY : number = game.displayOrder.gy[0][1]-(game.graveYard.length-1)*2
                    createjs.Tween.get(card.imgContainer)
                        .call(()=>{stage.setChildIndex(card.imgContainer,stage.numChildren-1)})
                        .to({x:toX,y:toY,rotation:0},500,createjs.Ease.cubicOut)
                        .call(()=>{resolve()});
                });
            };
            PromiseArray.push(twPromise());
        });
        return Promise.all(PromiseArray);
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
        
    };

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
                .call(()=>{stage.setChildIndex(card.imgContainer,stage.numChildren-1)})
                .to({x:toX,y:toY,rotation:0},500,createjs.Ease.cubicOut)
                .call(()=>{resolve()});
        });
    };

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
    };

    /**
     * 手札の魔法発動
     */
    const handSpellActivate = async(card: SpellCard) => {
        mainCanv.style.pointerEvents = "none"
        const Effect = card.effect.find(Eff => Eff.effType == "CardActived")
        const ActivedEffect = {...Effect,targetCard:[],costCard:[]}
        await handToBoard(card);
        await animationHandToBoard(card,"ATK");
        await animationChainEffectActivate(card);
        await ActivedEffect.whenActive(ActivedEffect);
        game.chain.push(ActivedEffect);
        await TriggerQuickeEffect();
        mainCanv.style.pointerEvents = "auto"
        return
    };

    /**
     * 場の魔法発動
     */
    const fieldSpellActivate =  async(card: SpellCard) => {
        mainCanv.style.pointerEvents = "none"
        const ActivedEffect = card.effect.find(Eff => Eff.effType == "CardActived")
        if (card.face=="DOWN"){
            await cardFlip(card)
        };
        await animationChainEffectActivate(card);
        await ActivedEffect.whenActive();
        await ActivedEffect.whenResolve();
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
        const ActivedEffect = card.effect.find(Eff => Eff.effType == "CardActived")
        await animationChainEffectActivate(card);
        await ActivedEffect.whenActive();
        await ActivedEffect.whenResolve();
        mainCanv.style.pointerEvents = "auto"
        return
    };

    /**
     * 特殊召喚する
     */
    const SpecialSummon = {
        fromGY: async(card: MonsterCard, position: "ATK"|"DEF") => {
            await GyToBoard(card);
            await animationGyToBoard(card,position);
            card.position=position;
            console.log("SS "+ card.cardName + " fromGY " + position);
            console.log("location " + card.location);

            const now = new Time;
            now.summon = {
                type: "SS",
                card: card,
                position: card.position,
                face: card.face,
                from: "GY"
            };
            now.spellSpeed = 1;            
    
            console.log(now);
            game.timeArray.push(now)
            if(game.chain.length==0){
                await TriggerQuickeEffect()
                game.timeArray.map(time=>console.log(time))
            };
            
        },
    };

    /**
     * 通常召喚する
     */
    const normalSummon = async(card: MonsterCard, position: "ATK"|"SET") => {
        // game.normalSummon = false;
        card.NSed=true;
        await handToBoard(card);
        if(position=="ATK"){
            card.position=position;
        };
        if(position=="SET"){
            card.position="DEF";
        };

        await animationHandToBoard(card,position);
        console.log("NS " + position);
        console.log("location " + card.location);

        const now = new Time;
        now.summon = {
            type: "NS",
            card: card,
            position: card.position,
            face: card.face,
        };
        now.spellSpeed = 1;            

        console.log(now);
        game.timeArray.push(now)

        await TriggerQuickeEffect()
        game.timeArray.map(time=>console.log(time))
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
                    if(card instanceof MonsterCard){
                        return createjs.Tween.get(card.imgContainer)
                            .to({x:toX,y:toY,scaleX:1.5,scaleY:1.5},300,createjs.Ease.cubicOut)
                            .to({scaleX:1,scaleY:1},300,createjs.Ease.cubicIn)
                    }else{
                        return createjs.Tween.get(card.imgContainer)
                        .to({x:toX,y:toY},500,createjs.Ease.cubicOut)
                    };
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
            TWEEN().call(()=>{resolve()})
        });
    };

    /**
     * カードオブジェクトを墓地から場に移動
     */
    const GyToBoard = async(card: Card) => {
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
                };
            };
            // トラップあとでかく
            return game.spellOrTrapZone;
        })();
        targetZone.splice( targetZone.indexOf(undefined), 1, card);
        game.graveYard = game.graveYard.filter(n => n !== card);
        return;
    };

    /**
     * カードを墓地から場に移動するアニメーション
     */
    const animationGyToBoard = (card: Card, position: "ATK"|"DEF"|"SET") => {
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
                    if(card instanceof MonsterCard){
                        return createjs.Tween.get(card.imgContainer)
                            .to({x:toX,y:toY,scaleX:1.5,scaleY:1.5},300,createjs.Ease.cubicOut)
                            .to({scaleX:1,scaleY:1},200,createjs.Ease.cubicIn)
                    }else{
                        return createjs.Tween.get(card.imgContainer)
                        .to({x:toX,y:toY},500,createjs.Ease.cubicOut)
                    };
                };
                if(position=="DEF"){
                    if(card instanceof MonsterCard){
                        return createjs.Tween.get(card.imgContainer)
                            .to({x:toX,y:toY,rotation:-90,scaleX:1.5,scaleY:1.5},300,createjs.Ease.cubicOut)
                            .to({scaleX:1,scaleY:1},200,createjs.Ease.cubicIn)
                    };
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
            
            const PromiseArray :Promise<unknown>[] = [];
            game.graveYard.map((card, index, array) => {
                const twPromise = () => {
                    return new Promise((resolve, reject) => {
                    createjs.Tween.get(card.imgContainer)
                        .to({x:game.displayOrder.gy[0][0]+index*1,y:game.displayOrder.gy[0][1]-index*2})
                        .call(()=>{stage.setChildIndex(card.imgContainer,stage.numChildren - array.length + index)})
                        .call(()=>{resolve()});                
                    });
                };
                PromiseArray.push(twPromise());
            });
            Promise.all(PromiseArray); 

            return Promise.all([Promise.all(PromiseArray), TWEEN().call(()=>{resolve()})])
            
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

                // game.hand.map((h,i,a) =>{ console.log("hand: " + h.cardName)})
                // game.deck.map((h,i,a) =>{ console.log("deck: " + h.cardName)})

                await animationHandAdjust();
                console.log("draw");
                CardInHandButtonSetting(targetCard);
            };
            resolve();
        });
    };

    /**
     * デッキからサーチする
     * @param count
     */
    const search = (target: Card[]) => {
        console.log("function search")
        return new Promise<void>(async(resolve, reject) => {
            target.map((card, index, array) => {
                if(game.deck.includes(card)){
                    game.deck = game.deck.filter(i => i !== card);
                    game.hand.push(card);
                    card.location = "HAND";
                    console.log("search "+card.cardName);
                    CardInHandButtonSetting(card);                    
                };
            });
            await animationHandAdjust();
            await deckShuffle();
            resolve();
        });
    };

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
                    console.log(canActiveEffects(card).length)
                    if(canActiveEffects(card).length >0){
                        return [ActivateButton];
                    }else{
                        return [];
                    };
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

    const canActiveEffects =(card:Card)=>{
        return card.effect.filter(eff => 
            (eff.effType=="CardActived"||eff.effType=="Quick") &&
            eff.actionPossible({spellSpeed:1}));
    };
    
    /**
     * 手札カードボタン設定
     */
    function CardInHandButtonSetting(card:Card){
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
                    const buttonArray :Container[] = [];
                    if(canActiveEffects(card).length >0){
                        buttonArray.push(ActivateButton);
                    };
                    buttonArray.push(SETButton);
                    return buttonArray;
                };
            });

            disprayButton().map((button, index, array) => {
                button.x = -cardImgSize.x/2;
                button.y = cardImgSize.x/2-40*(array.length) + 40*(index+1);
                button.visible = true 
            });  
        };

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
    const messageText = <HTMLElement>document.getElementById("selectMessageText")
    const scrollAreaContainer =<HTMLElement>document.getElementById("scrollAreaContainer") ;

    const disprayCanv =<HTMLCanvasElement>document.getElementById("displayCanv") ;
    const disprayStage = new createjs.Stage(disprayCanv);
    disprayStage.enableMouseOver();

    setBoard(stage);

    const ALPHA = genMonsterCard(Alpha);
    const BETA = genMonsterCard(Beta);
    const GAMMA = genMonsterCard(Gamma);
    const AIRMAN = genMonsterCard(Airman);
    const DISK = genMonsterCard(Disk);
    const DOGMA = genMonsterCard(Dogma);
    
    AIRMAN.effect[0] = new effect(AIRMAN)
    AIRMAN.effect[0].effType = "Trigger"
    AIRMAN.effect[0].whetherToActivate = "Any"
    AIRMAN.effect[0].actionPossible = (time:Time) =>{
        const boolarray = [
            time.summon.type=="NS"||time.summon.type=="SS",
            time.summon.card== AIRMAN,
            time.summon.face== "UP",
            time.spellSpeed== 1,
            genCardArray({category:["HERO"],location:["DECK"]}).length > 0];
        return boolarray.every(value => value)
    };

    AIRMAN.effect[0].whenActive = (eff :effect) => {
        return new Promise((resolve, reject) => {
            const cardlist = genCardArray({category:["HERO"],location:["DECK"]});
            openCardListWindow.select(cardlist,1,eff,"手札に加えるHEROを選択してください");
            SelectOkButton.addEventListener("click",clickOkButton);
            function clickOkButton(e) {
                divSelectMenuContainer.style.visibility = "hidden";
                disprayStage.removeAllChildren();
                SelectOkButton.removeEventListener("click", clickOkButton);
                resolve();
            };
        });
    };
    AIRMAN.effect[0].whenResolve = (eff :effect) => {
        return new Promise<void>(async(resolve, reject) => {
            await search(eff.targetCard);
            resolve();
        });
    };

    DISK.effect[0] = new effect(DISK)
    DISK.effect[0].effType = "Trigger"
    DISK.effect[0].whetherToActivate = "Forced"
    DISK.effect[0].actionPossible = (time:Time) =>{
        const boolarray = [
            time.summon.type=="SS",
            time.summon.from== "GY",
            time.summon.card== DISK,
            time.summon.face== "UP",
            time.spellSpeed== 1
        ];
        return boolarray.every(value => value)
    };

    DISK.effect[0].whenActive = (eff :effect) => {
        return new Promise((resolve, reject) => {
            resolve();
        });
    };
    DISK.effect[0].whenResolve = (eff :effect) => {
        return new Promise<void>(async(resolve, reject) => {
            await draw(2);
            resolve();
        });
    };

    const potOfGreed = new SpellCard
    potOfGreed.spellType = "Normal"
    potOfGreed.imageFileName = "PotOfGreed.png"
    potOfGreed.cardName = "PotOfGreed"
    potOfGreed.effect[0] = new effect(potOfGreed);
    potOfGreed.effect[0].effType = "CardActived"
    potOfGreed.effect[0].whenActive = (eff :effect) => {
        return new Promise<void>((resolve, reject) => {
            resolve();
        });
    };
    potOfGreed.effect[0].actionPossible = (time:Time) =>{
        const boolarray = [
            time.spellSpeed = 1,
            genCardArray({location:["DECK"]}).length > 0
        ];
        return boolarray.every(value => value==true)
    };
    potOfGreed.effect[0].whenResolve = (eff :effect) => {
        return new Promise<void>(async(resolve, reject) => {
            await draw(2);
            resolve();
        });
    };
    
    const reinforcement = new SpellCard
    reinforcement.spellType = "Normal"
    reinforcement.cardName = "Reinforcement"
    reinforcement.imageFileName = "Reinforcement.jpg";
    reinforcement.effect[0] = new effect(reinforcement);
    reinforcement.effect[0].effType = "CardActived"
    reinforcement.effect[0].actionPossible = (time:Time) =>{
        const boolarray = [
            time.spellSpeed = 1,
            genCardArray({race:["WARRIOR"],location:["DECK"]})
                                .filter(card => card instanceof MonsterCard && card.level <= 4).length > 0
        ];
        return boolarray.every(value => value==true)
    };
    reinforcement.effect[0].whenActive = (eff :effect) => {
        return new Promise((resolve, reject) => {
            const cardlist = genCardArray({race:["WARRIOR"],location:["DECK"]})
                                .filter(card => card instanceof MonsterCard && card.level <= 4);
            openCardListWindow.select(cardlist,1,eff);
            const clickOkButton = async (e) => {
                divSelectMenuContainer.style.visibility = "hidden";
                disprayStage.removeAllChildren();
                SelectOkButton.removeEventListener("click", clickOkButton);
                resolve();
            };
            SelectOkButton.addEventListener("click",clickOkButton);
        });
    };
    reinforcement.effect[0].whenResolve = (eff :effect) => {
        return new Promise<void>(async(resolve, reject) => {
            await search(eff.targetCard);
            resolve();
        });
    };

    const destinyDraw = new SpellCard
    destinyDraw.spellType = "Normal"
    destinyDraw.cardName = "destinyDraw"
    destinyDraw.imageFileName = "Ddraw.jpg"
    destinyDraw.effect[0] = new effect(destinyDraw);
    destinyDraw.effect[0].effType = "CardActived"
    destinyDraw.effect[0].actionPossible = (time:Time) =>{
        const boolarray = [
            time.spellSpeed = 1,
            genCardArray({category:["HERO"],location:["HAND"]}).length > 0
        ];
        return boolarray.every(value => value==true)
    };
    destinyDraw.effect[0].whenActive = (eff :effect) => {
        return new Promise((resolve, reject) => {
            const cardlist = genCardArray({category:["HERO"],location:["HAND"]});
            openCardListWindow.select(cardlist,1,eff);
            const clickOkButton = async (e) => {
                console.log("cost " + eff.targetCard.map(({ cardName }) => cardName))
                divSelectMenuContainer.style.visibility = "hidden";
                disprayStage.removeAllChildren();
                await HandToGY(eff.targetCard);
                SelectOkButton.removeEventListener("click", clickOkButton);
                resolve();
            };
            SelectOkButton.addEventListener("click",clickOkButton);
        });
    };
    destinyDraw.effect[0].whenResolve = (eff :effect) => {
        return new Promise<void>(async(resolve, reject) => {
            await draw(2);
            resolve();
        });
    };

    const monsterReborn = new SpellCard
    monsterReborn.spellType = "Normal"
    monsterReborn.cardName = "monsterReborn"
    monsterReborn.imageFileName = "MonsterReborn.jpg"
    monsterReborn.effect[0] = new effect(monsterReborn);
    monsterReborn.effect[0].effType = "CardActived"
    monsterReborn.effect[0].actionPossible = (time:Time) =>{
        const boolarray = [
            time.spellSpeed = 1,
            genCardArray({cardType:["Monster"],location:["GY"]}).length > 0
        ];
        return boolarray.every(value => value==true)
    };
    monsterReborn.effect[0].whenActive = (eff :effect) => {
        return new Promise((resolve, reject) => {
            const cardlist = genCardArray({cardType:["Monster"],location:["GY"]});
            openCardListWindow.select(cardlist,1,eff);
            const clickOkButton = async (e) => {
                divSelectMenuContainer.style.visibility = "hidden";
                disprayStage.removeAllChildren();
                SelectOkButton.removeEventListener("click", clickOkButton);
                resolve();
            };
            SelectOkButton.addEventListener("click",clickOkButton);
        });
    };
    monsterReborn.effect[0].whenResolve = (eff :effect) => {
        return new Promise<void>(async(resolve, reject) => {
            const posi = await OpenPositionWindow(eff.targetCard[0])
            const target = eff.targetCard[0]
            if(target instanceof MonsterCard){
                await SpecialSummon.fromGY(target,posi)
            };
            resolve();
        });
    };


    const myDeck : Card[]= [DOGMA,ALPHA,BETA,GAMMA,potOfGreed,reinforcement,AIRMAN,destinyDraw,DISK,monsterReborn];
    deckset(stage, Array.from(myDeck));
    console.log(game.deck); 

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

    const DeckViewButton = createButton("DECK View", 150, 40, "#0275d8");
    DeckViewButton.x = 1200;
    DeckViewButton.y = 600;
    stage.addChild(DeckViewButton);

    DeckViewButton.on("click", function(e){
        openCardListWindow.view(game.deck,"DECK");
        console.log(game.deck)
        const clickOkButton = async (e) => {
            divSelectMenuContainer.style.visibility = "hidden";
            disprayStage.removeAllChildren();
            SelectOkButton.removeEventListener("click", clickOkButton);
        };
        SelectOkButton.addEventListener("click",clickOkButton);
    }, null, false);
    
    const GyViewButton = createButton("GY View", 150, 40, "#0275d8");
    GyViewButton.x = 1200;
    GyViewButton.y = 550;
    stage.addChild(GyViewButton);

    GyViewButton.on("click", function(e){
        openCardListWindow.view(game.graveYard,"GY");
        console.log(game.graveYard)
        const clickOkButton = async (e) => {
            divSelectMenuContainer.style.visibility = "hidden";
            disprayStage.removeAllChildren();
            SelectOkButton.removeEventListener("click", clickOkButton);
        };
        SelectOkButton.addEventListener("click",clickOkButton);
    }, null, false);

    const positionButton = createButton("Position", 150, 40, "#0275d8");
    positionButton.x = 1200;
    positionButton.y = 650;
    stage.addChild(positionButton);

    positionButton.on("click", function async(e){
        OpenPositionWindow(AIRMAN);
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

    const SelectOkButton = createButton("OK", 150, 40, "#0275d8");
    SelectOkButton.x = windowBackCanv.width/2 - 75;
    SelectOkButton.y = 650;
    windowBackStage.addChild(SelectOkButton);

    const HandOkButton = createButton("OK", 150, 40, "#0275d8");
    HandOkButton.x = game.displayOrder.hand[0];
    HandOkButton.y = game.displayOrder.hand[1];
    HandOkButton.visible = false
    stage.addChild(HandOkButton);

    scrollAreaContainer.style.width = String(windowSize.w)+"px";
    scrollAreaContainer.style.height = String(windowSize.h)+"px";


    const openCardListWindow = {
        select: (disprayCards :Card[], count :Number, activeEff :effect,message? :string) => {
            divSelectMenuContainer.style.visibility = "visible";
            if(message == undefined){
                messageText.innerText = "select"
            }else{
                messageText.innerText = message
            }
            activeEff.targetCard = [];
            selectedCardImgArray = [];
            SelectOkButton.mouseEnabled = false ;

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
                        if(activeEff.targetCard.length==count){
                            selectedCardImgArray[0].selected.visible = false;
                            activeEff.targetCard.shift();
                            selectedCardImgArray.shift();
                        }
                        selected.visible = true;
                        activeEff.targetCard.push(card);
                        selectedCardImgArray.push(selectedCardImg);
                    }else{
                        selected.visible = false; 
                        activeEff.targetCard = activeEff.targetCard.filter(i => i !== card);
                        selectedCardImgArray = selectedCardImgArray.filter(i => i !== selectedCardImg);
                    };
                    SelectOkButton.mouseEnabled = activeEff.targetCard.length===count;
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
        },

        view:(disprayCards :Card[], message? :string) => {
            divSelectMenuContainer.style.visibility = "visible";
            if(message == undefined){
                messageText.innerText = "select"
            }else{
                messageText.innerText = message
            }
            selectedCardImgArray = [];

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
        }
    };

    const OpenYesNoWindow = (message :string) => {
        divSelectMenuContainer.style.visibility = "visible";
        SelectOkButton.visible = false;

        const YesNoContainer = new createjs.Container();

        const YesButton = createButton("YES", 150, 40, "#0275d8");
        YesNoContainer.addChild(YesButton);

        const NoButton = createButton("NO", 150, 40, "#0275d8");
        NoButton.x = NoButton.getBounds().width*8;
        YesNoContainer.addChild(NoButton);

        YesNoContainer.regX = YesNoContainer.getBounds().width/2
        YesNoContainer.regY = YesNoContainer.getBounds().height/2
        YesNoContainer.x = windowSize.w/2 -60
        YesNoContainer.y = windowSize.h/2
        disprayStage.addChild(YesNoContainer)
        
        disprayCanv.style.width = String(windowSize.w)+"px";
        disprayCanv.width = windowSize.w;
        disprayCanv.style.height = String(windowSize.h)+"px";
        disprayCanv.height = windowSize.h;

        messageText.innerText = message
        
        return  new Promise((resolve, reject) => {
            YesButton.addEventListener("click",clickYesButton);
            function clickYesButton(e) {
                divSelectMenuContainer.style.visibility = "hidden";
                disprayStage.removeAllChildren();
                SelectOkButton.visible = true;
                resolve(true);
            };
            NoButton.addEventListener("click",clickNoButton);
            function clickNoButton(e) {
                divSelectMenuContainer.style.visibility = "hidden";
                disprayStage.removeAllChildren();
                SelectOkButton.visible = true;
                resolve(false);
            };
        });
    };

    const OpenPositionWindow = (card :Card) => {
        SelectOkButton.visible = false;
        divSelectMenuContainer.style.visibility = "visible";
        const AtkDefContainer = new createjs.Container();

        disprayCanv.style.width = String(windowSize.w)+"px";
        disprayCanv.width = windowSize.w;
        disprayCanv.style.height = String(100+cardImgSize.y)+"px";
        disprayCanv.height = 100+cardImgSize.y;

        const Atk = new createjs.Container();
        const AtkImg = new createjs.Bitmap(card.imageFileName);
        Atk.addChild(AtkImg);
        Atk.regX = Atk.getBounds().width/2
        Atk.regY = Atk.getBounds().height/2
        Atk.cursor = "pointer";

        const Def = new createjs.Container();
        const DefImg = new createjs.Bitmap(card.imageFileName);
        Def.addChild(DefImg);
        Def.regX = Def.getBounds().width/2
        Def.regY = Def.getBounds().height/2
        Def.cursor = "pointer";
        Def.x = Def.getBounds().width*2.5;
        Def.rotation = -90;

        AtkDefContainer.addChild(Atk);
        AtkDefContainer.addChild(Def);

        AtkDefContainer.regX = AtkDefContainer.getBounds().width/2
        AtkDefContainer.regY = AtkDefContainer.getBounds().height/2
        AtkDefContainer.x = windowSize.w/2 +80
        AtkDefContainer.y = windowSize.h + 20
        disprayStage.addChild(AtkDefContainer)

        return  new Promise<"ATK"|"DEF">((resolve, reject) => {
            Atk.addEventListener("click",clickAtkButton);
            function clickAtkButton(e) {
                divSelectMenuContainer.style.visibility = "hidden";
                disprayStage.removeAllChildren();
                SelectOkButton.visible = true;
                resolve("ATK");
            };
            Def.addEventListener("click",clickNoButton);
            function clickNoButton(e) {
                divSelectMenuContainer.style.visibility = "hidden";
                disprayStage.removeAllChildren();
                SelectOkButton.visible = true;
                resolve("DEF");
            };
        });
    };
};

