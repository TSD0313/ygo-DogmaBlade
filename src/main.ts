import { Text, Stage, Bitmap, Container, Tween} from 'createjs-module';
import { createButton }  from './createButton';
import { createTextButton }  from './createTextButton';
import * as status from './CardStatus.json';
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
    };
};
class Game{
    defaultDeck : Card[];
    FIELD : Card[];
    MO : Card[];
    ST : Card[];
    GY : Card[];
    DD : Card[];
    EXTRA : Card[];
    DECK : Card[];
    HAND : Card[];
    myLifePoint : number;
    enemyLifePoint : number;
    normalSummon : boolean;
    countNS : number;
    payLPcost : boolean;
    grid : Grid;
    displayOrder : any;
    centerGrid : {x:number,y:number};
    selectedCards : Card[];
    chain : effect[];
    nowTime : Time;
    timeArray : Time[];
    firstHand : string[];
    liblaryOut : boolean;
    constructor(){
        this.defaultDeck = [];
        this.FIELD = [undefined];
        this.MO = [undefined,undefined,undefined,undefined,undefined];
        this.ST = [undefined,undefined,undefined,undefined,undefined];
        this.GY = [];
        this.DD = [];
        this.EXTRA = [];
        this.HAND = [];
        this.DECK = [];
        this.myLifePoint = DEFAULT_LIFE;
        this.enemyLifePoint= DEFAULT_LIFE;
        this.normalSummon = true;
        this.countNS = 0 ;
        this.payLPcost = true;
        this.chain = [];
        this.nowTime = new Time;
        this.timeArray = [];
        this.liblaryOut = false;
        const front_position: number[][] = (() => {
            const array: number[][] = [];
            for(let i = 0; i < 8 ; i++){
                if(i<7){
                  array.push([cardImgSize.x/2+20+(cardImgSize.y+cardImgSize.margin)*i,cardImgSize.y/2+20+100]);  
                }else if(i==7){
                    array.push([cardImgSize.x/2-20+(cardImgSize.y+cardImgSize.margin)*i,cardImgSize.y/2+20+100]);
                };
            };
            return array
        })();
        const back_position = (() => {
            const array: number[][] = [];
            for(let i = 8; i < 15 ; i++){
                array.push([cardImgSize.x/2+20+(cardImgSize.y+cardImgSize.margin)*(i-8),cardImgSize.y*1.5+40+100]);
            };
            return array
        })();

        this.grid = new Grid(front_position, back_position);

        this.displayOrder  = {
                field:[this.grid.front[0]],
                mon:[this.grid.front[3],this.grid.front[2],this.grid.front[4],this.grid.front[1],this.grid.front[5]],
                gy:[this.grid.front[6]],
                dd:[this.grid.front[7]],
                ex:[this.grid.back[0]],
                st:[this.grid.back[3],this.grid.back[2],this.grid.back[4],this.grid.back[1],this.grid.back[5]],
                deck:[this.grid.back[6]],
                hand:[this.grid.front[3][0],this.grid.front[3][1]*3]
        };
        this.centerGrid = {x:this.grid.front[3][0],y:(this.grid.front[0][1]+this.grid.back[0][1])/2}      
    };
};

class Time{
    summon?:{
            card : MonsterCard;
            type : "NS"|"SS";
            position : "ATK"|"DEF";
            face : "UP"|"DOWN";
            from? : "MO"|"ST"|"FIELD"|"DECK"|"HAND"|"GY"|"DD";
    }[];
    move?:{
        card : Card;
        from? : "MO"|"ST"|"FIELD"|"BOARD"|"DECK"|"HAND"|"GY"|"DD";
        to? : "MO"|"ST"|"FIELD"|"DECK"|"HAND"|"GY"|"DD";
    }[];
    leaveBoard?:{
        card : Card;
    }[];
    discard?:{
        card : Card;
    }[];
    destroy?:{
        card : Card;
        by? : "BATTLE"|"EFFECT"|"RULE";
    }[];
    vanish?:{
        card : Card;
        by? : "EFFECT"|"COST";
    }[];
    release?:{
        card : Card;
        by? : "ADVANCE"|"EFFECT"|"RULE"|"COST";
    }[];
    bounce?:{
        card : Card;
        by? : "EFFECT"|"COST";
    }[];
    effectActived?:{
        card : Card;
        eff : effect;
    }[];
    constructor(){
        this.summon = [];
        this.move = [];
        this.leaveBoard = [];
        this.discard = [];
        this.destroy = [];
        this.vanish = [];
        this.release= [];
        this.bounce= [];
        this.effectActived= [];
    };
};

interface CardCondetionProps {
    frontImg : Bitmap;  cardBackImg : Bitmap;
    imageFileName : string;  cardBackImageFileName : string;
    ID : string;
    cardName : string;
    cardNameJP : string;
    category : string ;
    location : "MO"|"ST"|"FIELD"|"DECK"|"HAND"|"GY"|"DD";
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
    trapType : "Normal"|"Continuous"|"Counter";
};

class Card  {
    frontImg : Bitmap;  cardBackImg : Bitmap;
    imageFileName : string;  cardBackImageFileName : string;
    ID : Number;
    cardName : string;
    cardNameJP : string;
    location : "MO"|"ST"|"FIELD"|"DECK"|"HAND"|"GY"|"DD";
    imgContainer : Container;
    cardType : "Monster"|"Spell"|"Trap";
    face : "UP"|"DOWN" ;
    text : string;
    effect : effect[];
    effectKey : string;
    SSconditionKey : string;
    button : {NS:button,SS:button,SET:button,ACTIVATE:button,FLIP:button,VIEW:button};
    category : string[] ;
    canDestroy : boolean ;
    canVanish : boolean ;
    equipMark : Bitmap[];
    constructor(){
        this.cardBackImageFileName = "cardback.jpeg";
        this.location = "DECK"
        this.face = "UP"
        this.effect = [];
        this.canDestroy = true ;
        this.canVanish = true ;
        this.equipMark = [];
        this.button = (()=>{
            const NSButton = new button(this, "NS", cardImgSize.x, 40, "#0275d8");
            const SSButton = new button(this, "SS", cardImgSize.x, 40, "#0275d8");
            const SETButton = new button(this, "SET", cardImgSize.x, 40, "#0275d8"); 
            const ACTIVATEButton = new button(this, "ACTIVATE", cardImgSize.x, 40, "#0275d8"); 
            const FLIPButton = new button(this, "FLIP", cardImgSize.x, 40, "#0275d8"); 
            const VIEWButton = new button(this, "VIEW", cardImgSize.x, 40, "#0275d8"); 
            return {NS:NSButton,SS:SSButton,SET:SETButton,ACTIVATE:ACTIVATEButton,FLIP:FLIPButton,VIEW:VIEWButton};
        })();
    };
};

class MonsterCard extends Card {
    monsterType : "Normal"|"Effect";
    level : Number;
    race : string;
    attribute : string;
    atkPoint : Number;
    defPoint : Number;
    buff : {
        eff:effect;
        atkBuff:Number;
        defBuff:Number;
    }[];
    equip : SpellCard[];
    position : "ATK"|"DEF";
    canNS : Boolean
    NSed : Boolean;
    reboarnCondition :Boolean;
    RuleSScondition : () =>Boolean;
    RuleSSpromise : () =>Promise<any>;
    constructor(){
        super();
        this.cardType = "Monster";
        this.canNS = true;
        this.buff = [];
        this.equip = [];
        this.RuleSScondition = ()=>{return false};
    };
};

class SpellCard extends Card {
    spellType : "Normal"|"Quick"|"Equip"|"Field"|"Continuous";
    actionPossible : {key: boolean[]};
    peggingTarget : Card[];
    constructor(){
        super();
        this.cardType = "Spell"
        this.peggingTarget = [];
    };
};

class TrapCard extends Card {
    trapType : "Normal"|"Continuous"|"Counter";
    actionPossible : {key: boolean[]};
    peggingTarget : Card[];
    constructor(){
        super();
        this.cardType = "Trap"
        this.peggingTarget = [];
    };
};

class effect {
    card : Card;
    effType : "CardActived"|"Ignition"|"Trigger"|"Continuous"|"Quick"|"Rule";
    spellSpeed : 1|2|3;
    range : ("MO"|"ST"|"FIELD"|"DECK"|"HAND"|"GY"|"DD")[];
    whetherToActivate : "Any"|"Forced";
    costCard : Card[];
    targetCard : Card[];
    chainBrock : Text;
    lifeCost : number;
    copyCondition : () => boolean;
    actionPossible :(time:Time) => boolean;
    whenActive : (eff?: effect) => Promise<any>;
    whenResolve : (eff?: effect) => Promise<any>;
    apply : () => Promise<any>;
    mode : boolean;
    modeText :()=> string;
    constructor(card:Card){
        this.card = card;
        this.targetCard = [];
        this.costCard = [];
        this.mode = true;
        this.modeText = ()=>{return ""};
        this.lifeCost = 0;
    };
};

class button {
    card : Card;
    buttonContainer : Container;
    constructor(card:Card,text:string,w:number,h:number,color:string){
        this.card = card;
        this.buttonContainer = createButton(text, w, h, color);
    };
};

const timeout = (ms: number): Promise<void> =>{
    return new Promise<void>(resolve => setTimeout(resolve, ms));
};

/**
 * 正の整数に変換
 */
const zerofix = (num: number): string=>{
    if( num <= 0 ){
        return "0";
    }else{
        return num.toFixed();
    };
};

/**
 * 中央揃えテキスト生成
 */
const genCenterText = (text:string)=>{
    const newText = new createjs.Text(text, "80px serif", "midnightblue");
    newText.textBaseline = "middle";
    newText.textAlign = "center";
    return newText
};

/**
 * カードインスタンス生成
 */
const genCardObject = {
    Monster:(json:Object)=>{
        const newCard = new MonsterCard;
        Object.keys(json).map((key, index, array) => {
            newCard[key] = json[key]
        });
        return newCard;
    },
    Spell:(json:Object)=>{
        const newCard = new SpellCard;
        Object.keys(json).map((key, index, array) => {
            newCard[key] = json[key]
        });
        return newCard;
    },
    Trap:(json:Object)=>{
        const newCard = new TrapCard;
        Object.keys(json).map((key, index, array) => {
            newCard[key] = json[key]
        });
        return newCard;
    },
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

/**
 * 配列をランダム化
 */
const shuffle = (target:Card[]) => {
    for (let i = target.length - 1; i >= 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [target[i], target[j]] = [target[j], target[i]];
    };
    return target;
};

window.onload = function() {

    /**
     * 指定のstageに指定のcardを指定座標で描画する
     * 
     * @param container ステージ
     * @param card 
     * @param x 座標
     * @param y 座標
     */
    function puton(container:Container, card: Card,x: number, y: number){
        card.imgContainer = new createjs.Container();
        container.addChild(card.imgContainer);
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
        Object.values(card.button).forEach(b => {
            card.imgContainer.addChild(b.buttonContainer);
            b.buttonContainer.visible = false;
        });
    };

    /**
     * ボードのカード置き場の枠を描画する
     */
    const setBoard = (stage:Stage) => {
        const drawzone = (x,y,i) => {
            let zone = new createjs.Shape();
            zone.graphics.beginStroke("#0055bb");
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

        for(let i = 0; i < 15 ; i++){
            const target = (() => {
                if(i < 8){
                    return game.grid.front[i];
                }else{
                    return game.grid.back[i-8];
                };
            })();
            drawzone(target[0],target[1],i);
        };
    };

    /**
     * 発動するカードを選択する
     */
    const selectActivateCard = (effArray:effect[],cancel?:boolean) => {
        const tmpCard = new Card
        const tmpEff = new effect(tmpCard)
        return new Promise<Card>(async(resolve, reject) => {
            const cardlist = effArray.flatMap(eff => eff.card)
            tmpEff.targetCard = await openCardListWindow.select(cardlist,1,1,tmpEff,"発動する効果を選択してください",cancel);
            if(1<=tmpEff.targetCard.length){
                resolve(tmpEff.targetCard.pop());
            }else{
                resolve();
            };
        });
    };

    /**
     * 永続ルールチェック
     */
    const ContinuousEffect = async(time:Time) =>{
        const boardUp = genCardArray({location:["MO","ST","GY"],face:["UP"]});
        const AllCoRu = (()=>{
            const tmpCoArray :effect[] = [];
            boardUp.map((card,index,array)=>{
                tmpCoArray.push(
                    ...(
                        card.effect.filter(eff => 
                        eff.effType == "Continuous"||eff.effType == "Rule" )
                    )
                );
            });
            return tmpCoArray
        })();
        const canActiveEffects =(EffArray:effect[],time:Time)=>{
            return EffArray.filter(eff => 
                eff.actionPossible(time));
        };
        await (async () => {
            for(let eff of canActiveEffects(AllCoRu,time)){
                await eff.apply()
            };
        })();
    };


    /**
     * 誘発QEチェック
     */
    const TriggerQuickeEffect = async() =>{
        cardContainer.mouseEnabled = false;

        const canActiveEffects =(EffArray:effect[],time:Time[])=>{
            return EffArray.filter(eff => 
                time.map(t => eff.actionPossible(t))
                .includes(true)
            );
        };

        do{
            const AllTrigger = (()=>{
                const tmpTriggerArray :effect[] = [];
                [...game.defaultDeck].map((card,index,array)=>{
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

            const TriggerTime = [...game.timeArray];
            game.timeArray = [];

            do{
                const PubForced = canActiveEffects(TriggerObj.PublicForced,TriggerTime);
                if(PubForced.length >1){
                    const activeEffOrg = (await selectActivateCard(PubForced)).effect.filter(eff => 
                        eff.effType == "Trigger" && canActiveEffects([eff],TriggerTime) ).pop();
                    const result :effect = {...activeEffOrg,targetCard:[],costCard:[]};
                    game.nowTime = new Time;
                        game.nowTime.effectActived.push({
                            card:result.card,
                            eff:result
                        });
                    await animationChainEffectActivate(result);
                    await result.whenActive(result);
                    game.timeArray.push({...game.nowTime});
                    game.chain.push(result);
                    TriggerObj.PublicForced = TriggerObj.PublicForced.filter(eff => 
                        eff !== activeEffOrg );
                }else if(PubForced.length ==1){
                    const activeEffOrg = PubForced.pop()
                    const result :effect = {...activeEffOrg,targetCard:[],costCard:[]};
                    game.nowTime = new Time;
                        game.nowTime.effectActived.push({
                            card:result.card,
                            eff:result
                        });
                    await animationChainEffectActivate(result);
                    await result.whenActive(result);
                    game.timeArray.push({...game.nowTime});
                    game.chain.push(result);
                    TriggerObj.PublicForced = TriggerObj.PublicForced.filter(eff => 
                        eff !== activeEffOrg );
                };
            }while(canActiveEffects(TriggerObj.PublicForced,TriggerTime).length > 0);

            do{
                const PubAny = canActiveEffects(TriggerObj.PublicAny,TriggerTime);
                if(PubAny.length >1){
                    const selectedCard = await selectActivateCard(PubAny,true)
                    if(selectedCard){
                        const activeEffOrg = selectedCard.effect.filter(eff => 
                            eff.effType == "Trigger" && canActiveEffects([eff],TriggerTime) 
                        ).pop();
                        const result :effect = {...activeEffOrg,targetCard:[],costCard:[]};
                        game.nowTime = new Time;
                        game.nowTime.effectActived.push({
                            card:result.card,
                            eff:result
                        });
                        await animationChainEffectActivate(result);
                        await result.whenActive(result);
                        game.timeArray.push({...game.nowTime});
                        console.log(result.card.cardName + " Effect")
                        game.chain.push(result);
                        TriggerObj.PublicAny = TriggerObj.PublicAny.filter(eff => 
                            eff !== activeEffOrg ); 
                    }else{
                        TriggerObj.PublicAny = [];
                    };
                }else if(PubAny.length ==1){
                    const activeEffOrg = PubAny.pop()
                    if(await(openYesNoWindow(activeEffOrg.card.cardNameJP + activeEffOrg.modeText() + "の効果を発動しますか？"))){
                        const result :effect = {...activeEffOrg,targetCard:[],costCard:[]};
                        game.nowTime = new Time;
                        game.nowTime.effectActived.push({
                            card:result.card,
                            eff:result
                        });
                        await animationChainEffectActivate(result);
                        await result.whenActive(result);
                        game.timeArray.push({...game.nowTime});
                        console.log(result.card.cardName + " Effect")
                        game.chain.push(result);
                    };
                    TriggerObj.PublicAny = TriggerObj.PublicAny.filter(eff => 
                        eff !== activeEffOrg );
                };
            }while(canActiveEffects(TriggerObj.PublicAny,TriggerTime).length > 0);

            // チェーン解決
            if(game.chain.length==0){
            console.log("NO TriggerEffect")
            }else{
                await timeout(250);
                await (async () => {
                    console.log("Chain resolve")
                    for(let eff of game.chain.reverse()) {
                        await animationchainResolve(eff);
                        await eff.whenResolve(eff);
                    };
                })();
                await (async () => {
                    for(let eff of game.chain){
                        if(eff.card instanceof SpellCard && (eff.card.spellType=="Normal"||eff.card.spellType=="Quick")){
                            await moveCard.BOARD.toGY(eff.card);
                        };
                    };
                })();
                game.chain = [];
            };
        }while(game.timeArray.length != 0);
        cardContainer.mouseEnabled = !(game.liblaryOut);
    };

    /**
     * カード検索
     */
    type CondetionProps = { [k in keyof CardCondetionProps]?: CardCondetionProps[k][] }
    const genCardArray = (conditions: CondetionProps)=> {
        let CardArray = [...game.defaultDeck]
        for (let key in conditions) {
            CardArray = CardArray.filter(card => 
                key in card && ( conditions[key].includes(card[key]) || [...card[key]].includes(conditions[key][0]) )
            );
        };
        return CardArray
    };

    /**
     * ステータス表示マウスイベント
     */
    const SetStatusDisprayEvent = (card: Card,targetObj:Container|Bitmap)=>{
        targetObj.addEventListener("mouseover", handleMoverStatus);
        function handleMoverStatus(event) {
            statusStage.removeAllChildren();
            const cardImg = new createjs.Bitmap(card.cardName+"_view.jpg");
            statusStage.addChild(cardImg);
            cardImg.setTransform(statusCanv.width/2,statusCanv.height/2,1,1,0,0,0,140,206); 
            statusCardNameText.innerText = card.cardNameJP;
            const typetext = (()=>{
                if(card instanceof MonsterCard){
                    return ["☆"+card.level,card.monsterType,card.attribute,card.race].join(" / ");
                }else if(card instanceof SpellCard){
                    return card.spellType+" Spell";
                }else if(card instanceof TrapCard){
                    return card.trapType+" Trap";
                };
            })();
            statusCardTypeText.innerText = typetext;
            statusCardEffText.innerText = card.text;
        };
    };

    /**
     * 領域移動時のマウスイベント設定
     */
    const mouseEventSetting = {
        board: async(card: Card)=>{
            card.imgContainer.removeAllEventListeners();
            const buConArray = Object.values(card.button).map(b => b.buttonContainer)
            buConArray.forEach(b =>{
                b.removeAllEventListeners("click");
                b.visible=false;
            });
            SetStatusDisprayEvent(card,card.imgContainer);

            card.imgContainer.addEventListener("mouseover", handleFieldMover);
            function handleFieldMover(event) {
                const disprayButtonArray :Container[] = []
                if(canActiveEffects(card).length >0){
                    disprayButtonArray.push(card.button.ACTIVATE.buttonContainer);
                };
                disprayButtonArray.forEach((button, index, array) => {
                    button.x = -cardImgSize.x/2;
                    button.y = cardImgSize.y/2-40*(array.length) + 40*(index);
                    button.visible = true 
                });
            };
            card.imgContainer.addEventListener("mouseout", handleFieldMout);
            function handleFieldMout(event) {
                buConArray.forEach(b =>{b.visible=false;});
            };

            const equipMarkArray =()=>{
                if(card instanceof MonsterCard){
                    if(1<=card.equip.length){
                        const array = card.equip.map(eq => genEquipImg(eq));
                        array.push(genEquipImg(card));
                        return array;
                    }else{
                        return [];
                    };
                }else{
                    return [];
                };
            };
            
            card.imgContainer.addEventListener("mouseover", handleEquipTargetMover);
            function handleEquipTargetMover(event) {
                card.equipMark = [];
                equipMarkArray().forEach(m=>{
                    mainstage.addChild(m);
                    card.equipMark.push(m);
                });
            };
            card.imgContainer.addEventListener("mouseout", handleFieldEquipMout);
            function handleFieldEquipMout(event) {
                card.equipMark.forEach(m=>{
                    mainstage.removeChild(m);
                });
                
            };

            card.button.ACTIVATE.buttonContainer.addEventListener("click",handleActivatebuttonClick);
            function handleActivatebuttonClick(event) {
                if(card instanceof SpellCard){
                    fieldSpellActivate(card);
                    buConArray.forEach(b =>{b.removeAllEventListeners("click");});
                }else if(card instanceof MonsterCard){
                    BoardIgnitionActivate(card);
                };
            };
        },
        HAND:async(card:Card)=>{
            card.imgContainer.removeAllEventListeners();
            const buConArray = Object.values(card.button).map(b => b.buttonContainer)
            buConArray.forEach(b =>{
                b.removeAllEventListeners("click");
                b.visible=false;
            });
            SetStatusDisprayEvent(card,card.imgContainer);

            card.imgContainer.addEventListener("mouseover", handleHandMover);
            function handleHandMover(event) {
                const disprayButtonArray :Container[] = []
                if(card instanceof SpellCard){
                    if(canActiveEffects(card).length >0 && genCardArray({location:["ST"]}).length < 5){
                        disprayButtonArray.push(card.button.ACTIVATE.buttonContainer);
                    };
                }else if(card instanceof MonsterCard){
                    if(canActiveEffects(card).length >0){
                        disprayButtonArray.push(card.button.ACTIVATE.buttonContainer);
                    };
                };
                if(card instanceof MonsterCard && card.RuleSScondition()){
                    disprayButtonArray.push(card.button.SS.buttonContainer);
                };
                if(card instanceof MonsterCard && JudgeNS(card)){
                    disprayButtonArray.push(card.button.NS.buttonContainer);
                    disprayButtonArray.push(card.button.SET.buttonContainer);
                }else if((card instanceof SpellCard || card instanceof TrapCard) && genCardArray({location:["ST"]}).length < 5){
                    disprayButtonArray.push(card.button.SET.buttonContainer);
                };

                disprayButtonArray.forEach((button, index, array) => {
                    button.x = -cardImgSize.x/2;
                    button.y = cardImgSize.y/2-40*(array.length) + 40*(index);
                    button.visible = true 
                });
            };

            card.imgContainer.addEventListener("mouseout", handleHandMout);
            function handleHandMout(event) {
                buConArray.forEach(b =>{b.visible=false;});
            };

            card.button.ACTIVATE.buttonContainer.addEventListener("click",handleActivatebuttonClick);
            function handleActivatebuttonClick(event) {
                if(card instanceof SpellCard){
                    handSpellActivate(card);
                }else if(card instanceof MonsterCard){
                    // 手札の起動効果発動
                };
            };

            card.button.NS.buttonContainer.addEventListener("click",handleNSbuttonClick);
            function handleNSbuttonClick(event) {
                if(card instanceof MonsterCard){
                    normalSummon(card,"ATK");
                };
            };

            card.button.SS.buttonContainer.addEventListener("click",handleSSbuttonClick);
            function handleSSbuttonClick(event) {
                if(card instanceof MonsterCard){
                    card.RuleSSpromise();
                };
            };

            card.button.SET.buttonContainer.addEventListener("click",handleSETbuttonClick);
            async function handleSETbuttonClick(event) {
                if(card instanceof MonsterCard){
                    await normalSummon(card,"SET");
                };
                if(card instanceof SpellCard || card instanceof TrapCard){
                    SpellTrapSet.fromHAND(card);
                };
            };
        },
        GY:async(card:Card)=>{
            card.imgContainer.removeAllEventListeners();
            const buConArray = Object.values(card.button).map(b => b.buttonContainer)
            buConArray.forEach(button =>{
                button.removeAllEventListeners("click");
                button.visible=false;
            });
            SetStatusDisprayEvent(card,card.imgContainer);

            card.imgContainer.addEventListener("mouseover", handleFieldMover);
            function handleFieldMover(event) {
                const disprayButtonArray :Container[] = []
                const canActivateGYCard = game.GY.filter(card=>canActiveEffects(card).length >0);
                if(game.GY[game.GY.length-1]===card){
                    if(canActivateGYCard.length >0){
                        disprayButtonArray.push(card.button.ACTIVATE.buttonContainer);
                    };
                    disprayButtonArray.push(card.button.VIEW.buttonContainer);
                };
                disprayButtonArray.forEach((button, index, array) => {
                    button.x = -cardImgSize.x/2;
                    button.y = cardImgSize.y/2-40*(array.length) + 40*(index);
                    button.visible = true ;
                });
            };

            card.imgContainer.addEventListener("mouseout", handleFieldMout);
            function handleFieldMout(event) {
                buConArray.forEach(b =>{b.visible=false;});
            };

            card.button.ACTIVATE.buttonContainer.addEventListener("click",handleActivatebuttonClick);
            function handleActivatebuttonClick(event) {
                GyEffActivate();
            };
            const handlViewbuttonClick = async(event) => {
                await openCardListWindow.view(game.GY,"GY");
            };
            card.button.VIEW.buttonContainer.addEventListener("click",handlViewbuttonClick);
        },
        DD:async(card:Card)=>{
            card.imgContainer.removeAllEventListeners();
            const buConArray = Object.values(card.button).map(b => b.buttonContainer)
            buConArray.forEach(button =>{
                button.removeAllEventListeners("click");
                button.visible=false;
            });
            SetStatusDisprayEvent(card,card.imgContainer);

            card.imgContainer.addEventListener("mouseover", handleFieldMover);
            function handleFieldMover(event) {
                const disprayButtonArray :Container[] = []
                const canActivateGYCard = game.DD.filter(card=>canActiveEffects(card).length >0);
                if(game.DD[game.DD.length-1]===card){
                    if(canActivateGYCard.length >0){
                        disprayButtonArray.push(card.button.ACTIVATE.buttonContainer);
                    };
                    disprayButtonArray.push(card.button.VIEW.buttonContainer);
                };
                disprayButtonArray.forEach((button, index, array) => {
                    button.x = -cardImgSize.x/2;
                    button.y = cardImgSize.y/2-40*(array.length) + 40*(index);
                    button.visible = true ;
                });
            };

            card.imgContainer.addEventListener("mouseout", handleFieldMout);
            function handleFieldMout(event) {
                buConArray.forEach(b =>{b.visible=false;});
            };

            card.button.ACTIVATE.buttonContainer.addEventListener("click",handleActivatebuttonClick);
            function handleActivatebuttonClick(event) {
                // 除外ゾーン効果発動
                // buConArray.forEach(b =>{b.removeAllEventListeners("click");});
            };

            const handlViewbuttonClick = async(event) => {
                await openCardListWindow.view(game.DD,"DD");
            };
            card.button.VIEW.buttonContainer.addEventListener("click",handlViewbuttonClick);
        },
        DECK:async(card:Card)=>{
            card.imgContainer.removeAllEventListeners();
            const buConArray = Object.values(card.button).map(b => b.buttonContainer)
            buConArray.forEach(button =>{
                button.removeAllEventListeners("click");
                button.visible=false;
            });
        },
    };

    /**
     * 移動カードのプロパティ設定
     */
    type LocType = "MO"|"ST"|"FIELD"|"DECK"|"HAND"|"GY"|"DD";
    const LocationSetting = async(card:Card,to:LocType) =>{
        if(card.location=="MO"||card.location=="ST"){
            game[card.location][ game[card.location].indexOf(card) ]= void 0;
        }else{
            game[card.location] = game[card.location].filter(n => n !== card);  
        };

        if(to=="MO"||to=="ST"){
            game[to].splice( game[to].indexOf(undefined), 1, card);
        }else{
            game[to].push(card);
        };
        card.location = to;

        if(to=="MO"||to=="ST"||to=="FIELD"){
            await mouseEventSetting.board(card);
        }else{
            await mouseEventSetting[to](card);
        };
    };

    /**
     * 移動カードのanimation設定
     */  
    const Animation = {
        toBOARD:(card: Card, position: "ATK"|"DEF"|"SET")=>{
            const toGrid = (() => {
                if(card instanceof MonsterCard){
                    let toX : Number = game.displayOrder.mon[game.MO.indexOf(card)][0];
                    let toY : Number = game.displayOrder.mon[game.MO.indexOf(card)][1];
                    return{toX,toY};
                }
                else{
                    let toX : Number = game.displayOrder.st[game.ST.indexOf(card)][0];
                    let toY : Number = game.displayOrder.st[game.ST.indexOf(card)][1];
                    return{toX,toY};
                };
            })();
            const {toX,toY} = toGrid;
            const TWEEN = () => {
                if(position=="ATK"){
                    if(card instanceof MonsterCard){
                        return createjs.Tween.get(card.imgContainer)
                            .call(()=>{cardContainer.setChildIndex(card.imgContainer,cardContainer.numChildren-1)})
                            .to({x:toX,y:toY,scaleX:1.5,scaleY:1.5},400,createjs.Ease.cubicOut)
                            .to({scaleX:1,scaleY:1},400,createjs.Ease.cubicIn)
                            .wait(200)
                    }else{
                        return createjs.Tween.get(card.imgContainer)
                            .call(()=>{cardContainer.setChildIndex(card.imgContainer,cardContainer.numChildren-1)})
                            .to({x:toX,y:toY},500,createjs.Ease.cubicOut)
                    };
                };
                if(position=="DEF"){
                    if(card instanceof MonsterCard){
                        return createjs.Tween.get(card.imgContainer)
                            .call(()=>{cardContainer.setChildIndex(card.imgContainer,cardContainer.numChildren-1)}) 
                            .to({x:toX,y:toY,rotation:-90,scaleX:1.5,scaleY:1.5},400,createjs.Ease.cubicOut)
                            .to({scaleX:1,scaleY:1},400,createjs.Ease.cubicIn)
                    };
                };
                if(position=="SET"){
                    if(card instanceof MonsterCard){
                        return createjs.Tween.get(card.imgContainer)
                                .call(()=>{cardContainer.setChildIndex(card.imgContainer,cardContainer.numChildren-1)})
                                .call(()=>{cardFlip(card)})
                                .to({x:toX,y:toY,rotation:-90},500,createjs.Ease.cubicOut);
                    }
                    else{
                        return createjs.Tween.get(card.imgContainer)
                                .call(()=>{cardContainer.setChildIndex(card.imgContainer,cardContainer.numChildren-1)})
                                .call(()=>{cardFlip(card)})
                                .to({x:toX,y:toY},500,createjs.Ease.cubicOut);
                    };
                };
            };
            return new Promise((resolve, reject) => {
                TWEEN().call(()=>{resolve()})
            });
        },
        toGY:(card: Card)=>{
            const toX : number = game.displayOrder.gy[0][0]+(game.GY.length-1)*0.5
            const toY : number = game.displayOrder.gy[0][1]-(game.GY.length-1)*0.5
            return new Promise((resolve, reject) => {
                if (card.face=="DOWN"){
                    cardFlip(card);
                };
                createjs.Tween.get(card.imgContainer)
                    .call(()=>{cardContainer.setChildIndex(card.imgContainer,cardContainer.numChildren-1)})
                    .to({x:toX,y:toY,rotation:0},500,createjs.Ease.cubicOut)
                    .call(()=>{resolve()});
            }); 
        },
        fromGY:(card: Card)=>{
            cardContainer.setChildIndex(card.imgContainer,cardContainer.numChildren-1);
            const PromiseArray :Promise<unknown>[] = [];
            game.GY.map((card, index, array) => {
                const twPromise = () => {
                    return new Promise((resolve, reject) => {
                    createjs.Tween.get(card.imgContainer)
                        .to({x:game.displayOrder.gy[0][0]+index*0.5,y:game.displayOrder.gy[0][1]-index*0.5})
                        .call(()=>{cardContainer.setChildIndex(card.imgContainer,cardContainer.numChildren - array.length + index)})
                        .call(()=>{resolve()});                
                    });
                };
                PromiseArray.push(twPromise());
            });
            return Promise.all(PromiseArray);
        },
        toDD:(card: Card)=>{
            const toX : number = game.displayOrder.dd[0][0]+(game.DD.length-1)*0.5
                const toY : number = game.displayOrder.dd[0][1]-(game.DD.length-1)*0.5
                return new Promise((resolve, reject) => {
                    if (card.face=="DOWN"){
                        cardFlip(card);
                    };
                    createjs.Tween.get(card.imgContainer)
                        .call(()=>{cardContainer.setChildIndex(card.imgContainer,cardContainer.numChildren-1)})
                        .to({x:toX,y:toY,rotation:0},500,createjs.Ease.cubicOut)
                        .call(()=>{resolve()});
                }); 
        },
        fromDD:(card: Card)=>{
            cardContainer.setChildIndex(card.imgContainer,cardContainer.numChildren-1);
            const PromiseArray :Promise<unknown>[] = [];
            game.DD.map((card, index, array) => {
                const twPromise = () => {
                    return new Promise((resolve, reject) => {
                    createjs.Tween.get(card.imgContainer)
                        .to({x:game.displayOrder.dd[0][0]+index*0.5,y:game.displayOrder.dd[0][1]-index*0.5})
                        .call(()=>{cardContainer.setChildIndex(card.imgContainer,cardContainer.numChildren - array.length + index)})
                        .call(()=>{resolve()});                
                    });
                };
                PromiseArray.push(twPromise());
            });
            return Promise.all(PromiseArray);
        },
        toDECK:(card: Card)=>{
            const toX : number = game.displayOrder.deck[0][0]+(game.DECK.length-1)*0.5
            const toY : number = game.displayOrder.deck[0][1]-(game.DECK.length-1)*0.5
            return new Promise((resolve, reject) => {
                if (card.face=="UP"){
                    cardFlip(card);
                };
                createjs.Tween.get(card.imgContainer)
                    .call(()=>{cardContainer.setChildIndex(card.imgContainer,cardContainer.numChildren-1)})
                    .to({x:toX,y:toY,rotation:0},500,createjs.Ease.cubicOut)
                    .call(()=>{resolve()});
            }); 
        },
    };

    /**
     * カードの移動
     */
    const moveCard = {
        HAND:{
            toBOARD:async(card: Card, position: "ATK"|"DEF"|"SET")=>{
                if(card instanceof MonsterCard){
                    await LocationSetting(card,"MO");
                }else{
                    await LocationSetting(card,"ST");
                };
                await Promise.all([animationHandAdjust(), Animation.toBOARD(card, position)])
            },

            toGY:async(card: Card) => {
                await LocationSetting(card,"GY");
                await Promise.all([animationHandAdjust(),Animation.toGY(card)]);
            },
            toDD:async(card: Card) => {
                await LocationSetting(card,"DD");
                await Promise.all([animationHandAdjust(),Animation.toDD(card)]);
            },
        },
        DECK:{
            toHAND:async(card: Card)=>{
                await LocationSetting(card,"HAND");
                await animationHandAdjust();
            },
            toGY:async(card: Card)=>{
                await LocationSetting(card,"GY");
                await Animation.toGY(card);
            },
            toBOARD:async(card: Card, position: "ATK"|"DEF"|"SET")=>{
                if(card instanceof MonsterCard){
                    await LocationSetting(card,"MO");
                }else{
                    await LocationSetting(card,"ST");
                };
                await Promise.all([Animation.toBOARD(card, position)])
            },
            toDD:async(card: Card)=>{
                await LocationSetting(card,"DD");
                await Animation.toDD(card);
            },
        },
        BOARD:{
            toGY:async(card: Card) => {
                if(["ST","MO","FIELD"].includes(card.location)){
                    await LocationSetting(card,"GY")
                    await Animation.toGY(card); 
                };
            },
            toDD:async(card: Card) => {
                if(["ST","MO","FIELD"].includes(card.location)){
                    await LocationSetting(card,"DD")
                    await Animation.toDD(card); 
                };
            },
            toHAND:async(card: Card)=>{
                await LocationSetting(card,"HAND")
                await animationHandAdjust();
            },
        },
        GY:{
            toBOARD:async(card: Card, position: "ATK"|"DEF"|"SET")=>{
                if(card instanceof MonsterCard){
                    await LocationSetting(card,"MO")
                }else{
                    await LocationSetting(card,"ST")
                };
                // await Promise.all([Animation.fromGY(card), Animation.toBOARD(card, position)]);
                await Animation.toBOARD(card, position);
                await Animation.fromGY(card);
            },
            toHAND:async(card: Card)=>{
                await LocationSetting(card,"HAND");
                // await Promise.all([animationHandAdjust(),Animation.fromGY(card)]);
                await animationHandAdjust();
                await Animation.fromGY(card);
            },
            toDD:async(card: Card) => {
                await LocationSetting(card,"DD");
                // await Promise.all([Animation.toDD(card),Animation.fromGY(card)]);
                await Animation.toDD(card);
                await Animation.fromGY(card);
            },
            toDECK:async(card: Card) => {
                await LocationSetting(card,"DECK");
                // await Promise.all([Animation.toDECK(card),Animation.fromGY(card)]);
                await Animation.toDECK(card);
                await Animation.fromGY(card);
            },
        },
        DD:{
            toHAND:async(card: Card)=>{
                await LocationSetting(card,"HAND")
                await animationHandAdjust();
                await Animation.fromDD(card);
            },
            toBOARD:async(card: Card, position: "ATK"|"DEF"|"SET")=>{
                if(card instanceof MonsterCard){
                    await LocationSetting(card,"MO")
                }else{
                    await LocationSetting(card,"ST")
                };
                await Animation.toBOARD(card, position);
                await Animation.fromDD(card);
            },
        },
    };

    /**
     * チェーンに乗る効果発動アニメーション
     */
    const animationChainEffectActivate = async(eff: effect) => {
        const chainNumber = (chainNum:Number,eff: effect)=>{
            const newText = new createjs.Text(chainNum.toString(), "100px serif", "DarkRed");
            newText.textAlign = "center";
            newText.textBaseline = "middle";
            newText.scaleX = 3;
            newText.scaleY = 3;
            newText.x = eff.card.imgContainer.x;
            newText.y = eff.card.imgContainer.y;
            newText.alpha = 0;
            return newText
        };

        const effImg = new createjs.Bitmap(eff.card.imageFileName);
        effImg.regX = cardImgSize.x/2;
        effImg.regY = cardImgSize.y/2;
        effImg.x = eff.card.imgContainer.x;
        effImg.y = eff.card.imgContainer.y;
        mainstage.addChild(effImg);
        const cardPromise =  new Promise((resolve, reject) => {
            createjs.Tween.get(effImg)
                .to({scaleX:3,scaleY:3,alpha:0},500,createjs.Ease.cubicOut)
                .call(()=>{mainstage.removeChild(effImg)})
                .call(()=>{resolve()});
        });
        const chainPromise =  new Promise(async(resolve, reject) => {
            if(game.chain.length==1){
                await new Promise(async(resolve, reject) => {
                    game.chain[0].chainBrock = chainNumber(1,game.chain[0])
                    mainstage.addChild(game.chain[0].chainBrock);
                    createjs.Tween.get(game.chain[0].chainBrock)
                        .to({scaleX:1,scaleY:1,alpha:1},500,createjs.Ease.cubicIn)
                        .call(()=>{resolve()});
                });
                await new Promise(async(resolve, reject) => {
                    eff.chainBrock = chainNumber(2,eff);
                    mainstage.addChild(eff.chainBrock);
                    createjs.Tween.get(eff.chainBrock)
                        .to({scaleX:1,scaleY:1,alpha:1},500,createjs.Ease.cubicIn)
                        .call(()=>{resolve()});
                });
            }else if(2<=game.chain.length){
                await new Promise(async(resolve, reject) => {
                    eff.chainBrock = chainNumber(game.chain.length+1,eff);
                    mainstage.addChild(eff.chainBrock);
                    createjs.Tween.get(eff.chainBrock)
                        .to({scaleX:1,scaleY:1,alpha:1},500,createjs.Ease.cubicIn)
                        .call(()=>{resolve()});
                });
            };
            resolve();
        });

        await cardPromise;
        await chainPromise;
        return
    };

    /**
     * チェーンブロック解決アニメーション
     */
    const animationchainResolve = async(eff: effect)=>{
        if(eff.chainBrock){
            await new Promise(async(resolve, reject) => {
                createjs.Tween.get(eff.chainBrock)
                    .to({scaleX:3,scaleY:3,alpha:0},500,createjs.Ease.cubicOut)
                    .call(()=>{
                        mainstage.removeChild(eff.chainBrock)
                        eff.chainBrock = void(0)
                    })
                    .call(()=>{resolve()});
            });
        };
    };

    /**
     * 対象をとるアニメーション
     */
    const animationEffectTarget = (cardArray: Card[]) => {
        const genAimImg = ()=>{
            const aimImg = new createjs.Bitmap("aimingMark.png");
            aimImg.setTransform(0, 0, 3, 3);
            aimImg.regX = 64;
            aimImg.regY = 64;
            aimImg.alpha = 0;
            createjs.Ticker.addEventListener("tick", handleTick);
            function handleTick(){
                aimImg.rotation += 2;
            };
            return aimImg
        };
        
        return new Promise<void>(async(resolve, reject) => {
            await (async () => {
                for(let card of cardArray){
                    await new Promise(async(resolve, reject) => {
                        if(card.location=="GY"){
                            game.GY.splice(game.GY.lastIndexOf(card), 1);
                            game.GY.push(card);
                            game.GY.map((c, index, array) => {
                                createjs.Tween.get(c.imgContainer)
                                .to({x:game.displayOrder.gy[0][0]+index*0.5,y:game.displayOrder.gy[0][1]-index*0.5})
                                .call(()=>{cardContainer.setChildIndex(c.imgContainer,cardContainer.numChildren - array.length + index)})             
                            });
                        }else if(card.location=="DD"){
                            game.DD.splice(game.DD.lastIndexOf(card), 1);
                            game.DD.push(card);
                            game.DD.map((c, index, array) => {
                                createjs.Tween.get(c.imgContainer)
                                .to({x:game.displayOrder.dd[0][0]+index*0.5,y:game.displayOrder.dd[0][1]-index*0.5})
                                .call(()=>{cardContainer.setChildIndex(c.imgContainer,cardContainer.numChildren - array.length + index)})             
                            });
                        };
                        const aimImg = genAimImg();
                        card.imgContainer.addChild(aimImg);
                        createjs.Tween.get(aimImg)
                            .to({scaleX:0.8,scaleY:0.8,alpha:1},250,createjs.Ease.cubicIn)
                            .wait(1000)
                            .to({alpha:0},250)
                            .call(()=>{card.imgContainer.removeChild(aimImg)})
                            .call(()=>{resolve()});
                    });
                };
            })();
            resolve();
        });
    };

    /**
     * 手札の魔法発動
     */
    const handSpellActivate = async(card: SpellCard) => {
        cardContainer.mouseEnabled = false;
        const Effect = card.effect.find(Eff => Eff.effType == "CardActived")
        const ActivedEffect = {...Effect,targetCard:[],costCard:[]}
        game.nowTime = new Time;
        await moveCard.HAND.toBOARD(card,"ATK");
        await animationChainEffectActivate(ActivedEffect);
        await ActivedEffect.whenActive(ActivedEffect);
        game.timeArray.push({...game.nowTime});
        game.chain.push(ActivedEffect);
        await TriggerQuickeEffect();
        cardContainer.mouseEnabled = !(game.liblaryOut);
        return
    };

    /**
     * 墓地の起動効果発動
     */
    const GyEffActivate = async() => {
        cardContainer.mouseEnabled = false;;
        const AllGyIgnition = (()=>{
            const tmpArray :effect[] = [];
            game.GY.map((card,index,array)=>{
                tmpArray.push(
                    ...(
                        card.effect.filter(eff => 
                        eff.effType == "Ignition" &&
                        eff.range.includes("GY") )
                    )
                );
            });
            return tmpArray
        })();
        const selectedCard = await selectActivateCard(AllGyIgnition,true);
        if(selectedCard){
            const Effect = canActiveEffects(selectedCard).pop();
            const ActivedEffect = {...Effect,targetCard:[],costCard:[]}
            game.nowTime = new Time;
            await animationChainEffectActivate(ActivedEffect);
            await ActivedEffect.whenActive(ActivedEffect);
            game.timeArray.push({...game.nowTime});
            game.chain.push(ActivedEffect);
            await TriggerQuickeEffect();
        };
        cardContainer.mouseEnabled = !(game.liblaryOut);
        return
    };

    /**
     * 場の起動効果発動
     */
    const BoardIgnitionActivate = async(card:Card) => {
        cardContainer.mouseEnabled = false;
        const Effect = card.effect.find(Eff => Eff.effType == "Ignition")
        const ActivedEffect = {...Effect,targetCard:[],costCard:[]}
        game.nowTime = new Time;
        game.nowTime.effectActived.push({
            card:ActivedEffect.card,
            eff:ActivedEffect
        });
        await animationChainEffectActivate(ActivedEffect);
        await ActivedEffect.whenActive(ActivedEffect);
        game.timeArray.push({...game.nowTime});
        game.chain.push(ActivedEffect);
        await TriggerQuickeEffect();
        cardContainer.mouseEnabled = !(game.liblaryOut);
        return
    };

    /**
     * セットした魔法発動
     */
    const fieldSpellActivate =  async(card: SpellCard) => {
        cardContainer.mouseEnabled = false;
        const Effect = card.effect.find(Eff => Eff.effType == "CardActived")
        const ActivedEffect = {...Effect,targetCard:[],costCard:[]}
        game.nowTime = new Time;
        if (card.face=="DOWN"){
            await cardFlip(card)
        };
        game.nowTime = new Time;
        game.nowTime.effectActived.push({
            card:ActivedEffect.card,
            eff:ActivedEffect
        });
        await animationChainEffectActivate(ActivedEffect);
        await ActivedEffect.whenActive(ActivedEffect);
        game.timeArray.push({...game.nowTime});
        game.chain.push(ActivedEffect);
        await TriggerQuickeEffect();
        cardContainer.mouseEnabled = !(game.liblaryOut);
        return
    };

    /**
     * 魔法罠セット
     */
    const SpellTrapSet = {
        fromHAND:async(card: SpellCard|TrapCard) => {
            cardContainer.mouseEnabled = false;
            await moveCard.HAND.toBOARD(card,"SET");
            // game.timeArray.push({...game.nowTime});
            await TriggerQuickeEffect();
            cardContainer.mouseEnabled = !(game.liblaryOut);
        },
    };

    /**
     * 特殊召喚する
     */
    const SpecialSummon = {
        fromGY: async(cardArray:Card[],posiSelect:boolean,position?:"ATK"|"DEF") => {
            await (async () => {
                for(let card of cardArray) {
                    if(card instanceof MonsterCard){
                        const posi = await (async()=>{
                            if(posiSelect){
                                return await OpenPositionWindow(card);
                            }else{
                            return position;
                            };
                        })();

                        await moveCard.GY.toBOARD(card,posi);
                        card.position=posi;
                        console.log("SS "+ card.cardName + " fromGY " + posi);
                        console.log("location " + card.location); 
                        game.nowTime.summon.push({
                            type: "SS",
                            card: card,
                            position: posi,
                            face: card.face,
                            from: "GY"
                        });
                        game.nowTime.move.push({
                            card:card,
                            from:"GY",
                            to:"MO"
                        });
                    };
                };
            })();          
    
            console.log(game.nowTime);
            await ContinuousEffect(game.nowTime);
            game.timeArray.push(game.nowTime)
            if(game.chain.length==0){
                await TriggerQuickeEffect()
                game.timeArray.map(time=>console.log(time))
            };
        },
        fromDD: async(cardArray:Card[],posiSelect:boolean,position?:"ATK"|"DEF") => {
            await (async () => {
                for(let card of cardArray) {
                    if(card instanceof MonsterCard){
                        const posi = await (async()=>{
                            if(posiSelect){
                                return await OpenPositionWindow(card);
                            }else{
                            return position;
                            };
                        })();

                        await moveCard.DD.toBOARD(card,posi);
                        card.position=posi;
                        console.log("SS "+ card.cardName + " fromDD " + posi);
                        console.log("location " + card.location); 
                        game.nowTime.summon.push({
                            type: "SS",
                            card: card,
                            position: posi,
                            face: card.face,
                            from: "DD"
                        });
                        game.nowTime.move.push({
                            card:card,
                            from:"DD",
                            to:"MO"
                        });
                    };
                };
            })();          
            console.log(game.nowTime);
            await ContinuousEffect(game.nowTime);
            game.timeArray.push(game.nowTime)
            if(game.chain.length==0){
                await TriggerQuickeEffect()
                game.timeArray.map(time=>console.log(time))
            };
        },
        fromDECK: async(cardArray:Card[],posiSelect:boolean,position?:"ATK"|"DEF") => {
            await (async () => {
                for(let card of cardArray) {
                    if(card instanceof MonsterCard){
                        const posi = await (async()=>{
                            if(posiSelect){
                                return await OpenPositionWindow(card);
                            }else{
                            return position;
                            };
                        })();

                        await moveCard.DECK.toBOARD(card,posi);
                        card.position=posi;
                        console.log("SS "+ card.cardName + " fromDECK " + posi);
                        console.log("location " + card.location); 
                        game.nowTime.summon.push({
                            type: "SS",
                            card: card,
                            position: posi,
                            face: card.face,
                            from: "DECK"
                        });
                        game.nowTime.move.push({
                            card:card,
                            from:"DECK",
                            to:"MO"
                        });
                    };
                };
            })();          
    
            console.log(game.nowTime);
            await ContinuousEffect(game.nowTime);
            game.timeArray.push(game.nowTime)
            if(game.chain.length==0){
                await TriggerQuickeEffect()
                game.timeArray.map(time=>console.log(time))
            };
        },
        fromHAND:async(cardArray:Card[],posiSelect:boolean,position?:"ATK"|"DEF") => {
            await (async () => {
                for(let card of cardArray) {
                    if(card instanceof MonsterCard){
                        const posi = await (async()=>{
                            if(posiSelect){
                                return await OpenPositionWindow(card);
                            }else{
                            return position;
                            };
                        })();
                        await moveCard.HAND.toBOARD(card,posi);
                        card.position=posi;
                        console.log("SS "+ card.cardName + " fromHAND " + posi);
                        console.log("location " + card.location); 
                        game.nowTime.summon.push({
                            type: "SS",
                            card: card,
                            position: posi,
                            face: card.face,
                            from: "HAND"
                        });
                        game.nowTime.move.push({
                            card:card,
                            from:"HAND",
                            to:"MO"
                        });
                    };
                };
            })();
            console.log(game.nowTime);
            await ContinuousEffect(game.nowTime);
            game.timeArray.push(game.nowTime)
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
        cardContainer.mouseEnabled = false;
        const numberToRelease :number = (()=>{
            if(5<=card.level && card.level<=6){
                return 1;
            }else if(7<=card.level){
                return 2;
            }else{
                return 0;
            };
        })();

        if(5<=card.level){
            const cardlist = genCardArray({location:["MO"]});
            const tmpCard = new Card;
            const tmpEff = new effect(tmpCard);

            await new Promise(async(resolve, reject) => {
                tmpEff.targetCard = await openCardListWindow.select(cardlist,numberToRelease,numberToRelease,tmpEff,"リリースするモンスターを"+numberToRelease+"体選択してください");
                console.log("Release " + tmpEff.targetCard.map(({ cardName }) => cardName));
                game.nowTime = new Time;
                await release(tmpEff.targetCard,"ADVANCE")
                game.timeArray.push({...game.nowTime});
                resolve();
            });
        };

        game.normalSummon = false;
        game.countNS += 1;
        card.NSed=true;
        if(position=="ATK"){
            card.position=position;
        };
        if(position=="SET"){
            card.position="DEF";
        };

        game.nowTime = new Time;
        await moveCard.HAND.toBOARD(card,position);
        game.nowTime.summon.push({
            card:card,
            type: "NS",
            position: card.position,
            face: card.face,
            from:"HAND",
        });
        game.nowTime.move.push({
            card:card,
            from:"HAND",
            to:"MO"
        });
        game.timeArray.push({...game.nowTime});

        console.log("NS " + position);
        console.log("location " + card.location);

        await ContinuousEffect(game.nowTime);
        await TriggerQuickeEffect()
        cardContainer.mouseEnabled = !(game.liblaryOut);
        game.timeArray.map(time=>console.log(time))
    };
    
    /**
     * 通常召喚可能か判定する
     */
    const JudgeNS = (card : MonsterCard) => {
        const countMonster:number = genCardArray({location:["MO"]}).length;
        const NSbool = (card.canNS && game.normalSummon);
        
        if(card.level<=4){
            if(countMonster==5){
            return false;
            }else{
               return(NSbool); 
            };
        }else if(5<=card.level && card.level<=6){
            return(NSbool && 1<=countMonster);
        }else{
            return(NSbool && 2<=countMonster);
        };
    };

    /**
     * 魔法罠のカード発動場所判定
     */
    const JudgeSpellTrapActivateLoc = (card : SpellCard) => {
        return card.location=="HAND"||(card.location=="ST"&&card.face=="DOWN")
    };

    /**
     * ライフコストを払う
     */
    const payLife = async(cost:number)=>{
        if(!game.payLPcost){
            return
        };
        const LPtext = new createjs.Text("-"+cost.toFixed(), "80px serif","black");
        LPtext.textBaseline = "middle";
        LPtext.textAlign = "center";
        LPtext.x = game.centerGrid.x;
        LPtext.y = game.centerGrid.y;
        mainstage.addChild(LPtext);
        await timeout(500);
        await new Promise<void>(async(resolve, reject) => {
            createjs.Tween.get(LPtext)
            .to({alpha:0},500)
            .call(()=>{resolve()})
            .call(()=>{mainstage.removeChild(LPtext)});
        });
        createjs.Tween.get(game)
            .to({myLifePoint:game.myLifePoint-cost},1000,createjs.Ease.cubicOut);
        return
    };

    /**
     * ダメージを与える
     */
    const dealDamage = async(point:number)=>{
        const LPtext = genCenterText("-"+point.toFixed());
        LPtext.color = "red";
        LPtext.x = game.centerGrid.x;
        LPtext.y = game.centerGrid.y;
        mainstage.addChild(LPtext);
        await timeout(500);
        await new Promise<void>(async(resolve, reject) => {
            createjs.Tween.get(LPtext)
            .to({alpha:0},500)
            .call(()=>{resolve()})
            .call(()=>{mainstage.removeChild(LPtext)});
        });
        createjs.Tween.get(game)
            .to({enemyLifePoint:game.enemyLifePoint-point},1000,createjs.Ease.cubicOut);
        return
    };

    /**
     * 手札を捨てる
     */
    const discard = async(cardArray : Card[]) => {
        await (async () => {
            for(let card of [...cardArray].reverse()){
                await moveCard.HAND.toGY(card);
                game.nowTime.discard.push({
                    card:card
                });
                game.nowTime.move.push({
                    card:card,
                    from:"HAND",
                    to:"GY"
                });
            };
        })();
        await ContinuousEffect(game.nowTime);
    };

    /**
     * 除外する
     */
    const vanish = async(cardArray:Card[],by:"EFFECT"|"COST") => {
        await (async () => {
            for(let card of cardArray){
                card.canVanish = false ;
                card.canDestroy = false ;
                const from = (()=>{
                    if(["MO","ST","FIELD"].includes(card.location)){
                        return "BOARD"
                    }else{
                        return card.location;
                    }
                })();
                game.nowTime.vanish.push({
                    card:card,
                    by:by
                });
                await ContinuousEffect(game.nowTime);
                if(["ST","MO","FIELD"].includes(card.location)){
                    game.nowTime.leaveBoard.push({
                        card:card
                    });
                    await ContinuousEffect(game.nowTime);
                };
                game.nowTime.move.push({
                    card:card,
                    from:from,
                    to:"DD"
                });
                await moveCard[from].toDD(card);
                console.log("vanish "+card.cardName+" by "+by);
                await ContinuousEffect(game.nowTime);
            };
        })();
        await ContinuousEffect(game.nowTime);
        cardArray.forEach(card=>{
            card.canVanish = true;
            card.canDestroy = true;
        });
    };

    /**
     * デッキトップに置く
     */
    const returnDecktop = async(cardArray : Card[]) => {
        await (async () => {
            for(let card of cardArray){
                const from = (()=>{
                    if(["MO","ST","FIELD"].includes(card.location)){
                        return "BOARD"
                    }else{
                        return card.location;
                    }
                })();
                game.nowTime.move.push({
                    card:card,
                    from:from,
                    to:"DECK"
                });
                if(moveCard[from].toDECK instanceof Function){
                    await moveCard[from].toDECK(card);
                };
                
            };
        })();
        await ContinuousEffect(game.nowTime);
    };

    /**
     * バウンス
     */
    const bounce = async(cardArray :Card[],by :"EFFECT"|"COST") => {
        await (async () => {
            for(let card of cardArray){
                game.nowTime.bounce.push({
                    card:card,
                    by:by
                });
                await ContinuousEffect(game.nowTime);
                if(["ST","MO","FIELD"].includes(card.location)){
                    game.nowTime.leaveBoard.push({
                        card:card
                    });
                    await ContinuousEffect(game.nowTime);
                };

                if(["ST","MO","FIELD"].includes(card.location)){
                    game.nowTime.move.push({
                        card:card,
                        from:"BOARD",
                        to:"HAND"
                    });
                    await moveCard.BOARD.toHAND(card);
                    await ContinuousEffect(game.nowTime);
                };
            };
        })();
        await ContinuousEffect(game.nowTime);
    };

    /**
     * リリースする
     */
    const release = async(cardArray : Card[],by:"ADVANCE"|"EFFECT"|"RULE"|"COST") => {
        await (async () => {
            for(let card of cardArray){
                card.canDestroy = false ;
                game.nowTime.release.push({
                    card:card,
                    by:by
                });
                await ContinuousEffect(game.nowTime);

                if(["ST","MO","FIELD"].includes(card.location)){
                    game.nowTime.leaveBoard.push({
                        card:card
                    });
                    await ContinuousEffect(game.nowTime);
                };

                if(["ST","MO","FIELD"].includes(card.location)){
                    await moveCard.BOARD.toGY(card);
                    game.nowTime.move.push({
                        card:card,
                        from:"BOARD",
                        to:"GY"
                    });
                    await ContinuousEffect(game.nowTime);
                };
            };
        })();
        await ContinuousEffect(game.nowTime);
        cardArray.forEach(card=>{
            card.canDestroy = true;
        });
    };

    /**
     * 破壊する
     */
    const destroy = async(cardArray : Card[],by:"BATTLE"|"EFFECT"|"RULE") => {
        const destroyAnimation = (card:Card)=>{
            return new Promise<void>(async(resolve, reject) => {
                const destroyImg = new createjs.Bitmap("destroy.png");
                destroyImg.setTransform(card.imgContainer.x, card.imgContainer.y,0,0);
                destroyImg.regX = 64;
                destroyImg.regY = 64;
                destroyImg.mouseEnabled = false;
                destroyImg.alpha = 0;
                mainstage.addChild(destroyImg);

                await new Promise(async(resolve, reject) => {
                    createjs.Tween.get(destroyImg)
                        .to({alpha:1,scaleX:2,scaleY:2},250)
                        .to({alpha:0},250)
                        .wait(250)
                        .call(()=>{mainstage.removeChild(destroyImg)})
                        .call(()=>{resolve()});
                });
                resolve();
            });
        };

        await (async () => {
            for(let card of cardArray){
                card.canDestroy = false ;

                game.nowTime.destroy.push({
                    card:card,
                    by:by
                });
                if(by=="BATTLE"||by=="EFFECT"){
                    console.log("destroy "+card.cardName+" by "+by);
                }else if(by=="RULE"){
                    console.log("destroy "+card.cardName+" lost equip target");
                };
                if(["ST","MO","FIELD"].includes(card.location)){
                    await destroyAnimation(card);
                    await ContinuousEffect(game.nowTime);
                };

                if(["ST","MO","FIELD"].includes(card.location)){
                    game.nowTime.leaveBoard.push({
                        card:card
                    });
                    await ContinuousEffect(game.nowTime);
                };

                if(["ST","MO","FIELD"].includes(card.location)){
                    await moveCard.BOARD.toGY(card);
                    game.nowTime.move.push({
                        card:card,
                        from:"BOARD",
                        to:"GY"
                    });
                    await ContinuousEffect(game.nowTime);
                };
            };
        })();
        await ContinuousEffect(game.nowTime);
        cardArray.forEach(card=>{
            card.canDestroy = true;
        });
    };

    /**
     * 装備マーク生成
     */
    const genEquipImg = (card:Card)=>{
        const equipImg = new createjs.Bitmap("equip.png");
        equipImg.setTransform(card.imgContainer.x, card.imgContainer.y, 0.5, 0.5);
        equipImg.regX = 64;
        equipImg.regY = 64;
        equipImg.mouseEnabled = false;
        return equipImg
    };

    /**
     * 装備する
     */
    const Equip = async(card:SpellCard,eff: effect)=>{
        card.peggingTarget = eff.targetCard;
        const targetCard = card.peggingTarget[0];
        if(targetCard instanceof MonsterCard){
            targetCard.equip.push(card);
        };

        return new Promise<void>(async(resolve, reject) => {
            await new Promise(async(resolve, reject) => {
                const equipImg = genEquipImg(card);
                equipImg.alpha = 0;
                mainstage.addChild(equipImg);
                createjs.Tween.get(equipImg)
                    .to({alpha:1,scaleX:1,scaleY:1},250)
                    .to({x:targetCard.imgContainer.x,y:targetCard.imgContainer.y},500)
                    .to({scaleX:0.7,scaleY:0.7},250)
                    .wait(250)
                    .call(()=>{mainstage.removeChild(equipImg)})
                    .call(()=>{resolve()});
            });

            const equipMarkSPELL = genEquipImg(card);
            const equipMarkMON = genEquipImg(targetCard);

            card.imgContainer.addEventListener("mouseover", handleEquipSpellMover);
            function handleEquipSpellMover(event) {
                if(card.peggingTarget.length>0){
                    mainstage.addChild(equipMarkSPELL);
                    mainstage.addChild(equipMarkMON);
                }; 
            };
            card.imgContainer.addEventListener("mouseout", handleEquipMout);
            function handleEquipMout(event) {
                if(card.peggingTarget.length>0){
                    mainstage.removeChild(equipMarkSPELL);
                    mainstage.removeChild(equipMarkMON);                    
                };
            };
            resolve();
        });
    };


    /**
     * デッキをシャッフルする
     */
    function deckShuffle(){
        if(game.DECK.length <= 1) {
            return false;
        };
        game.DECK = shuffle(game.DECK);
        const PromiseArray :Promise<unknown>[] = [];
        game.DECK.map((card, index, array) => {
            const twPromise = () => {
                return new Promise((resolve, reject) => {
                const orgX = card.imgContainer.x;
                createjs.Tween.get(card.imgContainer)
                    .wait(index*(100/array.length))
                    .to({x:orgX+100-(200*(index%2))},100)
                    .to({x:orgX-100+(200*(index%2))},200)
                    .to({x:game.displayOrder.deck[0][0]+index*0.5,y:game.displayOrder.deck[0][1]-index*0.5},100)
                    .call(()=>{cardContainer.setChildIndex(card.imgContainer,cardContainer.numChildren - array.length + index)})
                    .call(()=>{resolve()});                
                });
            };
            PromiseArray.push(twPromise());
        });
        return Promise.all(PromiseArray); 
    };

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
    };

    /**
     * gamestart時のデッキセットアニメーション
     */
    const decksetAnimation=async()=>{
        const randomIndex = (()=>{
            const defaultArray = [...Array(40).keys()];
            for (let i = defaultArray.length - 1; i >= 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [defaultArray[i], defaultArray[j]] = [defaultArray[j], defaultArray[i]];
            };
            return defaultArray
        })();
        await (async () => {
            for(let i of randomIndex) {
                await LocationSetting(game.defaultDeck[i],"DECK")
                new Promise((resolve, reject) => {
                    if (game.defaultDeck[i].face=="UP"){
                        cardFlip(game.defaultDeck[i])
                    };
                    createjs.Tween.get(game.defaultDeck[i].imgContainer)
                        .call(()=>{cardContainer.setChildIndex(game.defaultDeck[i].imgContainer,cardContainer.numChildren-1)})
                        .to({x:game.displayOrder.deck[0][0],y:game.displayOrder.deck[0][1],rotation:0},500,createjs.Ease.quintOut)
                        .call(()=>{resolve()});
                }); 
                await timeout(25);
            };
        })();  
    };

    /**
     * スタート画面でカードを並べる
     */
    const lineUp=()=>{
        const reference = {x:85+cardImgSize.x/2,y:25+cardImgSize.y/2};
        game.defaultDeck.forEach((card,i,a)=>{
            if(i<=9){
                puton(cardContainer,card,reference.x+((cardImgSize.x*0.75)*i),reference.y)
            }else if(10<=i && i<=19){
                puton(cardContainer,card,reference.x+((cardImgSize.x*0.75)*(i-10)),reference.y+(cardImgSize.y+10)*1)
            }else if(20<=i && i<=29){
                puton(cardContainer,card,reference.x+((cardImgSize.x*0.75)*(i-20)),reference.y+(cardImgSize.y+10)*2)
            }else if(30<=i){
                puton(cardContainer,card,reference.x+((cardImgSize.x*0.75)*(i-30)),reference.y+(cardImgSize.y+10)*3)
            };
            card.frontImg.scaleX = 1;
            card.cardBackImg.scaleX = 0;
            SetStatusDisprayEvent(card,card.imgContainer);
        });
        game.DECK = [...game.defaultDeck];
    };

    /**
     * 手札を現在のデータに合わせた位置に移動するアニメーション
     * 手札出し入れの際に呼ぶやつ
     */
    const animationHandAdjust = () => {  
        const PromiseArray :Promise<unknown>[] = [];
        game.HAND.map((card, index, array) => {
            const handPosition = (()=>{
                if(index<=7){
                    const leftEndPosition = game.displayOrder.hand[0] - ((game.HAND.length-1) - (game.HAND.length-8)*Math.sign(Math.trunc(game.HAND.length/8))) / 2*(cardImgSize.x+cardImgSize.margin);
                    return {
                        x:leftEndPosition + (cardImgSize.x+cardImgSize.margin)*index,
                        y:game.displayOrder.hand[1]
                    };
                }else{
                    const leftEndPosition = game.displayOrder.hand[0] - (game.HAND.length-1-8) / 2*(cardImgSize.x+cardImgSize.margin);
                    return {
                        x:leftEndPosition+((cardImgSize.x+cardImgSize.margin)*(index-8)),
                        y:game.displayOrder.hand[1]+cardImgSize.y+cardImgSize.margin
                    };
                };
            })();
            const twPromise = () => {
                return new Promise((resolve, reject) => {
                    createjs.Tween.get(card.imgContainer) 
                        .call(()=>{
                            if(card.face=="DOWN"){cardFlip(card)};
                        })
                        .to(handPosition,500,createjs.Ease.cubicInOut)
                        .call(()=>{resolve()});
                });
            };
            PromiseArray.push(twPromise());
        });
        return Promise.all(PromiseArray);
    };
   

    /**
     * デッキから任意の枚数をドローする
     */
    const draw = (count: number) => {
        // デッキ残り枚数以上のドローでライブラリアウト
        if(game.DECK.length < count) {
            console.log("LiblaryOut")
            game.liblaryOut = true;
            return new Promise<void>(async(resolve, reject) => {
                await (async () => {
                    for (let i = 0; i < game.DECK.length ; i++){
                        const targetCard = game.DECK[game.DECK.length -1];
                        await moveCard.DECK.toHAND(targetCard);
                        console.log("draw");
                    };
                })();
                const loseText = genCenterText("YOU LOSE");
                loseText.shadow = new createjs.Shadow("#000000", 0, 0, 10);
                loseText.x = game.centerGrid.x;
                loseText.y = game.centerGrid.y;
                loseText.font = "100px serif";
                openResultWindow(loseText);
                cardContainer.mouseEnabled = false;
                resolve();
            });
        };
        return new Promise<void>(async(resolve, reject) => {
            for (let i = 0; i < count ; i++){
                const targetCard = game.DECK[game.DECK.length -1];
                moveCard.DECK.toHAND(targetCard);
                console.log("draw");
            };
            await timeout(500);
            resolve();
        });
    };

    /**
     * デッキからサーチする
     */
    const search = (target: Card[]) => {
        console.log("function search")
        return new Promise<void>(async(resolve, reject) => {
            await (async () => {
                for(let card of target) {
                    if(game.DECK.includes(card)){
                        console.log("search "+card.cardName);
                        await moveCard.DECK.toHAND(card);
                    };
                };
            })();
            await deckShuffle();
            resolve();
        });
    };

    /**
     * チェーン1で優先権ある時発動できる効果リスト
     */
    const canActiveEffects =(card:Card)=>{
        return card.effect.filter(eff => 
            (eff.effType=="CardActived"||eff.effType=="Quick"||eff.effType=="Ignition") &&
            eff.actionPossible({}));
    };

    /**
     * 装備魔法が場から離れたとき装備解除する
     */
    const equipDisEnchant = (card:SpellCard) =>{
        const disEnchant = new effect(card);
        disEnchant.effType = "Rule";
        disEnchant.actionPossible = (time:Time) =>{
            const timeCondition = (()=>{
                const timeBoolArray :boolean[] = [];
                time.leaveBoard.forEach(tLeave=>{
                    timeBoolArray.push(tLeave.card==card );
                });
                return timeBoolArray.some(value => value);
            })();
            const boolarray = [
                card.peggingTarget.length>0,
                timeCondition
            ];
            return boolarray.every(value => value==true)
        };
        disEnchant.apply = () => {
            return new Promise<void>(async(resolve, reject) => {
                const equiptarget = card.peggingTarget[0];
                if(equiptarget instanceof MonsterCard){
                    equiptarget.buff = equiptarget.buff.filter(b=>b.eff.card!==card);
                    equiptarget.equip = equiptarget.equip.filter(e=>e!==card);
                };
                card.peggingTarget = [];
                console.log("disenchant");
                resolve();
            });
        };
        return disEnchant;
    };

    /**
     * 装備魔法の対象が消えたとき自身を破壊する効果
     */
    const equipDestroy = (card:SpellCard) =>{
        const EDeff = new effect(card);
        EDeff.effType = "Rule";
        EDeff.actionPossible = (time:Time) =>{
            const timeCondition = (()=>{
                const timeBoolArray :boolean[] = [];
                time.leaveBoard.forEach(tLeave=>{
                    timeBoolArray.push(card.peggingTarget.includes(tLeave.card));
                });
                return timeBoolArray.some(value => value);
            })();
            const boolarray = [
                card.canDestroy,
                card.peggingTarget.length==1,
                card.location=="ST",
                card.face=="UP",
                timeCondition
            ];
            return boolarray.every(value => value==true)
        };
        EDeff.apply = () => {
            return new Promise<void>(async(resolve, reject) => {
                if(card.location=="ST"){
                    await destroy([card],"RULE");
                };
                card.peggingTarget = [];
                resolve();
            });
        };
        return EDeff;
    };

    /**
     * カード毎の特殊召喚条件
     */
    const SSconditionSetting = {
        DOGMA:(card:MonsterCard)=>{
            card.RuleSScondition = ()=>{
                const boolarray = [
                    genCardArray({location:["MO"],category:["D-HERO"]}).length >= 1,
                    genCardArray({location:["MO"]}).length >= 3
                ];
                return boolarray.every(value => value==true)
            };
            card.RuleSSpromise = async()=>{
                const tmpEffA = new effect(new Card);
                const cardlistA = genCardArray({location:["MO"],category:["D-HERO"]});
                tmpEffA.targetCard = await openCardListWindow.select(cardlistA,1,1,tmpEffA,"リリースするD-HEROを"+1+"体選択してください");
                
                const tmpEffB = new effect(new Card);
                const cardlistB = genCardArray({location:["MO"]}).filter(card=>!( tmpEffA.targetCard.includes(card) ));
                tmpEffB.targetCard = await openCardListWindow.select(cardlistB,2,2,tmpEffB,"リリースするモンスターを"+2+"体選択してください");

                const releaseArray = tmpEffB.targetCard.concat(tmpEffA.targetCard);
                console.log("Release " + releaseArray.map(({ cardName }) => cardName))
                game.nowTime = new Time;
                await release(releaseArray,"COST")
                game.timeArray.push({...game.nowTime});
                await SpecialSummon.fromHAND([card],false,"ATK");
            };
        },
    };

    /**
     * フェイズ移行時のアニメーション
     */
    const shadPhase = async(phase:"DRAW PHASE"|"STANBY PHASE"|"MAIN PHASE"|"TURN END") => {
        const phaseText = genCenterText(phase);
        phaseText.shadow = new createjs.Shadow("#ffffff", 0, 0, 10);
        phaseText.x = -200;
        phaseText.y = game.centerGrid.y;
        mainstage.addChild(phaseText);
        await new Promise<void>(async(resolve, reject) => {
            createjs.Tween.get(phaseText)
            .to({x:game.centerGrid.x},250,createjs.Ease.cubicOut)
            .wait(750)
            .to({x:1800},250,createjs.Ease.cubicOut)
            .call(()=>{resolve()})
            .call(()=>{mainstage.removeChild(phaseText)});
        });
    };

    /**
     * デュエル開始
     */
    const gameStart = async()=>{
        cardContainer.mouseEnabled = false;;
        await decksetAnimation();
        await timeout(500);
        await deckShuffle();
        await draw(5);
        [myLP,EnemyLP,numOfcardsContainer,resetButton,endButton].forEach(obj=>{
            createjs.Tween.get(obj)
                .to({alpha:1},250);
        });
        await shadPhase("DRAW PHASE")
        await draw(1);
        game.firstHand = [...game.HAND].map(c=>c.cardNameJP);
        await shadPhase("STANBY PHASE");
        await shadPhase("MAIN PHASE");
        cardContainer.mouseEnabled = true;
    };

    /**
     * ターンエンド
     */
    const turnEnd = async()=>{
        cardContainer.mouseEnabled = false;;
        const dogmaArray = genCardArray({ID:["17132130"],location:["MO"],face:["UP"]});
        const magiexArray = genCardArray({ID:["32723153"],location:["ST"],face:["DOWN"]});
        await shadPhase("TURN END")
        await timeout(500)
        await (async () => {
            for (let i = 0; i < dogmaArray.length ; i++){
                await animationChainEffectActivate(dogmaArray[i].effect[0]);
                await dogmaArray[i].effect[0].whenResolve(dogmaArray[i].effect[0]);
                await timeout(500);
            };
        })();
        if(1<=magiexArray.length){
            if(genCardArray({location:["HAND"]}).length==0){
                await (async () => {
                    for (let i = 0; i < magiexArray.length ; i++){
                        // if(1<=game.enemyLifePoint){
                            await cardFlip(magiexArray[i]);
                            await animationChainEffectActivate(magiexArray[i].effect[0]);
                            await magiexArray[i].effect[0].whenResolve(magiexArray[i].effect[0]);
                            await moveCard.BOARD.toGY(magiexArray[i]);
                        // };
                    };
                })();
            }else{
                await openMessageWindow("手札が0枚でない為、MagicalExplosionを発動できません。")
            };
            await timeout(500);
        };
        const winLose = (()=>{
           if(game.enemyLifePoint<1){
               const WIN = genCenterText("YOU WIN !");
               WIN.color = "orangered"
                return WIN;
            }else{
                return genCenterText("YOU LOSE");
            }; 
        })()
        winLose.shadow = new createjs.Shadow("#000000", 0, 0, 10);
        winLose.x = game.centerGrid.x;
        winLose.y = game.centerGrid.y;
        winLose.font = "100px serif";
        openResultWindow(winLose);
    };

    /**
     * リセット
     */
    const reset = async()=>{
        cardContainer.mouseEnabled = false;;
        game.countNS = 0;
        game.normalSummon = true;
        game.myLifePoint = DEFAULT_LIFE;
        game.enemyLifePoint = DEFAULT_LIFE;
        game.payLPcost = true;
        game.liblaryOut = false;
        const returnCardArray = genCardArray({location:["HAND","MO","ST","FIELD","GY","DD"]});
        const randomIndex = (()=>{
            const defaultArray = [...Array(returnCardArray.length).keys()];
            for (let i = returnCardArray.length - 1; i >= 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [defaultArray[i], defaultArray[j]] = [defaultArray[j], defaultArray[i]];
            };
            return defaultArray
        })();
        await (async () => {
            for (let i of randomIndex){
                await LocationSetting(returnCardArray[i],"DECK");
                new Promise((resolve, reject) => {
                    const card = returnCardArray[i];
                    if(card instanceof MonsterCard && 1<=card.equip.length){
                        card.equip = [];
                    };
                    if(card instanceof SpellCard && 1<=card.peggingTarget.length){
                        card.peggingTarget = [];
                    };
                    if (returnCardArray[i].face=="UP"){
                        cardFlip(returnCardArray[i])
                    };
                    createjs.Tween.get(returnCardArray[i].imgContainer)
                        .call(()=>{cardContainer.setChildIndex(returnCardArray[i].imgContainer,cardContainer.numChildren-1)})
                        .to({x:game.displayOrder.deck[0][0],y:game.displayOrder.deck[0][1],rotation:0},500,createjs.Ease.quintOut)
                        .call(()=>{resolve()});
                }); 
                await timeout(25);                
            };
        })();
        await timeout(250);
        await deckShuffle();
        await draw(5);
        await shadPhase("DRAW PHASE")
        await draw(1);
        game.firstHand = [...game.HAND].map(c=>c.cardNameJP);
        await shadPhase("STANBY PHASE");
        await shadPhase("MAIN PHASE");
        cardContainer.mouseEnabled = true;;
    };
    
    /**
     * カード毎の効果
     */    
    interface effectSetting{
        [key: string]: Function;
        AIRMAN(arg:Card): effect[];
        DISK(arg:Card): effect[];
        DOGMA(arg:Card): effect[];
        KURAZ(arg:Card): effect[];
        CYBERVARY(arg:Card): effect[];
        MAGICIANOFCHAOS(arg:Card): effect[];
        REINFORCEMENT(arg:SpellCard): effect[];
        DESTINYDRAW(arg:SpellCard): effect[];
        MONSTERREBORN(arg:SpellCard): effect[];
        PREMATUREBRIAL(arg:SpellCard): effect[];
        MONSTERGATE(arg:SpellCard): effect[];
        PHENIXBLADE(arg:SpellCard): effect[];
        DIMENSIONFUSION(arg:SpellCard): effect[];
        REASONING(arg:SpellCard): effect[];
        DDR(arg:SpellCard): effect[];
        TRADEIN(arg:SpellCard): effect[];
        MAGICSTONEEXCAVATION(arg:SpellCard): effect[];
        HANDDESTRUCTION(arg:SpellCard): effect[];
        HURRICANE(arg:SpellCard): effect[];
        HIDDENARMORY(arg:SpellCard): effect[];
        SPELLECONOMICS(arg:SpellCard): effect[];
        GOLDSARCOPHAGUS(arg:SpellCard): effect[];
        MAGICALEXPLOSION(arg:TrapCard): effect[];
    };
    const effectSetting:effectSetting = {
        AIRMAN:(card:Card)=>{
            const eff1 = new effect(card);
            eff1.effType = "Trigger";
            eff1.whetherToActivate = "Any";
            eff1.range = ["MO"];
            const conditionA = ()=>{
                return 1<=genCardArray({category:["HERO"],location:["DECK"]}).length;
            };
             const conditionB = ()=>{
               return 1<=genCardArray({category:["HERO"],location:["MO"],face:["UP"]}).filter(c=>c!==card).length &&
                        1<=genCardArray({location:["ST"]}).length;  
            }; 
            eff1.modeText =()=>{
                if(conditionA() && conditionB()){
                    return "(HEROサーチ or 魔法罠破壊)"
                }else if(conditionA()){
                    return "(HEROサーチ)"
                }else if(conditionB()){
                    return "(魔法罠破壊)"
                }else{
                   return "" 
                };
            };
            eff1.actionPossible = (time:Time) =>{
                const timeCondition = (()=>{
                    const timeBoolArray :boolean[] = [];
                    time.summon.forEach(ts=>{
                        timeBoolArray.push(
                            [
                            ts.type=="NS"||ts.type=="SS",
                            ts.card== card,
                            ts.face== "UP",
                            ].every(value => value)
                        );
                    });
                    return timeBoolArray.some(value => value);
                })();
                const boolarray = [
                    timeCondition,
                    eff1.range.includes(card.location),
                    conditionA() || conditionB()
                ];
                return boolarray.every(value => value)
            };
            eff1.whenActive = (eff :effect) => {
                return new Promise(async(resolve, reject) => {
                    if(conditionA() && conditionB()){
                        eff.mode = await OpenSelectEffectWindow(card,`HEROを
手札に加える`,`このカード以外のHEROの数まで
魔法罠を破壊する`);
                    }else if(conditionA()){
                        eff.mode = true;
                    }else{
                        eff.mode = false;
                    };                    
                    resolve();
                });
            };
            eff1.whenResolve = (eff :effect) => {
                return new Promise<void>(async(resolve, reject) => {
                    game.nowTime = new Time;
                    if(eff.mode){
                        if(conditionA()){
                            const cardlist = genCardArray({category:["HERO"],location:["DECK"]});
                            eff.targetCard = await openCardListWindow.select(cardlist,1,1,eff,"手札に加えるHEROを選択してください");
                            await search(eff.targetCard);
                        };
                    }else{
                        if(conditionB()){
                            const countMax = genCardArray({category:["HERO"],location:["MO"],face:["UP"]}).filter(c=>c!==card).length;
                            const cardlist = genCardArray({location:["ST"]});
                            eff.targetCard = await openCardListWindow.select(cardlist,1,countMax,eff,"破壊するカードを選択してください");
                            await destroy(eff.targetCard,"EFFECT");
                        };
                    };
                    game.timeArray.push({...game.nowTime});
                    resolve(); 
                });
            };
            return [eff1];
        },
        DISK:(card:Card)=>{
            const eff1 = new effect(card)
            eff1.effType = "Trigger"
            eff1.whetherToActivate = "Forced"
            eff1.range = ["MO"]
            eff1.actionPossible = (time:Time) =>{
                const timeCondition = (()=>{
                    const timeBoolArray :boolean[] = [];
                    time.summon.forEach(ts=>{
                        timeBoolArray.push(
                            [
                            ts.type=="SS",
                            ts.from== "GY",
                            ts.card== card,
                            ts.face== "UP",
                            ].every(value => value)
                        );
                    });
                    return timeBoolArray.some(value => value);
                })();
                const boolarray = [
                    timeCondition,
                    eff1.range.includes(card.location),
                ];
                return boolarray.every(value => value)
            };
        
            eff1.whenActive = (eff :effect) => {
                return new Promise((resolve, reject) => {
                    resolve();
                });
            };
            eff1.whenResolve = (eff :effect) => {
                return new Promise<void>(async(resolve, reject) => {
                    game.nowTime = new Time;
                    await draw(2);
                    game.timeArray.push({...game.nowTime});
                    resolve();
                });
            };
            return [eff1];
        },
        DOGMA:(card:Card)=>{
            const eff1 = new effect(card)
            eff1.effType = "Trigger"
            eff1.whetherToActivate = "Forced"
            eff1.range = ["MO"]
            eff1.actionPossible = (time:Time) =>{
                return false
            };
            eff1.whenActive = (eff :effect) => {
                return new Promise((resolve, reject) => {
                    resolve();
                });
            };
            eff1.whenResolve = (eff :effect) => {
                return new Promise<void>(async(resolve, reject) => {
                    game.nowTime = new Time;
                    const damage = game.enemyLifePoint/2;
                    await dealDamage(damage);
                    game.timeArray.push({...game.nowTime});
                    resolve();
                });
            };
            return [eff1];
        },
        KURAZ:(card:Card)=>{
            const eff1 = new effect(card);
            eff1.effType = "Trigger";
            eff1.whetherToActivate = "Any"
            eff1.range = ["MO"]
            eff1.actionPossible = (time:Time) =>{
                const timeCondition = (()=>{
                    const timeBoolArray :boolean[] = [];
                    time.summon.forEach(ts=>{
                        timeBoolArray.push(
                            [
                            ts.type=="NS"||ts.type=="SS",
                            ts.card== card,
                            ts.face== "UP",
                            ].every(value => value)
                        );
                    });
                    return timeBoolArray.some(value => value);
                })();
        
                const boolarray = [
                    timeCondition,
                    eff1.range.includes(card.location),
                    genCardArray({location:["MO","ST","FIELD"]}).length > 0,
                ];
                return boolarray.every(value => value)
            };
            eff1.whenActive = (eff :effect) => {
                return new Promise(async(resolve, reject) => {
                    const cardlist = genCardArray({location:["MO","ST","FIELD"]});
                    eff.targetCard = await openCardListWindow.select(cardlist,1,2,eff,"破壊するカードを選択してください");
                    await animationEffectTarget(eff.targetCard);
                    resolve();
                });
            };
            eff1.whenResolve = (eff :effect) => {
                return new Promise<void>(async(resolve, reject) => {
                    game.nowTime = new Time;
                    const targetLocation = ["ST","MO","FIELD"]
                    const target = eff.targetCard.filter(card=>targetLocation.includes(card.location))
                    await destroy(target,"EFFECT");
                    if(target.length<=game.DECK.length){
                        if(await(openYesNoWindow("ドローしますか？"))){
                            await draw(target.length);
                        };
                    };
                    game.timeArray.push({...game.nowTime});
                    resolve();
                });
            };
            return [eff1];
        },
        CYBERVARY:(card:Card)=>{
            const eff1 = new effect(card);
            const conditionA = ()=>{
               return (genCardArray({location:["MO"]}).length >= 2 && game.DECK.length>=2);
            };
            const conditionB = ()=>{
              return (game.HAND.length>=1 && genCardArray({location:["GY"],cardType:["Spell"]}).length>=1);  
            } 
            eff1.effType = "Ignition";
            eff1.range = ["MO"];
            eff1.actionPossible = (time:Time) =>{
                const boolarray = [
                    eff1.range.includes(card.location),
                    card.face == "UP",
                    (conditionA() || conditionB())
                ];
                return boolarray.every(value => value==true)
            };
            eff1.whenActive = (eff :effect) => {
                return new Promise(async(resolve, reject) => {
                    if(conditionA() && conditionB()){
                        eff.mode = await OpenSelectEffectWindow(card,`このカードと他のモンスター1体を
除外し2枚ドローする`,`このカードと手札1枚を除外し
墓地のカードをデッキトップに置く`);
                    }else if(conditionA()){
                        eff.mode = true;
                    }else{
                        eff.mode = false;
                    };

                    if(eff.mode){
                        const cardlist = genCardArray({location:["MO"]}).filter(c=> c!=card);
                        eff.targetCard = await openCardListWindow.select(cardlist,1,1,eff,"除外するモンスターを1枚選択してください");
                        await animationEffectTarget(eff.targetCard);
                    }else{
                        const cardlist = genCardArray({location:["GY"]});
                        eff.targetCard = await openCardListWindow.select(cardlist,1,1,eff,"デッキトップに置くカードを"+1+"枚選択してください");
                    };
                    resolve();
                });
            };
            eff1.whenResolve = (eff :effect) => {
                return new Promise<void>(async(resolve, reject) => {
                    game.nowTime = new Time;
                    if(eff.mode){
                        await vanish(eff.targetCard,"EFFECT");
                        game.timeArray.push({...game.nowTime});
                        game.nowTime = new Time;
                        await draw(2);
                        game.timeArray.push({...game.nowTime});
                        resolve();
                    }else{
                        const tmpEff = new effect(new Card);
                        tmpEff.targetCard = await openCardListWindow.select(game.HAND,1,1,tmpEff,"除外する手札を1枚選択してください");
                        tmpEff.targetCard.push(card);
                        await vanish(tmpEff.targetCard,"EFFECT");
                        game.timeArray.push({...game.nowTime});
                        game.nowTime = new Time;
                        await returnDecktop(eff.targetCard);
                        await cardFlip(eff.targetCard[0]);
                        await timeout(500);
                        await cardFlip(eff.targetCard[0]);
                        game.timeArray.push({...game.nowTime});
                        resolve();
                    };
                });
            };
            return [eff1];
        },
        MAGICIANOFCHAOS:(card:Card)=>{
            const eff1 = new effect(card);
            eff1.effType = "Trigger";
            eff1.whetherToActivate = "Any";
            eff1.range = ["MO"];
            eff1.actionPossible = (time:Time) =>{
                const timeCondition = (()=>{
                    const timeBoolArray :boolean[] = [];
                    time.summon.forEach(ts=>{
                        timeBoolArray.push(
                            [
                            ts.type=="NS"||ts.type=="SS",
                            ts.card== card,
                            ts.face== "UP",
                            ].every(value => value)
                        );
                    });
                    return timeBoolArray.some(value => value);
                })();
                const boolarray = [
                    timeCondition,
                    eff1.range.includes(card.location),
                    genCardArray({cardType:["Spell"],location:["GY"]}).length > 0];
                return boolarray.every(value => value)
            };
            eff1.whenActive = (eff :effect) => {
                return new Promise(async(resolve, reject) => {
                    const cardlist = game.GY.filter(card=>card instanceof SpellCard);
                    eff.targetCard = await openCardListWindow.select(cardlist,1,1,eff,"手札に加える魔法を1枚選択してください");
                    await animationEffectTarget(eff.targetCard);
                    resolve()
                });
            };
            eff1.whenResolve = (eff :effect) => {
                return new Promise<void>(async(resolve, reject) => {
                    game.nowTime = new Time;
                    if(eff.targetCard[0].location=="GY"){
                        await moveCard.GY.toHAND(eff.targetCard[0]);
                        game.nowTime.move.push({
                            card:eff.targetCard[0],
                            from:"GY",
                            to:"HAND"
                        });
                        await ContinuousEffect(game.nowTime);
                    };
                    game.timeArray.push({...game.nowTime});
                    resolve();
                });
            };
            const eff2 = new effect(card);
            eff2.effType = "Continuous";
            eff2.actionPossible = (time:Time) =>{
                const timeCondition = (()=>{
                    const timeBoolArray :boolean[] = [];
                    time.leaveBoard.forEach(tLeave=>{
                        timeBoolArray.push(tLeave.card== card);
                    });
                    return timeBoolArray.some(value => value);
                })();
                const boolarray = [
                    card.location == "MO",
                    card.face=="UP",
                    card.canVanish,
                    timeCondition
                ];
                return boolarray.every(value => value==true)
            };
            eff2.apply = () => {
                return new Promise<void>(async(resolve, reject) => {
                    await vanish([card],"EFFECT");
                    resolve();
                });
            };
            return [eff1,eff2];
        },
        JUNKCOLLECTOR:(card:Card)=>{
            const eff1 = new effect(card);
            eff1.effType = "Ignition";
            eff1.range = ["MO"];
            eff1.actionPossible = (time:Time) =>{
                const boolarray = [
                    eff1.range.includes(card.location),
                    card.face == "UP",
                    1 <= genCardArray({location:["GY"],cardType:["Trap"]}).filter(trap=>trap.effect[0].copyCondition).length
                ];
                return boolarray.every(value => value==true)
            };
            eff1.whenActive = (eff :effect) => {
                return new Promise(async(resolve, reject) => {
                    const cardlist = genCardArray({location:["GY"],cardType:["Trap"]}).filter(trap=>trap.effect[0].copyCondition);
                    eff.targetCard = await openCardListWindow.select(cardlist,1,1,eff,"コピーする罠を1枚選択してください");
                    eff.targetCard.push(card);
                    await vanish(eff.targetCard,"COST");
                    resolve();
                });
            };
            eff1.whenResolve = async(eff :effect) => {
                return new Promise<void>(async(resolve, reject) => {
                    await eff.targetCard[0].effect[0].whenResolve(eff);
                    resolve();
                });
            };
            return [eff1]; 
        },
        REINFORCEMENT:(card:SpellCard)=>{
            const eff1 = new effect(card);
            eff1.effType = "CardActived";
            eff1.range = ["HAND","ST"];
            eff1.actionPossible = (time:Time) =>{
                const boolarray = [
                    JudgeSpellTrapActivateLoc(card),
                    genCardArray({race:["WARRIOR"],location:["DECK"]})
                                        .filter(card => card instanceof MonsterCard && card.level <= 4).length > 0
                ];
                return boolarray.every(value => value==true)
            };
            eff1.whenActive = (eff :effect) => {
                return new Promise((resolve, reject) => {
                    resolve();
                });
            };
            eff1.whenResolve = (eff :effect) => {
                return new Promise<void>(async(resolve, reject) => {
                    game.nowTime = new Time;
                    const cardlist = genCardArray({race:["WARRIOR"],location:["DECK"]})
                                        .filter(card => card instanceof MonsterCard && card.level <= 4);
                    if(cardlist.length > 0){
                        eff.targetCard = await openCardListWindow.select(cardlist,1,1,eff,"手札に加えるカードを選択してください");
                        await search(eff.targetCard);
                    };
                    game.timeArray.push({...game.nowTime});
                    resolve();
                });
            };
            return [eff1];
        },
        DESTINYDRAW:(card:SpellCard)=>{
            const eff1 = new effect(card);
            eff1.effType = "CardActived";
            eff1.range = ["HAND","ST"];
            eff1.actionPossible = (time:Time) =>{
                const boolarray = [
                    JudgeSpellTrapActivateLoc(card),
                    genCardArray({category:["D-HERO"],location:["HAND"]}).length > 0,
                    2<=game.DECK.length 
                ];
                return boolarray.every(value => value==true)
            };
            eff1.whenActive = (eff :effect) => {
                return new Promise(async(resolve, reject) => {
                    const cardlist = genCardArray({category:["D-HERO"],location:["HAND"]});
                    eff.targetCard = await openCardListWindow.select(cardlist,1,1,eff,"捨てるD-HEROを1枚選択してください");
                    await discard(eff.targetCard);
                    resolve();
                });
            };
            eff1.whenResolve = (eff :effect) => {
                return new Promise<void>(async(resolve, reject) => {
                    game.nowTime = new Time;
                    await draw(2);
                    game.timeArray.push({...game.nowTime});
                    resolve();
                });
            };
            return [eff1];
        },
        MONSTERREBORN:(card:SpellCard)=>{
            const eff1 = new effect(card);
            eff1.effType = "CardActived";
            eff1.range = ["HAND","ST"];
            eff1.actionPossible = (time:Time) =>{
                const boolarray = [
                    JudgeSpellTrapActivateLoc(card),
                    genCardArray({location:["MO"]}).length < 5,
                    game.GY.filter(card=>card instanceof MonsterCard && card.canNS).length>0
                ];
                return boolarray.every(value => value==true)
            };
            eff1.whenActive = (eff :effect) => {
                return new Promise(async(resolve, reject) => {
                    const cardlist = game.GY.filter(card=>card instanceof MonsterCard && card.canNS);
                    eff.targetCard = await openCardListWindow.select(cardlist,1,1,eff,"特殊召喚するモンスターを1枚選択してください");
                    await animationEffectTarget(eff.targetCard);
                    resolve();
                });
            };
            eff1.whenResolve = (eff :effect) => {
                return new Promise<void>(async(resolve, reject) => {
                    const targetarray = eff.targetCard.filter(card=>card.location=="GY");
                    game.nowTime = new Time;
                    await SpecialSummon.fromGY(targetarray.reverse(),false,"ATK");
                    game.timeArray.push({...game.nowTime});
                    resolve();
                });
            };
            return [eff1];
        },
        PREMATUREBRIAL:(card:SpellCard)=>{
            const eff1 = new effect(card);
            eff1.effType = "CardActived";
            eff1.range = ["HAND","ST"];
            eff1.lifeCost = 800;
            eff1.actionPossible = (time:Time) =>{
                const boolarray = [
                    (game.myLifePoint>eff1.lifeCost || !(game.payLPcost)),
                    JudgeSpellTrapActivateLoc(card),
                    genCardArray({location:["MO"]}).length < 5,
                    game.GY.filter(card=>card instanceof MonsterCard && card.canNS).length>0
                ];
                return boolarray.every(value => value==true)
            };
            eff1.whenActive = (eff :effect) => {
                return new Promise(async(resolve, reject) => {
                    const cardlist = game.GY.filter(card=>card instanceof MonsterCard && card.canNS)
                    await payLife(eff.lifeCost);
                    eff.targetCard = await openCardListWindow.select(cardlist,1,1,eff,"特殊召喚するモンスターを1枚選択してください");
                    await animationEffectTarget(eff.targetCard);
                    resolve();
                });
            };
            eff1.whenResolve = (eff :effect) => {
                return new Promise<void>(async(resolve, reject) => {
                    game.nowTime = new Time;
                    if(eff.targetCard[0].location=="GY" && eff.card.location=="ST" && eff.card.face=="UP"){
                        await SpecialSummon.fromGY(eff.targetCard,false,"ATK");
                        await Equip(card,eff);
                    };
                    game.timeArray.push({...game.nowTime});
                    resolve();
                });
            };

            const eff2 = new effect(card);
            eff2.effType = "Continuous";
            eff2.actionPossible = (time:Time) =>{
                const timeCondition = (()=>{
                    const timeBoolArray :boolean[] = [];
                    time.destroy.forEach(tDestroy=>{
                        timeBoolArray.push(tDestroy.card==card);
                    });
                    return timeBoolArray.some(value => value);
                })();
                const boolarray = [
                card.peggingTarget.filter(card=>card.canDestroy).length>0,
                timeCondition
                ];
                return boolarray.every(value => value==true)
            };
            eff2.apply = () => {
                return new Promise<void>(async(resolve, reject) => {
                    if(card.peggingTarget[0].location=="MO"){
                        await destroy(card.peggingTarget,"EFFECT");
                    };
                    // card.peggingTarget = [];
                    resolve();
                });
            };
            return [eff1,eff2,equipDestroy(card),equipDisEnchant(card)];
        },
        MONSTERGATE:(card:SpellCard)=>{
            const eff1 = new effect(card);
            eff1.effType = "CardActived";
            eff1.range = ["HAND","ST"]
            eff1.actionPossible = (time:Time) =>{
                const boolarray = [
                    JudgeSpellTrapActivateLoc(card),
                    game.DECK.filter(card=>card instanceof MonsterCard && card.canNS).length >0,
                    genCardArray({location:["MO"]}).length > 0
                ];
                return boolarray.every(value => value==true)
            };
            eff1.whenActive = (eff :effect) => {
                return new Promise(async(resolve, reject) => {
                    const cardlist = genCardArray({location:["MO"]});
                    eff.targetCard = await openCardListWindow.select(cardlist,1,1,eff,"リリースするモンスターを1枚選択してください");
                    await release(eff.targetCard,"COST");
                    resolve();
                });
            };
            eff1.whenResolve = (eff :effect) => {
                return new Promise<void>(async(resolve, reject) => {
                    game.nowTime = new Time;
                    const decktop = ()=> {return game.DECK[game.DECK.length -1]};
                    if(game.DECK.filter(card=>card instanceof MonsterCard && card.canNS).length >0){
                        await (async () => {
                            while(true){
                                const topcard = game.DECK[game.DECK.length -1];
                                await cardFlip(topcard);
                                await timeout(250);
                                if(topcard instanceof MonsterCard && topcard.canNS){
                                    break
                                }else{
                                    console.log("send " +topcard.cardName+ " to GY")
                                    await moveCard.DECK.toGY(topcard);
                                    game.nowTime.move.push({
                                        card:topcard,
                                        from:"DECK",
                                        to:"GY"
                                    });
                                };
                            };
                        })();
                        if( decktop() instanceof MonsterCard){
                            await SpecialSummon.fromDECK([decktop()],false,"ATK");
                        };
                    };
                    game.timeArray.push({...game.nowTime});
                    resolve();
                });
            };
            return [eff1];
        },
        PHENIXBLADE:(card:SpellCard)=>{
            const eff1 = new effect(card);
            eff1.effType = "CardActived"
            eff1.range = ["HAND","ST"]
            eff1.actionPossible = (time:Time) =>{
                const boolarray = [
                    JudgeSpellTrapActivateLoc(card),
                    genCardArray({face:["UP"],location:["MO"],race:["WARRIOR"]}).length > 0
                ];
                return boolarray.every(value => value==true)
            };
            eff1.whenActive = (eff :effect) => {
                return new Promise(async(resolve, reject) => {
                    const cardlist = genCardArray({face:["UP"],location:["MO"],race:["WARRIOR"]});
                    eff.targetCard = await openCardListWindow.select(cardlist,1,1,eff,"装備対象を選択してください");
                    await animationEffectTarget(eff.targetCard);
                    resolve();
                });
            };
            eff1.whenResolve = (eff :effect) => {
                return new Promise<void>(async(resolve, reject) => {
                    game.nowTime = new Time;
                    if(eff.targetCard[0].location=="MO" && eff.targetCard[0].face=="UP" && eff.card.location=="ST" && eff.card.face=="UP"){
                        await Equip(card,eff);
                        const equiptarget = card.peggingTarget[0];
                        if(equiptarget instanceof MonsterCard){
                            equiptarget.buff.push({eff:eff,atkBuff:300,defBuff:0})
                        };
                    };
                    game.timeArray.push({...game.nowTime});
                    resolve();
                });
            };

            const eff2 = new effect(card);
            eff2.effType = "Ignition";
            eff2.range = ["GY"];
            eff2.actionPossible = (time:Time) =>{
                const boolarray = [
                    eff2.range.includes(card.location),
                    genCardArray({race:["WARRIOR"],location:["GY"]}).length >= 2
                ];
                return boolarray.every(value => value==true)
            };
            eff2.whenActive = (eff :effect) => {
                return new Promise(async(resolve, reject) => {
                    const cardlist = genCardArray({race:["WARRIOR"],location:["GY"]});
                    eff.targetCard = await openCardListWindow.select(cardlist,2,2,eff,"除外する戦士族を2枚選択してください");
                    await vanish(eff.targetCard,"COST");
                    resolve();
                });
            };
            eff2.whenResolve = (eff :effect) => {
                return new Promise<void>(async(resolve, reject) => {
                    game.nowTime = new Time;
                    if(eff.card.location=="GY"){
                        await (async () => {
                            await moveCard.GY.toHAND(eff.card);
                            game.nowTime.move.push({
                                card:eff.card,
                                from:"GY",
                                to:"HAND"
                            });
                        })();
                        await ContinuousEffect(game.nowTime);
                    };
                    game.timeArray.push({...game.nowTime});
                    resolve();
                });
            };
            return [eff1,eff2,equipDestroy(card),equipDisEnchant(card)];
        },
        DIMENSIONFUSION:(card:SpellCard)=>{
            const eff1 = new effect(card);
            eff1.effType = "CardActived";
            eff1.range = ["HAND","ST"];
            eff1.lifeCost = 2000;
            eff1.actionPossible = (time:Time) =>{
                const boolarray = [
                    (game.myLifePoint>eff1.lifeCost || !(game.payLPcost)),
                    JudgeSpellTrapActivateLoc(card),
                    genCardArray({location:["MO"]}).length < 5,
                    game.DD.filter(card=>card instanceof MonsterCard && card.canNS).length>0
                ];
                return boolarray.every(value => value==true)
            };
            eff1.whenActive = (eff :effect) => {
                return new Promise(async(resolve, reject) => {
                    await payLife(eff.lifeCost);
                    resolve();
                });
            };
            eff1.whenResolve = (eff :effect) => {
                return new Promise<void>(async(resolve, reject) => {
                    game.nowTime = new Time;
                    const blankMonsterZone = 5-genCardArray({location:["MO"]}).length;
                    const canNSmonster = game.DD.filter(card=>card instanceof MonsterCard && card.canNS);
                    if(canNSmonster.length>0 && blankMonsterZone>0){
                        if(canNSmonster.length > blankMonsterZone ){
                            eff.targetCard = await openCardListWindow.select(canNSmonster,blankMonsterZone,blankMonsterZone,eff,"特殊召喚するモンスターを選択してください");
                        }else{
                            eff.targetCard = canNSmonster;
                        };
                        await SpecialSummon.fromDD(eff.targetCard,false,"ATK");
                    };
                    game.timeArray.push({...game.nowTime});
                    resolve();
                });
            };
            return [eff1];
        },
        REASONING:(card:SpellCard)=>{
            const eff1 = new effect(card);
            eff1.effType = "CardActived";
            eff1.range = ["HAND","ST"]
            eff1.actionPossible = (time:Time) =>{
                const boolarray = [
                    JudgeSpellTrapActivateLoc(card),
                    genCardArray({location:["MO"]}).length < 5,
                    game.DECK.filter(card=>card instanceof MonsterCard && card.canNS).length >0
                ];
                return boolarray.every(value => value==true)
            };
            eff1.whenActive = (eff :effect) => {
                return new Promise((resolve, reject) => {
                    resolve();
                });
            };
            eff1.whenResolve = (eff :effect) => {
                return new Promise<void>(async(resolve, reject) => {
                    game.nowTime = new Time;
                    const pubZone = genCardArray({location:["MO","GY","DD"]});
                    const decrearLevel = (()=>{
                        if(pubZone.filter(c=>c.cardName==status.MagicianOfChaos.cardName).length == 0){
                            return 8;
                        }else if(pubZone.filter(c=>c.cardName==status.Airman.cardName).length == 0){
                            return 4;
                        }else if(pubZone.filter(c=>c.cardName==status.Kuraz.cardName).length == 0){
                            return 6;
                        }else{
                            return 1;
                        };
                    })();
                    const decktop = ()=> {return game.DECK[game.DECK.length -1]};
                    if(game.DECK.filter(card=>card instanceof MonsterCard && card.canNS).length >0){
                        await openMessageWindow(decrearLevel + " が宣言されました");
                        await (async () => {
                            while(true){
                                const topcard = game.DECK[game.DECK.length -1];
                                await cardFlip(topcard);
                                await timeout(250);
                                if(topcard instanceof MonsterCard && topcard.canNS){
                                    break
                                }else{
                                    console.log("send " +topcard.cardName+ " to GY")
                                    await moveCard.DECK.toGY(topcard);
                                    game.nowTime.move.push({
                                        card:topcard,
                                        from:"DECK",
                                        to:"GY"
                                    });
                                };
                            };
                        })();
                        if( decktop() instanceof MonsterCard){
                            const top = decktop();
                            if(top instanceof MonsterCard && top.level != decrearLevel){
                                await SpecialSummon.fromDECK([decktop()],false,"ATK");
                            }else{
                                await moveCard.DECK.toGY(top);
                                console.log("send " +top.cardName+ " to GY")
                                game.nowTime.move.push({
                                    card:top,
                                    from:"DECK",
                                    to:"GY"
                                });
                            };
                            
                        };
                    };
                    game.timeArray.push({...game.nowTime});
                    resolve();
                });
            };
            return [eff1];
        },
        DDR:(card:SpellCard)=>{
            const eff1 = new effect(card);
            eff1.effType = "CardActived";
            eff1.range = ["HAND","ST"];
            eff1.actionPossible = (time:Time) =>{
                const boolarray = [
                    game.HAND.filter(c=>c!=card).length > 0,
                    JudgeSpellTrapActivateLoc(card),
                    genCardArray({location:["MO"]}).length < 5,
                    game.DD.filter(card=>card instanceof MonsterCard && card.canNS).length>0
                ];
                return boolarray.every(value => value==true)
            };
            eff1.whenActive = (eff :effect) => {
                return new Promise(async(resolve, reject) => {
                    const cardlist = game.DD.filter(card=>card instanceof MonsterCard && card.canNS)
                    eff.targetCard = await openCardListWindow.select(game.HAND,1,1,eff,"捨てる手札を1枚選択してください");
                    await discard(eff.targetCard);
                    eff.targetCard = await openCardListWindow.select(cardlist,1,1,eff,"特殊召喚するモンスターを1枚選択してください");
                    await animationEffectTarget(eff.targetCard);
                    resolve();
                });
            };
            eff1.whenResolve = (eff :effect) => {
                return new Promise<void>(async(resolve, reject) => {
                    game.nowTime = new Time;
                    if(eff.targetCard[0].location=="DD" && eff.card.location=="ST" && eff.card.face=="UP"){
                        await SpecialSummon.fromDD(eff.targetCard,false,"ATK");
                        await Equip(card,eff);
                    };
                    game.timeArray.push({...game.nowTime});
                    resolve();
                });
            };

            const eff2 = new effect(card);
            eff2.effType = "Continuous";
            eff2.actionPossible = (time:Time) =>{
                const timeCondition = (()=>{
                    const timeBoolArray :boolean[] = [];
                    time.leaveBoard.forEach(tLeave=>{
                        timeBoolArray.push([
                            tLeave.card==card
                            ].every(value => value));
                    });
                    return timeBoolArray.some(value => value);
                })();
                const boolarray = [
                card.peggingTarget.filter(card=>card.canDestroy).length>0,
                timeCondition
                ];
                return boolarray.every(value => value==true)
            };
            eff2.apply = () => {
                return new Promise<void>(async(resolve, reject) => {
                    if(card.peggingTarget[0].location=="MO"){
                        await destroy(card.peggingTarget,"EFFECT");
                    };
                    // card.peggingTarget = [];
                    resolve();
                });
            };
            return [eff1,eff2,equipDestroy(card),equipDisEnchant(card)];
        },
        TRADEIN:(card:SpellCard)=>{
            const eff1 = new effect(card);
            eff1.effType = "CardActived";
            eff1.range = ["HAND","ST"];
            eff1.actionPossible = (time:Time) =>{
                const boolarray = [
                    JudgeSpellTrapActivateLoc(card),
                    game.HAND.filter(c=>c instanceof MonsterCard && c.level==8).length > 0,
                    2<=game.DECK.length
                ];
                return boolarray.every(value => value==true)
            };
            eff1.whenActive = (eff :effect) => {
                return new Promise(async(resolve, reject) => {
                    const cardlist = game.HAND.filter(c=>c instanceof MonsterCard && c.level==8);
                    eff.targetCard = await openCardListWindow.select(cardlist,1,1,eff,"捨てるカードを1枚選択してください");
                    await discard(eff.targetCard);
                    resolve();
                });
            };
            eff1.whenResolve = (eff :effect) => {
                return new Promise<void>(async(resolve, reject) => {
                    game.nowTime = new Time;
                    await draw(2);
                    game.timeArray.push({...game.nowTime});
                    resolve();
                });
            };
            return [eff1];
        },
        MAGICSTONEEXCAVATION:(card:SpellCard)=>{
            const eff1 = new effect(card);
            eff1.effType = "CardActived";
            eff1.range = ["HAND","ST"];
            eff1.actionPossible = (time:Time) =>{
                const boolarray = [
                    game.HAND.filter(c=>c!=card).length >= 2,
                    JudgeSpellTrapActivateLoc(card),
                    genCardArray({location:["GY"],cardType:["Spell"]}).length >= 1
                ];
                return boolarray.every(value => value==true)
            };
            eff1.whenActive = (eff :effect) => {
                return new Promise(async(resolve, reject) => {
                    eff.targetCard = await openCardListWindow.select(game.HAND,2,2,eff,"捨てるカードを2枚選択してください");
                    await discard(eff.targetCard);
                    const cardlist = game.GY.filter(card=>card instanceof SpellCard);
                    eff.targetCard = await openCardListWindow.select(cardlist,1,1,eff,"手札に加える魔法を1枚選択してください");
                    await animationEffectTarget(eff.targetCard);
                    resolve();
                });
            };
            eff1.whenResolve = (eff :effect) => {
                return new Promise<void>(async(resolve, reject) => {
                    game.nowTime = new Time;
                    if(eff.targetCard[0].location=="GY"){
                        await moveCard.GY.toHAND(eff.targetCard[0]);
                        game.nowTime.move.push({
                            card:eff.targetCard[0],
                            from:"GY",
                            to:"HAND"
                        });
                        await ContinuousEffect(game.nowTime);
                    };
                    game.timeArray.push({...game.nowTime});
                    resolve();
                });
            };
            return [eff1];
        },
        HANDDESTRUCTION:(card:SpellCard)=>{
            const eff1 = new effect(card);
            eff1.effType = "CardActived";
            eff1.range = ["HAND","ST"]
            eff1.actionPossible = (time:Time) =>{
                const boolarray = [
                    JudgeSpellTrapActivateLoc(card),
                    game.DECK.length >= game.HAND.filter(c=>c!==card).length
                ];
                return boolarray.every(value => value==true)
            };
            eff1.whenActive = (eff :effect) => {
                return new Promise((resolve, reject) => {
                    resolve();
                });
            };
            eff1.whenResolve = (eff :effect) => {
                return new Promise<void>(async(resolve, reject) => {
                    game.nowTime = new Time;
                    const count = game.HAND.length;
                    await discard(game.HAND);
                    await draw(count);
                    game.timeArray.push({...game.nowTime});
                    resolve();
                });
            };
            return [eff1];
        },
        HURRICANE:(card:SpellCard)=>{
            const eff1 = new effect(card);
            eff1.effType = "CardActived";
            eff1.range = ["HAND","ST"]
            eff1.actionPossible = (time:Time) =>{
                const boolarray = [
                    JudgeSpellTrapActivateLoc(card),
                    genCardArray({location:["ST"]}).filter(c=> c!=card).length > 0
                ];
                return boolarray.every(value => value==true)
            };
            eff1.whenActive = (eff :effect) => {
                return new Promise((resolve, reject) => {
                    resolve();
                });
            };
            eff1.whenResolve = (eff :effect) => {
                return new Promise<void>(async(resolve, reject) => {
                    game.nowTime = new Time;
                    await bounce(genCardArray({location:["ST"]}).filter(c=> c!=card),"EFFECT");
                    game.timeArray.push({...game.nowTime});
                    resolve();
                });
            };
            return [eff1];
        },
        HIDDENARMORY:(card:SpellCard)=>{
            const eff1 = new effect(card);
            eff1.effType = "CardActived";
            eff1.range = ["HAND","ST"]
            eff1.actionPossible = (time:Time) =>{
                const boolarray = [
                    game.countNS==0,
                    JudgeSpellTrapActivateLoc(card),
                    game.DECK.length >=1,
                    genCardArray({cardType:["Spell"],location:["DECK","GY"]})
                                        .filter(card => card instanceof SpellCard && card.spellType == "Equip").length >= 1
                ];
                return boolarray.every(value => value==true)
            };
            eff1.whenActive = (eff :effect) => {
                return new Promise(async(resolve, reject) => {
                    game.nowTime = new Time;
                    const decktop = game.DECK[game.DECK.length -1];
                    await moveCard.DECK.toGY(decktop);
                    game.nowTime.move.push({
                        card:decktop,
                        from:"DECK",
                        to:"GY"
                    });
                    game.timeArray.push({...game.nowTime});
                    resolve();
                });
            };
            eff1.whenResolve = (eff :effect) => {
                return new Promise<void>(async(resolve, reject) => {
                    game.nowTime = new Time;
                    const cardlist = genCardArray({cardType:["Spell"],location:["DECK","GY"]})
                                        .filter(card => card instanceof SpellCard && card.spellType == "Equip");
                    if(cardlist.length > 0){
                        eff.targetCard = await openCardListWindow.select(cardlist,1,1,eff,"手札に加えるカードを選択してください");
                        if(eff.targetCard[0].location=="DECK"){
                            await search(eff.targetCard);
                        }else if(eff.targetCard[0].location=="GY"){
                            await moveCard.GY.toHAND(eff.targetCard[0]);
                            game.nowTime.move.push({
                                card:eff.card,
                                from:"GY",
                                to:"HAND"
                            });
                        };
                        game.normalSummon = false;
                    };
                    game.timeArray.push({...game.nowTime});
                    resolve();
                });
            };
            return [eff1];
        },
        SPELLECONOMICS:(card:SpellCard)=>{
            const eff1 = new effect(card);
            eff1.effType = "CardActived"
            eff1.range = ["HAND","ST"]
            eff1.actionPossible = (time:Time) =>{
                const boolarray = [
                    JudgeSpellTrapActivateLoc(card)
                ];
                return boolarray.every(value => value==true)
            };
            eff1.whenActive = (eff :effect) => {
                return new Promise((resolve, reject) => {
                    resolve();
                });
            };
            eff1.whenResolve = (eff :effect) => {
                return new Promise<void>(async(resolve, reject) => {
                    game.nowTime = new Time;
                    game.payLPcost = false;
                    game.timeArray.push({...game.nowTime});
                    resolve();
                });
            };
            const eff2 = new effect(card);
            eff2.effType = "Continuous";
            eff2.actionPossible = (time:Time) =>{
                const timeCondition = (()=>{
                    const timeBoolArray :boolean[] = [];
                    time.leaveBoard.forEach(tLeave=>{
                        timeBoolArray.push(tLeave.card==card);
                    });
                    return timeBoolArray.some(value => value);
                })();
                const boolarray = [timeCondition];
                return boolarray.every(value => value==true);
            };
            eff2.apply = () => {
                return new Promise<void>((resolve, reject) => {
                    game.payLPcost = true;
                    resolve();
                });
            };
            return [eff1,eff2];
        },
        GOLDSARCOPHAGUS:(card:SpellCard)=>{
            const eff1 = new effect(card);
            eff1.effType = "CardActived"
            eff1.range = ["HAND","ST"]
            eff1.actionPossible = (time:Time) =>{
                const boolarray = [
                    JudgeSpellTrapActivateLoc(card),
                    game.DECK.length >= 1
                ];
                return boolarray.every(value => value==true)
            };
            eff1.whenActive = (eff :effect) => {
                return new Promise((resolve, reject) => {
                    resolve();
                });
            };
            eff1.whenResolve = (eff :effect) => {
                return new Promise<void>(async(resolve, reject) => {
                    game.nowTime = new Time;
                    if(game.DECK.length >= 1){
                        eff.targetCard = await openCardListWindow.select(game.DECK,1,1,eff,"除外するカードを選択してください");
                        await vanish(eff.targetCard,"EFFECT");
                        await deckShuffle();
                    };
                    game.timeArray.push({...game.nowTime});
                    resolve();
                });
            };
            return [eff1];
        },
        MAGICALEXPLOSION:(card:TrapCard)=>{
            const eff1 = new effect(card);
            eff1.effType = "CardActived";
            eff1.range = ["ST"];
            eff1.copyCondition = ()=>{
                return 1 <= genCardArray({location:["GY"],cardType:["Spell"]}).length;
            };
            eff1.actionPossible = (time:Time) =>{
                const boolarray = [false];
                return boolarray.every(value => value==true)
            };
            eff1.whenActive = (eff :effect) => {
                return new Promise((resolve, reject) => {
                    resolve();
                });
            };
            eff1.whenResolve = async(eff :effect) => {
                return new Promise<void>(async(resolve, reject) => {
                    game.nowTime = new Time;
                    const damage = game.GY.filter(c=>c.cardType == "Spell").length*200;
                    await dealDamage(damage);
                    game.timeArray.push({...game.nowTime});
                    resolve();
                });
            };
            return [eff1];   
        },
        RETURNFROMTHEDD:(card:TrapCard)=>{
            const eff1 = new effect(card);
            eff1.effType = "CardActived";
            eff1.range = ["ST"];
            eff1.copyCondition = ()=>{
                return (
                    1 <= genCardArray({location:["DD"],cardType:["Monster"]}).length &&
                    genCardArray({location:["MO"]}).length < 5
                );
            };
            eff1.actionPossible = (time:Time) =>{
                const boolarray = [false];
                return boolarray.every(value => value==true)
            };
            eff1.whenActive = (eff :effect) => {
                return new Promise(async(resolve, reject) => {
                    await payLife(game.myLifePoint/2);
                    resolve();
                });
            };
            eff1.whenResolve = (eff :effect) => {
                return new Promise<void>(async(resolve, reject) => {
                    game.nowTime = new Time;
                    const blankMonsterZone = 5-genCardArray({location:["MO"]}).length;
                    const canNSmonster = game.DD.filter(card=>card instanceof MonsterCard && card.canNS);
                    if(canNSmonster.length>0 && blankMonsterZone>0){
                        if(canNSmonster.length > blankMonsterZone ){
                            eff.targetCard = await openCardListWindow.select(canNSmonster,blankMonsterZone,blankMonsterZone,eff,"特殊召喚するモンスターを選択してください");
                        }else{
                            eff.targetCard = canNSmonster;
                        };
                        await SpecialSummon.fromDD(eff.targetCard,false,"ATK");
                    };
                    game.timeArray.push({...game.nowTime});
                    resolve();
                });
            };
            return [eff1];
        }
    };

    const game = new Game;

    const mainCanv =<HTMLCanvasElement>document.getElementById("canv") ;
    const mainstage = new createjs.Stage(mainCanv);
    mainstage.enableMouseOver();

    const statusCanv = <HTMLCanvasElement>document.getElementById("statuscanv") ;
    const statusStage = new createjs.Stage(statusCanv);
    statusStage.enableMouseOver();
    const statusCardNameText = <HTMLElement>document.getElementById("cardNameText");
    const statusCardTypeText = <HTMLElement>document.getElementById("cardTypeText");
    const statusCardEffText = <HTMLElement>document.getElementById("cardEffText");

    const divSelectMenuContainer =<HTMLElement>document.getElementById("selectMenuContainer") ;
    const windowBackCanv =<HTMLCanvasElement>document.getElementById("selectMenuBack") ;
    const windowBackStage = new createjs.Stage(windowBackCanv);
    windowBackStage.enableMouseOver();  
    const selectButtonCanv =<HTMLCanvasElement>document.getElementById("selectButtonCanv") ;
    selectButtonCanv.style.width = String(windowSize.w)+"px";
    selectButtonCanv.width = windowSize.w;
    selectButtonCanv.style.height = String(60)+"px";
    selectButtonCanv.height = 60
    const selectButtonStage = new createjs.Stage(selectButtonCanv);
    selectButtonStage.enableMouseOver();
    const messageText = <HTMLElement>document.getElementById("selectMessageText")
    const scrollAreaContainer =<HTMLElement>document.getElementById("scrollAreaContainer") ;
    scrollAreaContainer.style.width = String(windowSize.w)+"px";
    scrollAreaContainer.style.height = String(windowSize.h)+"px";
    const disprayCanv =<HTMLCanvasElement>document.getElementById("displayCanv") ;
    const disprayStage = new createjs.Stage(disprayCanv);
    disprayStage.enableMouseOver();
    setBoard(mainstage);
    const cardContainer = new createjs.Container;
    mainstage.addChild(cardContainer);

    const myLP = new createjs.Text(game.myLifePoint.toString(), "80px serif", "#4169e1");
    myLP.shadow = new createjs.Shadow("#58D3F7",0,0,20);
    myLP.textBaseline = "bottom";
    myLP.y = 800;
    mainstage.addChild(myLP);
    myLP.alpha = 0;
    const EnemyLP = new createjs.Text(game.enemyLifePoint.toString(), "80px serif", "#cd5c5c");
    EnemyLP.shadow = new createjs.Shadow("#FA5858",0,0,20);
    EnemyLP.textAlign = "left";
    mainstage.addChild(EnemyLP);
    EnemyLP.alpha = 0;

    const numOfcardsContainer = new createjs.Container;
    const NumInDeck =  new createjs.Text("DECK: "+game.DECK.length.toString(), "25px serif", "#000000");
    NumInDeck.textAlign = "left";
    const NumInGy =  new createjs.Text("SPELLS IN GY: "+genCardArray({location:["GY"],cardType:["Spell"]}).length.toString(), "25px serif", "#000000");
    NumInGy.textAlign = "left";
    numOfcardsContainer.addChild(NumInDeck);
    numOfcardsContainer.addChild(NumInGy);
    NumInGy.y = 40;
    mainstage.addChild(numOfcardsContainer);
    numOfcardsContainer.setTransform(game.displayOrder.deck[0][0]+90,game.displayOrder.deck[0][1]-60);
    numOfcardsContainer.alpha = 0;

    const createdbyText = new createjs.Text("Created by  ", "24px serif","black");
    const twiAccountText = new createjs.Text("@toride0313", "24px serif","black");
    const updateText = new createjs.Text(" /Update 2020.07.22  Microsoft Edgeでは正常動作しません。", "24px serif","black");
    twiAccountText.x = createdbyText.getMeasuredWidth();
    updateText.x = createdbyText.getMeasuredWidth()+twiAccountText.getMeasuredWidth()+5;
    twiAccountText.color = "#1111cc";
    twiAccountText.cursor = "pointer";
    const hitAreaShape = new createjs.Shape;
    hitAreaShape.set({
        graphics : new createjs.Graphics().beginFill("#FFF").drawEllipse(0,0,twiAccountText.getMeasuredWidth(),twiAccountText.getMeasuredHeight())
    });
    twiAccountText.hitArea = hitAreaShape;
    const footerContainer = new createjs.Container;
    footerContainer.addChild(createdbyText,twiAccountText,updateText);
    twiAccountText.addEventListener("click",clicktwiAccountText);
    function clicktwiAccountText(event) {
        window.open("https://twitter.com/toride0313")
    };
    mainstage.addChild(footerContainer);
    footerContainer.y =  1000-updateText.getMeasuredLineHeight();

    const bugReportButton = createButton("不具合を報告", 160, 40, "#0275d8");
    bugReportButton.x = 1300;
    bugReportButton.y = 950;
    mainstage.addChild(bugReportButton);
    bugReportButton.on("click", function(e){
        const url = "https://twitter.com/share?related=twitterapi%2Ctwitter&hashtags=DogmaBladeSimulatorBugReport&text="+
                    "@toride0313 動作環境：[] バグ内容及び発生状況:[] スクショがあれば載せてもらえると助かります。DMでも可。※Edgeでは正常動作しません。別のブラウザでお試しください。";
        window.open(url)
    }, null, false);

    const followButtonImg = new createjs.Bitmap("follow.png");
    followButtonImg .cursor = "pointer";
    followButtonImg .x = 5;
    followButtonImg .y = 930;
    mainstage.addChild(followButtonImg);
    followButtonImg.on("click", function(e){
        const url = "https://twitter.com/intent/follow?screen_name=toride0313"
                    window.open(url, null,"width=650, height=300, personalbar=0, toolbar=0, scrollbars=1, sizable=1")
    }, null, false);

    const qiitaImg = new createjs.Bitmap("qiita.png");
    qiitaImg .cursor = "pointer";
    qiitaImg .x = -32.5;
    qiitaImg .y = 840;
    mainstage.addChild(qiitaImg);
    qiitaImg.addEventListener("click",clickQiita);
    function clickQiita(event) {
        window.open("https://qiita.com/toride0313/items/7bbf1a4be3525e3f0aaf")
    };



    const deckRecipe :{json:Object,num:number}[] = [
        {json:status.Dogma, num:3},
        {json:status.CyberVary, num:2},
        {json:status.Airman, num:1},
        {json:status.Kuraz, num:1},
        {json:status.Disk, num:1},
        {json:status.MagicianOfChaos, num:1},
        {json:status.MonsterReborn, num:1},
        {json:status.MonsterGate, num:3},
        {json:status.Reasoning, num:3},
        {json:status.DestinyDraw, num:3},
        {json:status.HandDestruction, num:1},
        {json:status.HiddenArmory, num:3},
        {json:status.TradeIn, num:2},
        {json:status.PhenixBlade, num:2},
        {json:status.Reinforcement, num:2},
        {json:status.GoldSalcophagus, num:1},
        {json:status.DDR, num:2},
        {json:status.MagicStoneExcavation, num:2},
        {json:status.PrematureBrial, num:1},
        {json:status.Hurricane, num:1},
        {json:status.DimensionFusion, num:1},
        {json:status.SpellEconomics, num:1},
        {json:status.MagicalExplosion, num:2}
    ];

    deckRecipe.forEach((numOfCard,index,array)=>{
        const json = numOfCard.json;
        for(let i = 0; i < numOfCard.num ; i++){
            if(json["cardType"]=="Monster"){
                const monsterCardObj = genCardObject.Monster(json);
                if(monsterCardObj.monsterType=="Effect"){
                    if(effectSetting[monsterCardObj.effectKey] instanceof Function){
                        monsterCardObj.effect = effectSetting[monsterCardObj.effectKey](monsterCardObj);
                    };
                };
                if(!(monsterCardObj.canNS)){
                    SSconditionSetting[monsterCardObj.SSconditionKey](monsterCardObj);
                };
                game.defaultDeck.push(monsterCardObj);
            }else if(json["cardType"]=="Spell"){
                const spellCardObj = genCardObject.Spell(json);
                spellCardObj.effect = effectSetting[spellCardObj.effectKey](spellCardObj);
                game.defaultDeck.push(spellCardObj);
            }else if(json["cardType"]=="Trap"){
                const trapCardObj = genCardObject.Trap(json);
                trapCardObj.effect = effectSetting[trapCardObj.effectKey](trapCardObj);
                game.defaultDeck.push(trapCardObj);
            };
        };
    });

    const viewCardback = new createjs.Bitmap("cardback_view.jpg");
    viewCardback .setTransform(statusCanv.width/2,statusCanv.height/2,1,1,0,0,0,140,206); 
    statusStage.addChild(viewCardback);
    lineUp();
    console.log(game.DECK); 

    // const DeckViewButton = createButton("DECK View", 150, 40, "#0275d8");
    // DeckViewButton.x = 1200;
    // DeckViewButton.y = 650;
    // mainstage.addChild(DeckViewButton);

    // DeckViewButton.on("click", function(e){
    //     console.log(game.DECK)
    //     await openCardListWindow.view(game.DECK,"DECK");
    // }, null, false);

    // const drawButton = createButton("draw", 150, 40, "#0275d8");
    // drawButton.x = 1300;
    // drawButton.y = 500;
    // mainstage.addChild(drawButton);

    // drawButton.on("click", function(e){
    //     draw(1);
    // }, null, false);

    // const testButton = createButton("test", 150, 40, "#0275d8");
    // testButton.x = 1300;
    // testButton.y = 550;
    // mainstage.addChild(testButton);
    // testButton.on("click", function(e){
    //     openHowtoWindow();
    // }, null, false);

    const startButton = createTextButton("DUEL START","80px serif", "midnightblue","yellow")
    mainstage.addChild(startButton);
    startButton.x = 550;
    startButton.y = 850;
    startButton.addEventListener("click", handleClickStart);
    function handleClickStart(event) {
        startButton.mouseEnabled = false;
        gameStart();
        createjs.Tween.get(startButton).to({alpha:0},250);
    };

    const TweetButtonImg = new createjs.Bitmap("tweet.png");
    TweetButtonImg.cursor = "pointer";
    TweetButtonImg.x = 1275
    TweetButtonImg.y = 825;
    mainstage.addChild(TweetButtonImg);

    TweetButtonImg.on("click", function(e){
        const url = "https://twitter.com/share?url=https://tsd0313.github.io/ygo-DogmaBlade/dist/&related=twitterapi%2Ctwitter&hashtags=DogmaBladeSimulator&text="+
                    "ドグマブレードシミュレータ"
                    window.open(url, null,"width=650, height=300, personalbar=0, toolbar=0, scrollbars=1, sizable=1")
    }, null, false);

    const LinkButton = createButton(" ▶ JUNK BLADE ", 200, 60, "#DDA0DD");
    LinkButton.x = 1275;
    LinkButton.y = 20;
    mainstage.addChild(LinkButton);
    LinkButton.on("click", function(e){
        window.open("https://tsd0313.github.io/ygo-JunkBlade/dist/")
    }, null, false);

    const howtoButton = createButton("HOW TO PLAY", 160, 40, "#0275d8");
    howtoButton.x = 1300;
    howtoButton.y = 900;
    mainstage.addChild(howtoButton);
    howtoButton.on("click", function(e){
        openHowtoWindow();
    }, null, false);

    const endButton = createButton("TURN END", 160, 60, "#0275d8");
    endButton.x = 1300;
    endButton.y = 540;
    endButton.alpha = 0;
    cardContainer.addChild(endButton);
    endButton.on("click", function async(e){
        turnEnd();
    }, null, false);

    const resetButton = createButton("RESET", 160, 60, "#0275d8");
    resetButton.x = 1300;
    resetButton.y = 630;
    resetButton.alpha = 0;
    cardContainer.addChild(resetButton);
    resetButton.on("click", function async(e){
        reset();
    }, null, false);
    createjs.Ticker.addEventListener("tick", handleTick);
    function handleTick() {
        mainstage.update();
        windowBackStage.update();
        disprayStage.update();
        selectButtonStage.update();
        statusStage.update();
        myLP.text = zerofix(game.myLifePoint);
        EnemyLP.text = game.enemyLifePoint.toFixed();
        NumInDeck.text = "DECK : "+zerofix(game.DECK.length);
        NumInGy.text = "GY : "+zerofix(genCardArray({location:["GY"]}).length)+" ( "+zerofix(genCardArray({location:["GY"],cardType:["Spell"]}).length)+" )";
    };

    const selectMenuBack = new createjs.Shape();
    selectMenuBack.graphics.beginFill("Gray"); 
    selectMenuBack.graphics.drawRect(0, 0, windowBackCanv.width, windowBackCanv.height);
    selectMenuBack.alpha = 0.5;
    windowBackStage.addChild(selectMenuBack);

    const SelectOkButton = createButton("OK", 150, 40, "#0275d8");
    SelectOkButton.x = selectButtonCanv.width/2 - 75;
    SelectOkButton.y = 10;
    selectButtonStage.addChild(SelectOkButton);

    const SelectCancelButton = createButton("CANCEL", 150, 40, "#0275d8");
    SelectCancelButton.x = selectButtonCanv.width/2 - 75;
    SelectCancelButton.y = 10;
    SelectCancelButton.visible = false
    selectButtonStage.addChild(SelectCancelButton);

    const openCardListWindow = {
        select: (cardArray  :Card[], moreThan :Number, lessThan :Number, activeEff :effect,message? :string,cansel? :boolean):Promise<Card[]> => {
            const disprayCards = [...cardArray].reverse();
            divSelectMenuContainer.style.visibility = "visible";
            SelectCancelButton.visible = false;
            if(message == undefined){
                messageText.innerText = "select"
            }else{
                messageText.innerText = message
            };

            if(cansel){
                SelectCancelButton.visible = true;
                SelectOkButton.x = selectButtonCanv.width/2 - 200;
                SelectCancelButton.x = selectButtonCanv.width/2 + 50;
            }else{
                SelectOkButton.x = selectButtonCanv.width/2 - 75;
            };
            let selectedCardArray : Card[] = [];
            activeEff.targetCard = [];
            selectedCardImgArray = [];
            SelectOkButton.mouseEnabled = false ;

            disprayCanv.style.width = String((10+cardImgSize.x)*disprayCards.length+10)+"px";
            disprayCanv.width = (10+cardImgSize.x)*disprayCards.length+10;
            disprayCanv.style.height = String(50+cardImgSize.y)+"px";
            disprayCanv.height = 50+cardImgSize.y;

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
                if(card instanceof MonsterCard && 1<=card.equip.length){
                    card.equip.forEach((equipSpell,i,array) => {
                        const equipImg = new createjs.Bitmap(equipSpell.imageFileName);
                        equipImg.setTransform(cardImgSize.x/3*i,cardImgSize.y*(2/3),1/3,1/3,-10,0,0,0,0);
                        cardImgContainer.addChild(equipImg);
                    });
                };
                if(card instanceof SpellCard && 1<=card.peggingTarget.length){
                    card.peggingTarget.forEach((equipTarget,i,array) => {
                        const targetImg = new createjs.Bitmap(equipTarget.imageFileName);
                        targetImg.setTransform(cardImgSize.x/3*i,cardImgSize.y*(2/3),1/3,1/3,-10,0,0,0,0);
                        cardImgContainer.addChild(targetImg);
                    });                    
                };
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

                const countCheck = (count:number)=>{
                    return [moreThan<=count,count<=lessThan].every(value => value);
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
                        if(selectedCardArray.length==lessThan){
                            selectedCardImgArray[0].selected.visible = false;
                            selectedCardArray.shift();
                            selectedCardImgArray.shift();
                        };
                        selected.visible = true;
                        selectedCardArray.push(card);
                        selectedCardImgArray.push(selectedCardImg);
                    }else{
                        selected.visible = false; 
                        selectedCardArray = selectedCardArray.filter(i => i !== card);
                        selectedCardImgArray = selectedCardImgArray.filter(i => i !== selectedCardImg);
                    };
                    SelectOkButton.mouseEnabled = countCheck(selectedCardArray.length);
                    selectedMouseOver.visible = false;
                };

                const newlabelBox = createLocLabelBox(card);
                newlabelBox.y = cardImgSize.y+10;

                ImgLabelContainer.addChild(cardImgContainer);
                SetStatusDisprayEvent(card,cardImgContainer);
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
            return new Promise(async(resolve, reject) => {
                await Promise.all(PromiseArray);
                await new Promise((resolve, reject) => {
                    const clickOkButton = async (e) => {
                        divSelectMenuContainer.style.visibility = "hidden";
                        disprayStage.removeAllChildren();
                        SelectOkButton.removeEventListener("click", clickOkButton);
                        resolve();
                    };
                    SelectOkButton.addEventListener("click",clickOkButton);

                    const clickCancelButton = async (e) => {
                        selectedCardArray.length = 0;
                        divSelectMenuContainer.style.visibility = "hidden";
                        disprayStage.removeAllChildren();
                        resolve();
                    };
                    SelectCancelButton.addEventListener("click",clickCancelButton);
                });
                resolve(selectedCardArray);
            });
        },

        view:(cardArray :Card[], message? :string) => {
            const disprayCards = [...cardArray].reverse();
            divSelectMenuContainer.style.visibility = "visible";
            SelectCancelButton.visible = false;
            SelectOkButton.x = selectButtonCanv.width/2 - 75;
            SelectOkButton.mouseEnabled = true;
            if(message == undefined){
                messageText.innerText = "select"
            }else{
                messageText.innerText = message
            };
            selectedCardImgArray = [];

            disprayCanv.style.width = String((10+cardImgSize.x)*disprayCards.length+10)+"px";
            disprayCanv.width = (10+cardImgSize.x)*disprayCards.length+10;
            disprayCanv.style.height = String(50+cardImgSize.y)+"px";
            disprayCanv.height = 50+cardImgSize.y;

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
                SetStatusDisprayEvent(card,cardImgContainer);
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
            return new Promise(async(resolve, reject) => {
                await Promise.all(PromiseArray);
                const clickOkButton = async (e) => {
                    divSelectMenuContainer.style.visibility = "hidden";
                    disprayStage.removeAllChildren();
                    SelectOkButton.removeEventListener("click", clickOkButton);
                    resolve();
                };
                SelectOkButton.addEventListener("click",clickOkButton);
            });
        }
    };

    const openYesNoWindow = (message :string) => {
        divSelectMenuContainer.style.visibility = "visible";
        SelectCancelButton.visible = false;
        SelectOkButton.visible = false;

        const YesNoContainer = new createjs.Container();

        const YesButton = createButton("YES", 150, 80, "#0275d8");
        YesNoContainer.addChild(YesButton);

        const NoButton = createButton("NO", 150, 80, "#0275d8");
        NoButton.x = NoButton.getBounds().width*8;
        YesNoContainer.addChild(NoButton);

        YesNoContainer.regX = YesNoContainer.getBounds().width/2;
        YesNoContainer.regY = YesNoContainer.getBounds().height/2;
        YesNoContainer.x = windowSize.w/2 -60;
        YesNoContainer.y = windowSize.h/2;
        disprayStage.addChild(YesNoContainer);
        
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
        messageText.innerText = "表示形式を選択";
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

        SetStatusDisprayEvent(card,Atk);
        SetStatusDisprayEvent(card,Def);

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

    const OpenSelectEffectWindow = (card :Card,messageA:string,messageB:string) => {
        divSelectMenuContainer.style.visibility = "visible";
        SelectCancelButton.visible = false;
        SelectOkButton.visible = false;

        const ChoiceContainer = new createjs.Container();

        const Abutton = createButton(messageA, 300, 150, "#0275d8");
        ChoiceContainer.addChild(Abutton);

        const Bbutton = createButton(messageB, 300, 150, "#0275d8");
        Bbutton.x = 400;
        ChoiceContainer.addChild(Bbutton);
        
        disprayCanv.style.width = String(windowSize.w)+"px";
        disprayCanv.width = windowSize.w;
        disprayCanv.style.height = String(windowSize.h)+"px";
        disprayCanv.height = windowSize.h;

        ChoiceContainer.regY = ChoiceContainer.getBounds().height/2
        ChoiceContainer.x = 80
        ChoiceContainer.y = (disprayCanv.height-selectButtonCanv.height)/2
        disprayStage.addChild(ChoiceContainer)

        messageText.innerText = "message"
        
        return  new Promise<boolean>((resolve, reject) => {
            Abutton.addEventListener("click",clickYesButton);
            function clickYesButton(e) {
                divSelectMenuContainer.style.visibility = "hidden";
                disprayStage.removeAllChildren();
                SelectOkButton.visible = true;
                resolve(true);
            };
            Bbutton.addEventListener("click",clickNoButton);
            function clickNoButton(e) {
                divSelectMenuContainer.style.visibility = "hidden";
                disprayStage.removeAllChildren();
                SelectOkButton.visible = true;
                resolve(false);
            };
        });
    };

    const openResultWindow = async(messageText :Text)=>{
        const resultWindowContainer = new createjs.Container();
        const messageBack = new createjs.Shape();
        messageBack.graphics.beginFill("white"); 
        messageBack.graphics.drawRect(0, 0, messageText.getMeasuredWidth()+500, cardImgSize.y*2);
        messageBack.alpha = 0.5;
        messageBack.regX = (messageText.getMeasuredWidth()+500)/2;;
        messageBack.regY = cardImgSize.y;
        messageText.x=0;
        messageText.y=0;

        const retryButton = createButton("リトライ", 150, 40, "#0275d8");
        retryButton.x = -170
        retryButton.y = cardImgSize.y-70;
        const tweetButton = createButton("結果をtweet", 150, 40, "#0275d8");
        tweetButton.x = 20
        tweetButton.y = cardImgSize.y-70;

        mainstage.enableMouseOver();

        const tweetTextResult = (()=>{
            if(game.enemyLifePoint<1){
                return "ドグマブレード先攻1キル成功！"+ (-game.enemyLifePoint+8000).toFixed()+"ダメージ！";
            }else{
                return "ドグマブレード先攻1キル失敗・・・　"
            };
        })();
        const firstHand ="初手→" + game.firstHand.join('/') + "\n";
        const tweetURL = "https://twitter.com/share?url=https://tsd0313.github.io/ygo-DogmaBlade/dist/&related=twitterapi%2Ctwitter&hashtags=DogmaBladeSimulator&text="+
                            tweetTextResult+firstHand;

        retryButton.addEventListener("click",clickRetryButton);
        function clickRetryButton(event) {
            location.reload();
        };
        tweetButton.addEventListener("click",clickTweetButton);
        function clickTweetButton(event) {
            // location.href = "https://twitter.com/share?ref_src=twsrc%5Etfw"
            window.open(tweetURL, null,"width=650, height=300, personalbar=0, toolbar=0, scrollbars=1, sizable=1")
        };

        mainstage.addChild(resultWindowContainer);
        resultWindowContainer.addChild(messageBack,messageText,retryButton,tweetButton);
        resultWindowContainer.setTransform(game.centerGrid.x,game.centerGrid.y);
        resultWindowContainer.regX = 0;
        resultWindowContainer.regY = 0;
        resultWindowContainer.scaleX = 0;
        resultWindowContainer.scaleY = 0;
        messageText.alpha = 0;
        retryButton.alpha = 0;
        tweetButton.alpha = 0;
        
        createjs.Tween.get(resultWindowContainer)
        .to({scaleX:0.02,scaleY:0.02})
        .to({scaleX:1},250,createjs.Ease.cubicIn)
        .to({scaleY:1},250,createjs.Ease.cubicIn)
        .call(()=>{
            createjs.Tween.get(messageText)
            .to({alpha:1},100)
        })
        .wait(1100)
        .call(()=>{
            [retryButton,tweetButton].forEach(button=>{
                createjs.Tween.get(button)
                    .to({alpha:1},100)
            });
        });
        return;
    };

    const openMessageWindow = async(message :string)=>{
        const messageWindowContainer = new createjs.Container();
        const messageWindowtext = new createjs.Text(message, "30px serif","black");
        messageWindowtext.textBaseline = "middle";
        messageWindowtext.textAlign = "center";
        const messageBack = new createjs.Shape();
        messageBack.graphics.beginFill("white"); 
        messageBack.graphics.drawRect(0, 0, messageWindowtext.getMeasuredWidth()+50, cardImgSize.y);
        messageBack.alpha = 0.9;
        messageBack.regX = (messageWindowtext.getMeasuredWidth()+50)/2;;
        messageBack.regY = cardImgSize.y/2;
        mainstage.addChild(messageWindowContainer);
        messageWindowContainer.addChild(messageBack,messageWindowtext);
        messageWindowContainer.setTransform(game.centerGrid.x,game.centerGrid.y);
        messageWindowContainer.regX = 0;
        messageWindowContainer.regY = messageWindowContainer.getBounds().height/2;
        messageWindowContainer.scaleX = 0;
        messageWindowContainer.scaleY = 0;

        messageWindowtext.alpha = 0;
        mainstage.setChildIndex(messageWindowContainer,mainstage.numChildren-1);

        await new Promise((resolve, reject) => {
            createjs.Tween.get(messageWindowContainer)
            .to({scaleX:0.02,scaleY:0.02})
            .to({scaleX:1},250,createjs.Ease.cubicIn)
            .to({scaleY:1},250,createjs.Ease.cubicIn)
            .call(()=>{
                createjs.Tween.get(messageWindowtext)
                .to({alpha:1},100)
            })
            .wait(1100)
            .call(()=>{
                createjs.Tween.get(messageWindowtext)
                .to({alpha:0},100)
            })
            .to({scaleY:0.02},250,createjs.Ease.cubicIn)
            .to({scaleX:0},250,createjs.Ease.cubicIn)
            .call(()=>{resolve()});
        });
        mainstage.removeChild(messageWindowContainer);
        return;
    };

    const openHowtoWindow = ()=>{
        const cardConMouseEnabledOrg = cardContainer.mouseEnabled;
        cardContainer.mouseEnabled = false;
        howtoButton.mouseEnabled = false;

        const messageA ="ドグマブレードをぶん回し、先攻1ターンキルを達成しましょう。";
        const messageB ="《D-HERO ドグマガイ》《マジカル・エクスプロージョン》はターン終了後に自動で発動します。";
        const messageC1 ="デッキガイド："
        const messageC2 =" ドグマブレード｜ンマルギルドーニ｜note"
        const textA = new createjs.Text(messageA, "24px serif","black");
        const textB = new createjs.Text(messageB, "24px serif","black");
        const textC1 = new createjs.Text(messageC1, "24px serif","black");
        const textC2 = new createjs.Text(messageC2, "24px serif","black");
        textC2.color = "#1111cc";
        textC2.cursor = "pointer";
        const hitAreaShape = new createjs.Shape;
        hitAreaShape.set({
            graphics : new createjs.Graphics().beginFill("#FFF").drawEllipse(0,0,textC2.getMeasuredWidth(),textC2.getMeasuredHeight())
        });
        textC2.hitArea = hitAreaShape;
        textC2.addEventListener("click",clickTextC2);
        function clickTextC2(event) {
            window.open("https://note.com/gninallman3/n/nf330a71d5446")
        };        

        const textCcontainer = new createjs.Container;
        textCcontainer.addChild(textC1,textC2);
        textC2.x = textC1.getMeasuredWidth();

        const TextContainer = new createjs.Container();
        [textA,textB,textCcontainer].forEach((obj,i,a)=>{
            TextContainer.addChild(obj);
            obj.y = (textA.getMeasuredLineHeight()+20)*i;
        });
        TextContainer.regX = TextContainer.getBounds().width/2;
        TextContainer.regY = TextContainer.getBounds().height/2;

        const messageBack = new createjs.Shape();
        messageBack.graphics.beginFill("white"); 
        messageBack.graphics.drawRect(0, 0, TextContainer.getBounds().width+50, TextContainer.getBounds().height+200);
        messageBack.alpha = 0.9;
        messageBack.regX = (TextContainer.getBounds().width+50)/2;
        messageBack.regY = (TextContainer.getBounds().height+200)/2;

        const OkButton = createButton("OK", 150, 40, "#0275d8");
        OkButton.regX = OkButton.getBounds().width/2;
        OkButton.regY = OkButton.getBounds().height/2;
        OkButton.x = -75;
        OkButton.y = TextContainer.getBounds().height-20;
        OkButton.addEventListener("click",clickOkButton);
        function clickOkButton(event) {
            mainstage.removeChild(HowtoWindowContainer);
            cardContainer.mouseEnabled = cardConMouseEnabledOrg;
            howtoButton.mouseEnabled = true;
        };        

        const HowtoWindowContainer = new createjs.Container();
        HowtoWindowContainer.addChild(messageBack,TextContainer,OkButton);
        HowtoWindowContainer.setTransform(game.centerGrid.x,game.centerGrid.y,0,0,0,0,0,0,0);
        mainstage.addChild(HowtoWindowContainer);

        TextContainer.alpha = 0;
        OkButton.alpha = 0;
        createjs.Tween.get(HowtoWindowContainer)
            .to({scaleX:0.02,scaleY:0.02})
            .to({scaleX:1},250,createjs.Ease.cubicIn)
            .to({scaleY:1},250,createjs.Ease.cubicIn)
            .call(()=>{
                [TextContainer,OkButton].forEach(obj=>{
                    createjs.Tween.get(obj)
                    .to({alpha:1},100)
                });
            });
    };
};
