// EaselJS系の読み込み
import { Text, Shape, Stage, Bitmap, Container, Tween, Timeline} from 'createjs-module';
import { createButton }  from './createButton';
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
    }
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
        // for (let key of Object.keys(this)) {
        //     this[key] = [];
        // };
        this.summon = [];
        this.move = [];
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
    effectKey : string;
    SSconditionKey : string;
    button : {NS:button,SS:button,SET:button,ACTIVATE:button,FLIP:button,VIEW:button};
    category : string[] ;
    canDestroy : boolean ;
    constructor(){
        this.cardBackImageFileName = "cardback.jpeg";
        this.location = "DECK"
        this.face = "DOWN"
        this.effect = [];
        this.canDestroy = true ;
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
    position : "ATK"|"DEF";
    canNS : Boolean
    NSed : Boolean;
    reboarnCondition :Boolean;
    RuleSScondition : () =>Boolean;
    RuleSSpromise : () =>Promise<any>;
    actionPossible : {key: boolean[]}; 
    constructor(){
        super();
        this.cardType = "Monster";
        this.canNS = true;
        this.buff = [];
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
    actionPossible :(time:Time) => boolean;
    whenActive : (eff?: effect) => Promise<any>;
    whenResolve : (eff?: effect) => Promise<any>;
    apply : () => Promise<any>;
    mode : boolean;
    constructor(card:Card){
        this.card = card;
        this.targetCard = [];
        this.costCard = [];
        this.mode = true;
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

const zerofix = (num: number): string=>{
    if( num <= 0 ){
        return "0";
    }else{
        return num.toFixed();
    };
};

const genCenterText = (text:string)=>{
    const newText = new createjs.Text(text, "80px serif", "black");
    newText.textBaseline = "middle";
    newText.textAlign = "center";
    return newText
};

/**
 * jsonからカードオブジェクト生成
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
        return new Promise<Card>((resolve, reject) => {
            const cardlist = effArray.flatMap(eff => eff.card)
            openCardListWindow.select(cardlist,1,1,tmpEff,"発動する効果を選択してください",cancel);
            SelectOkButton.addEventListener("click",clickOkButton);
            function clickOkButton(e) {
                divSelectMenuContainer.style.visibility = "hidden";
                disprayStage.removeAllChildren();
                resolve(tmpEff.targetCard.pop());
            };
            SelectCancelButton.addEventListener("click",clickCancelButton);
            function clickCancelButton(e) {
                divSelectMenuContainer.style.visibility = "hidden";
                disprayStage.removeAllChildren();
                resolve();
            };
        });
    };

    /**
     * 永続チェック
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
     * 誘発、クイックエフェクトをチェック
     */
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
                    if(await(openYesNoWindow(activeEffOrg.card.cardName + "の効果を発動しますか？"))){
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

        mainCanv.style.pointerEvents = "auto";
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
     * 表示ボタン設定
     */
    const buttonSetting = {
        board: async(card: Card)=>{
            card.imgContainer.removeAllEventListeners();
            const buConArray = Object.values(card.button).map(b => b.buttonContainer)
            buConArray.forEach(b =>{
                b.removeAllEventListeners("click");
                b.visible=false;
            });

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
                // buConArray.forEach(b =>{b.removeAllEventListeners("click");});
            };

            card.button.VIEW.buttonContainer.addEventListener("click",handlViewbuttonClick);
            function handlViewbuttonClick(event) {
                openCardListWindow.view(game.GY,"GY");
                const clickOkButton = async (e) => {
                    divSelectMenuContainer.style.visibility = "hidden";
                    disprayStage.removeAllChildren();
                    SelectOkButton.removeEventListener("click", clickOkButton);
                };
                SelectOkButton.addEventListener("click",clickOkButton);
            };
        },
        DD:async(card:Card)=>{
            card.imgContainer.removeAllEventListeners();
            const buConArray = Object.values(card.button).map(b => b.buttonContainer)
            buConArray.forEach(button =>{
                button.removeAllEventListeners("click");
                button.visible=false;
            });

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

            card.button.VIEW.buttonContainer.addEventListener("click",handlViewbuttonClick);
            function handlViewbuttonClick(event) {
                openCardListWindow.view(game.DD,"DD");
                const clickOkButton = async (e) => {
                    divSelectMenuContainer.style.visibility = "hidden";
                    disprayStage.removeAllChildren();
                    SelectOkButton.removeEventListener("click", clickOkButton);
                };
                SelectOkButton.addEventListener("click",clickOkButton);
            };
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
            await buttonSetting.board(card);
        }else{
            await buttonSetting[to](card);
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
                            .call(()=>{mainstage.setChildIndex(card.imgContainer,mainstage.numChildren-1)})
                            .to({x:toX,y:toY,scaleX:1.5,scaleY:1.5},400,createjs.Ease.cubicOut)
                            .to({scaleX:1,scaleY:1},400,createjs.Ease.cubicIn)
                            .wait(200)
                    }else{
                        return createjs.Tween.get(card.imgContainer)
                            .call(()=>{mainstage.setChildIndex(card.imgContainer,mainstage.numChildren-1)})
                            .to({x:toX,y:toY},500,createjs.Ease.cubicOut)
                    };
                };
                if(position=="DEF"){
                    if(card instanceof MonsterCard){
                        return createjs.Tween.get(card.imgContainer)
                            .call(()=>{mainstage.setChildIndex(card.imgContainer,mainstage.numChildren-1)}) 
                            .to({x:toX,y:toY,rotation:-90,scaleX:1.5,scaleY:1.5},400,createjs.Ease.cubicOut)
                            .to({scaleX:1,scaleY:1},400,createjs.Ease.cubicIn)
                    };
                };
                if(position=="SET"){
                    if(card instanceof MonsterCard){
                        return createjs.Tween.get(card.imgContainer)
                                .call(()=>{mainstage.setChildIndex(card.imgContainer,mainstage.numChildren-1)})
                                .call(()=>{cardFlip(card)})
                                .to({x:toX,y:toY,rotation:-90},500,createjs.Ease.cubicOut);
                    }
                    else{
                        return createjs.Tween.get(card.imgContainer)
                                .call(()=>{mainstage.setChildIndex(card.imgContainer,mainstage.numChildren-1)})
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
            const toX : number = game.displayOrder.gy[0][0]+(game.GY.length-1)*1
            const toY : number = game.displayOrder.gy[0][1]-(game.GY.length-1)*1
            return new Promise((resolve, reject) => {
                if (card.face=="DOWN"){
                    cardFlip(card);
                };
                createjs.Tween.get(card.imgContainer)
                    .call(()=>{mainstage.setChildIndex(card.imgContainer,mainstage.numChildren-1)})
                    .to({x:toX,y:toY,rotation:0},500,createjs.Ease.cubicOut)
                    .call(()=>{resolve()});
            }); 
        },
        fromGY:(card: Card)=>{
            mainstage.setChildIndex(card.imgContainer,mainstage.numChildren-1);
            const PromiseArray :Promise<unknown>[] = [];
            game.GY.map((card, index, array) => {
                const twPromise = () => {
                    return new Promise((resolve, reject) => {
                    createjs.Tween.get(card.imgContainer)
                        .to({x:game.displayOrder.gy[0][0]+index*1,y:game.displayOrder.gy[0][1]-index*1})
                        .call(()=>{mainstage.setChildIndex(card.imgContainer,mainstage.numChildren - array.length + index)})
                        .call(()=>{resolve()});                
                    });
                };
                PromiseArray.push(twPromise());
            });
            return Promise.all(PromiseArray);
        },
        toDD:(card: Card)=>{
            const toX : number = game.displayOrder.dd[0][0]+(game.DD.length-1)*1
                const toY : number = game.displayOrder.dd[0][1]-(game.DD.length-1)*1
                return new Promise((resolve, reject) => {
                    if (card.face=="DOWN"){
                        cardFlip(card);
                    };
                    createjs.Tween.get(card.imgContainer)
                        .call(()=>{mainstage.setChildIndex(card.imgContainer,mainstage.numChildren-1)})
                        .to({x:toX,y:toY,rotation:0},500,createjs.Ease.cubicOut)
                        .call(()=>{resolve()});
                }); 
        },
        fromDD:(card: Card)=>{
            mainstage.setChildIndex(card.imgContainer,mainstage.numChildren-1);
            const PromiseArray :Promise<unknown>[] = [];
            game.DD.map((card, index, array) => {
                const twPromise = () => {
                    return new Promise((resolve, reject) => {
                    createjs.Tween.get(card.imgContainer)
                        .to({x:game.displayOrder.dd[0][0]+index*1,y:game.displayOrder.dd[0][1]-index*1})
                        .call(()=>{mainstage.setChildIndex(card.imgContainer,mainstage.numChildren - array.length + index)})
                        .call(()=>{resolve()});                
                    });
                };
                PromiseArray.push(twPromise());
            });
            return Promise.all(PromiseArray);
        },
        toDECK:(card: Card)=>{
            const toX : number = game.displayOrder.deck[0][0]+(game.DECK.length-1)*1
            const toY : number = game.displayOrder.deck[0][1]-(game.DECK.length-1)*1
            return new Promise((resolve, reject) => {
                if (card.face=="UP"){
                    cardFlip(card);
                };
                createjs.Tween.get(card.imgContainer)
                    .call(()=>{mainstage.setChildIndex(card.imgContainer,mainstage.numChildren-1)})
                    .to({x:toX,y:toY,rotation:0},500,createjs.Ease.cubicOut)
                    .call(()=>{resolve()});
            }); 
        },
    };

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
                                .to({x:game.displayOrder.gy[0][0]+index*1,y:game.displayOrder.gy[0][1]-index*2})
                                .call(()=>{mainstage.setChildIndex(c.imgContainer,mainstage.numChildren - array.length + index)})             
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
        mainCanv.style.pointerEvents = "none"
        const Effect = card.effect.find(Eff => Eff.effType == "CardActived")
        const ActivedEffect = {...Effect,targetCard:[],costCard:[]}
        game.nowTime = new Time;
        await moveCard.HAND.toBOARD(card,"ATK");
        await animationChainEffectActivate(ActivedEffect);
        await ActivedEffect.whenActive(ActivedEffect);
        game.timeArray.push({...game.nowTime});
        game.chain.push(ActivedEffect);
        await TriggerQuickeEffect();
        mainCanv.style.pointerEvents = "auto"
        return
    };

    /**
     * 墓地の起動効果発動
     */
    const GyEffActivate = async() => {
        mainCanv.style.pointerEvents = "none";
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
        mainCanv.style.pointerEvents = "auto"
        return
    };

    /**
     * 場の起動効果発動
     */
    const BoardIgnitionActivate = async(card:Card) => {
        mainCanv.style.pointerEvents = "none"
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
        mainCanv.style.pointerEvents = "auto"
        return
    };

    /**
     * 場の魔法発動
     */
    const fieldSpellActivate =  async(card: SpellCard) => {
        mainCanv.style.pointerEvents = "none"
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
        mainCanv.style.pointerEvents = "auto"
        return
    };

    /**
     * 魔法罠セット
     */
    const SpellTrapSet = {
        fromHAND:async(card: SpellCard|TrapCard) => {
            await moveCard.HAND.toBOARD(card,"SET");
            // game.timeArray.push({...game.nowTime});
            await TriggerQuickeEffect();
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
        mainCanv.style.pointerEvents = "none"
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

            await new Promise((resolve, reject) => {
                openCardListWindow.select(cardlist,numberToRelease,numberToRelease,tmpEff,"リリースするモンスターを"+numberToRelease+"体選択してください");
                const clickOkButton = async (e) => {
                    console.log("Release " + tmpEff.targetCard.map(({ cardName }) => cardName))
                    divSelectMenuContainer.style.visibility = "hidden";
                    disprayStage.removeAllChildren();
                    SelectOkButton.removeEventListener("click", clickOkButton);
                    game.nowTime = new Time;
                    await release(tmpEff.targetCard,"ADVANCE")
                    game.timeArray.push({...game.nowTime});
                    resolve();
                };
                SelectOkButton.addEventListener("click",clickOkButton);
            });
        };

        // game.normalSummon = false;
        // game.countNS += 1;
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
        mainCanv.style.pointerEvents = "auto"
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
        const LPtext = new createjs.Text("-"+cost, "80px serif","black");
        LPtext.textBaseline = "middle";
        LPtext.textAlign = "center";
        LPtext.x = game.grid.front[3][0];
        LPtext.y = (game.grid.front[0][1]+game.grid.back[0][1])/2;
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
     * ダメージ
     */
    const dealDamage = async(point:number)=>{
        const LPtext = new createjs.Text("-"+point, "80px serif","red");
        LPtext.textBaseline = "middle";
        LPtext.textAlign = "center";
        LPtext.x = game.grid.front[3][0];
        LPtext.y = (game.grid.front[0][1]+game.grid.back[0][1])/2;
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

    const disprayMessageWindow = async(message :string)=>{
        mainstage.setChildIndex(messageWindowContainer,mainstage.numChildren-1)
        messageWindowtext.text = message;
        messageWindowtext.alpha = 0;
        messageWindowContainer.scaleX = 0;
        messageWindowContainer.scaleY = 0;
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
        return;
    };

    /**
     * 捨てる
     */
    const discard = async(cardArray : Card[]) => {
        await (async () => {
            for(let card of cardArray){
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
                game.nowTime.move.push({
                    card:card,
                    from:from,
                    to:"DD"
                });
                await moveCard[from].toDD(card);
                console.log("vanish "+card.cardName+" by "+by);
            };
        })();
        await ContinuousEffect(game.nowTime);
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
                await moveCard[from].toDECK(card);
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
                    await moveCard.BOARD.toHAND(card);
                    game.nowTime.move.push({
                        card:card,
                        from:"BOARD",
                        to:"HAND"
                    });
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
                game.nowTime.release.push({
                    card:card,
                    by:by
                });
                await ContinuousEffect(game.nowTime);

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
                await destroyAnimation(card);
                await ContinuousEffect(game.nowTime);

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
     * 装備する
     */
    const Equip = async(card:SpellCard,eff: effect)=>{
        card.peggingTarget = eff.targetCard;
        const targetCard = card.peggingTarget[0];
        const genEquipImg = ()=>{
            const equipImg = new createjs.Bitmap("equip.png");
            equipImg.setTransform(card.imgContainer.x, card.imgContainer.y, 0.5, 0.5);
            equipImg.regX = 64;
            equipImg.regY = 64;
            equipImg.mouseEnabled = false;
            return equipImg
        };
        return new Promise<void>(async(resolve, reject) => {
            await new Promise(async(resolve, reject) => {
                const equipImg = genEquipImg();
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

            const equipMarkSPELL = genEquipImg();
            const equipMarkMON = genEquipImg();

            card.imgContainer.addEventListener("mouseover", handleEquipMover);
            targetCard.imgContainer.addEventListener("mouseover", handleEquipMover);
            function handleEquipMover(event) {
                if(card.peggingTarget.length>0){
                    equipMarkSPELL.setTransform(card.imgContainer.x, card.imgContainer.y,0.5,0.5);
                    equipMarkSPELL.regX = 64;
                    equipMarkSPELL.regY = 64;
                    mainstage.addChild(equipMarkSPELL);
                    equipMarkMON.setTransform(targetCard.imgContainer.x, targetCard.imgContainer.y,0.5,0.5);
                    equipMarkMON.regX = 64;
                    equipMarkMON.regY = 64;
                    mainstage.addChild(equipMarkMON);
                }; 
            };
            card.imgContainer.addEventListener("mouseout", handleEquipMout);
            targetCard.imgContainer.addEventListener("mouseout", handleEquipMout);
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
        }
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
                    .to({x:game.displayOrder.deck[0][0]+index*1,y:game.displayOrder.deck[0][1]-index*1},100)
                    .call(()=>{mainstage.setChildIndex(card.imgContainer,mainstage.numChildren - array.length + index)})
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
        game.DECK = deck;
        game.DECK.map((card, index, array) => {
            puton(stage, card, game.displayOrder.deck[0][0]+index*1,game.displayOrder.deck[0][1]-index*1);
        })
    }

    /**
     * 手札を現在のデータに合わせた位置に移動するアニメーション
     * 手札出し入れの際に呼ぶやつ
     */
    const animationHandAdjust = () => {  
        const leftEndPosition = game.displayOrder.hand[0] - (game.HAND.length - 1) / 2 * (cardImgSize.x+cardImgSize.margin)
        const PromiseArray :Promise<unknown>[] = [];
        game.HAND.map((card, index, array) => {
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
        if(game.DECK.length < count) {
            console.log("deck0");
            return ;
        };
        return new Promise<void>(async(resolve, reject) => {
            await (async () => {
                for (let i = 0; i < count ; i++){
                    const targetCard = game.DECK[game.DECK.length -1];
                    await moveCard.DECK.toHAND(targetCard);
                    console.log("draw");
                };
            })();
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
     * チェーン1で優先権ある時発動できる効果
     */
    const canActiveEffects =(card:Card)=>{
        return card.effect.filter(eff => 
            (eff.effType=="CardActived"||eff.effType=="Quick"||eff.effType=="Ignition") &&
            eff.actionPossible({}));
    };

    /**
     * 装備魔法が場から離れたとき装備解除する効果
     */
    const equipDisEnchant = (card:SpellCard) =>{
        const disEnchant = new effect(card);
        disEnchant.effType = "Rule";
        disEnchant.actionPossible = (time:Time) =>{
            const timeCondition = (()=>{
                const timeBoolArray :boolean[] = [];
                time.move.forEach(tMove=>{
                    timeBoolArray.push(tMove.card==card && tMove.from=="BOARD");
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
                time.move.forEach(tMove=>{
                    timeBoolArray.push(card.peggingTarget.includes(tMove.card));
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
                await new Promise(async(resolve, reject) => {
                    const cardlistA = genCardArray({location:["MO"],category:["D-HERO"]});
                    const clickOkButtonA = async (e) => {
                        divSelectMenuContainer.style.visibility = "hidden";
                        disprayStage.removeAllChildren();
                        SelectOkButton.removeEventListener("click", clickOkButtonA);
                        resolve();
                    };
                    SelectOkButton.addEventListener("click",clickOkButtonA);
                    await openCardListWindow.select(cardlistA,1,1,tmpEffA,"リリースするD-HEROを"+1+"体選択してください");
                });
                
                const tmpEffB = new effect(new Card);
                await new Promise(async(resolve, reject) => {
                    const cardlistB = genCardArray({location:["MO"]}).filter(card=>!( tmpEffA.targetCard.includes(card) ));
                    const clickOkButtonB = async (e) => {
                        const releaseArray = tmpEffB.targetCard.concat(tmpEffA.targetCard);
                        console.log("Release " + releaseArray.map(({ cardName }) => cardName))
                        divSelectMenuContainer.style.visibility = "hidden";
                        disprayStage.removeAllChildren();
                        SelectOkButton.removeEventListener("click", clickOkButtonB);
                        game.nowTime = new Time;
                        await release(releaseArray,"COST")
                        game.timeArray.push({...game.nowTime});
                        resolve();
                    };
                    SelectOkButton.addEventListener("click",clickOkButtonB);
                    await openCardListWindow.select(cardlistB,2,2,tmpEffB,"リリースするモンスターを"+2+"体選択してください");
                });
                await SpecialSummon.fromHAND([card],true);
            };
        },
    };

    const shadPhase = async(phase:"DRAW PHASE"|"STANBY PHASE"|"MAIN PHASE"|"TURN END") => {
        const phaseText = genCenterText(phase);
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

    const gameStart = async()=>{
        mainCanv.style.pointerEvents = "none";
        await deckShuffle();
        await draw(5);
        await shadPhase("DRAW PHASE")
        await draw(1);
        await shadPhase("STANBY PHASE");
        await shadPhase("MAIN PHASE");
        mainCanv.style.pointerEvents = "auto";
    };

    const gameEnd = async()=>{
        mainCanv.style.pointerEvents = "none";
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
        await (async () => {
            for (let i = 0; i < magiexArray.length ; i++){
                await cardFlip(magiexArray[i]);
                await animationChainEffectActivate(magiexArray[i].effect[0]);
                await magiexArray[i].effect[0].whenResolve(magiexArray[i].effect[0]);
                await moveCard.BOARD.toGY(magiexArray[i]);
            };
        })();
        await timeout(1000);
        const winLose = (()=>{
           if(game.enemyLifePoint<=0){
                return genCenterText("YOU WIN!");
            }else{
                return genCenterText("YOU LOSE");
            }; 
        })()
        winLose.x = game.centerGrid.x;
        winLose.y = game.centerGrid.y;
        mainstage.addChild(winLose);
    };
    
    /**
     * カード毎の効果セット
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
            eff1.effType = "Trigger"
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
                    genCardArray({category:["HERO"],location:["DECK"]}).length > 0];
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
                    if(genCardArray({category:["HERO"],location:["DECK"]}).length > 0){
                        await new Promise((resolve, reject) => {
                            const cardlist = genCardArray({category:["HERO"],location:["DECK"]});
                            openCardListWindow.select(cardlist,1,1,eff,"手札に加えるHEROを選択してください");
                            SelectOkButton.addEventListener("click",clickOkButton);
                            function clickOkButton(e) {
                                divSelectMenuContainer.style.visibility = "hidden";
                                disprayStage.removeAllChildren();
                                SelectOkButton.removeEventListener("click", clickOkButton);
                                resolve();
                            };
                        });
                        await search(eff.targetCard);
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
                    genCardArray({location:["DECK"]}).length > 0
                ];
                return boolarray.every(value => value)
            };
            eff1.whenActive = (eff :effect) => {
                return new Promise((resolve, reject) => {
                    const cardlist = genCardArray({location:["MO","ST","FIELD"]});
                    const selectmax = (()=>{
                        if(game.DECK.length >= 2){
                            return 2
                        }else{
                            return 1
                        };
                    })();
                    openCardListWindow.select(cardlist,1,selectmax,eff,"破壊するカードを選択してください");
                    SelectOkButton.addEventListener("click",clickOkButton);
                    async function clickOkButton(e) {
                        divSelectMenuContainer.style.visibility = "hidden";
                        disprayStage.removeAllChildren();
                        SelectOkButton.removeEventListener("click", clickOkButton);
                        await animationEffectTarget(eff.targetCard)
                        resolve();
                    };
                });
            };
            eff1.whenResolve = (eff :effect) => {
                return new Promise<void>(async(resolve, reject) => {
                    game.nowTime = new Time;
                    const targetLocation = ["ST","MO","FIELD"]
                    const target = eff.targetCard.filter(card=>targetLocation.includes(card.location))
                    await destroy(target,"EFFECT");
                    await draw(target.length);
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
墓地の魔法をデッキトップに置く`);
                    }else if(conditionA()){
                        eff.mode = true;
                    }else{
                        eff.mode = false;
                    };

                    if(eff.mode){
                        const cardlist = genCardArray({location:["MO"]}).filter(c=> c!=card);
                        openCardListWindow.select(cardlist,1,1,eff);
                        const clickOkButton = async (e) => {
                            divSelectMenuContainer.style.visibility = "hidden";
                            disprayStage.removeAllChildren();
                            SelectOkButton.removeEventListener("click", clickOkButton);
                            eff.targetCard.push(card);
                            await animationEffectTarget(eff.targetCard);
                            resolve();
                        };
                        SelectOkButton.addEventListener("click",clickOkButton);
                    }else{
                        const cardlist = genCardArray({location:["GY"],cardType:["Spell"]});
                        openCardListWindow.select(cardlist,1,1,eff,"デッキトップに置く魔法を"+1+"枚選択してください");
                        const clickOkButton = async (e) => {
                            divSelectMenuContainer.style.visibility = "hidden";
                            disprayStage.removeAllChildren();
                            SelectOkButton.removeEventListener("click", clickOkButton);
                            resolve();
                        };
                        SelectOkButton.addEventListener("click",clickOkButton);
                    };
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
                        await new Promise((resolve, reject) => {
                            openCardListWindow.select(game.HAND,1,1,tmpEff,"除外する手札を1枚選択してください");
                            SelectOkButton.addEventListener("click",clickOkButton);
                            function clickOkButton(e) {
                                tmpEff.targetCard.push(card);
                                divSelectMenuContainer.style.visibility = "hidden";
                                disprayStage.removeAllChildren();
                                SelectOkButton.removeEventListener("click", clickOkButton);
                                resolve();
                            };
                        });
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
                return new Promise((resolve, reject) => {
                    const cardlist = game.GY.filter(card=>card instanceof SpellCard);
                    openCardListWindow.select(cardlist,1,1,eff);
                    const clickOkButton = async (e) => {
                        divSelectMenuContainer.style.visibility = "hidden";
                        disprayStage.removeAllChildren();
                        SelectOkButton.removeEventListener("click", clickOkButton);
                        await animationEffectTarget(eff.targetCard);
                        resolve();
                    };
                    SelectOkButton.addEventListener("click",clickOkButton);
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
                    time.destroy.forEach(tDestroy=>{
                        timeBoolArray.push(tDestroy.card== card);
                    });
                    time.release.forEach(tRelease=>{
                        timeBoolArray.push(tRelease.card== card);
                    });
                    return timeBoolArray.some(value => value);
                })();
                const boolarray = [
                card.face=="UP",
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
                        await new Promise((resolve, reject) => {
                            openCardListWindow.select(cardlist,1,1,eff,"手札に加えるカードを選択してください");
                            SelectOkButton.addEventListener("click",clickOkButton);
                            function clickOkButton(e) {
                                divSelectMenuContainer.style.visibility = "hidden";
                                disprayStage.removeAllChildren();
                                SelectOkButton.removeEventListener("click", clickOkButton);
                                resolve();
                            };
                        });
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
                    genCardArray({category:["D-HERO"],location:["HAND"]}).length > 0
                ];
                return boolarray.every(value => value==true)
            };
            eff1.whenActive = (eff :effect) => {
                return new Promise((resolve, reject) => {
                    const cardlist = genCardArray({category:["D-HERO"],location:["HAND"]});
                    openCardListWindow.select(cardlist,1,1,eff);
                    const clickOkButton = async (e) => {
                        console.log("cost " + eff.targetCard.map(({ cardName }) => cardName))
                        divSelectMenuContainer.style.visibility = "hidden";
                        disprayStage.removeAllChildren();
                        await discard(eff.targetCard);
                        SelectOkButton.removeEventListener("click", clickOkButton);
                        resolve();
                    };
                    SelectOkButton.addEventListener("click",clickOkButton);
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
                return new Promise((resolve, reject) => {
                    const cardlist = game.GY.filter(card=>card instanceof MonsterCard && card.canNS);
                    openCardListWindow.select(cardlist,1,3,eff);
                    const clickOkButton = async (e) => {
                        divSelectMenuContainer.style.visibility = "hidden";
                        disprayStage.removeAllChildren();
                        SelectOkButton.removeEventListener("click", clickOkButton);
                        await animationEffectTarget(eff.targetCard);
                        resolve();
                    };
                    SelectOkButton.addEventListener("click",clickOkButton);
                });
            };
            eff1.whenResolve = (eff :effect) => {
                return new Promise<void>(async(resolve, reject) => {
                    const targetarray = eff.targetCard.filter(card=>card.location=="GY");
                    game.nowTime = new Time;
                    await SpecialSummon.fromGY(targetarray.reverse(),true);
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
                    game.myLifePoint > eff1.lifeCost,
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
                    openCardListWindow.select(cardlist,1,1,eff);
                    const clickOkButton = async (e) => {
                        divSelectMenuContainer.style.visibility = "hidden";
                        disprayStage.removeAllChildren();
                        SelectOkButton.removeEventListener("click", clickOkButton);
                        await animationEffectTarget(eff.targetCard);
                        resolve();
                    };
                    SelectOkButton.addEventListener("click",clickOkButton);
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
                        timeBoolArray.push(tDestroy.card== card);
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
                    card.peggingTarget = [];
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
                return new Promise((resolve, reject) => {
                    const cardlist = genCardArray({location:["MO"]});
                    openCardListWindow.select(cardlist,1,1,eff);
                    const clickOkButton = async (e) => {
                        console.log("cost " + eff.targetCard.map(({ cardName }) => cardName))
                        divSelectMenuContainer.style.visibility = "hidden";
                        disprayStage.removeAllChildren();
                        await release(eff.targetCard,"COST");
                        SelectOkButton.removeEventListener("click", clickOkButton);
                        resolve();
                    };
                    SelectOkButton.addEventListener("click",clickOkButton);
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
                            await SpecialSummon.fromDECK([decktop()],true);
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
                return new Promise((resolve, reject) => {
                    const cardlist = genCardArray({face:["UP"],location:["MO"],race:["WARRIOR"]});
                    openCardListWindow.select(cardlist,1,1,eff);
                    const clickOkButton = async (e) => {
                        divSelectMenuContainer.style.visibility = "hidden";
                        disprayStage.removeAllChildren();
                        SelectOkButton.removeEventListener("click", clickOkButton);
                        await animationEffectTarget(eff.targetCard);
                        resolve();
                    };
                    SelectOkButton.addEventListener("click",clickOkButton);
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
                return new Promise((resolve, reject) => {
                    const cardlist = genCardArray({race:["WARRIOR"],location:["GY"]});
                    openCardListWindow.select(cardlist,2,2,eff);
                    const clickOkButton = async (e) => {
                        console.log("cost " + eff.targetCard.map(({ cardName }) => cardName))
                        divSelectMenuContainer.style.visibility = "hidden";
                        disprayStage.removeAllChildren();
                        await vanish(eff.targetCard,"COST");
                        SelectOkButton.removeEventListener("click", clickOkButton);
                        resolve();
                    };
                    SelectOkButton.addEventListener("click",clickOkButton);
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
                    game.myLifePoint > eff1.lifeCost,
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
                            await new Promise((resolve, reject) => {
                                openCardListWindow.select(canNSmonster,blankMonsterZone,blankMonsterZone,eff);
                                const clickOkButton = async (e) => {
                                    divSelectMenuContainer.style.visibility = "hidden";
                                    disprayStage.removeAllChildren();
                                    SelectOkButton.removeEventListener("click", clickOkButton);
                                    resolve();
                                };
                                SelectOkButton.addEventListener("click",clickOkButton);
                            });
                        }else{
                            eff.targetCard = canNSmonster;
                        };
                        await SpecialSummon.fromDD(eff.targetCard,true);
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
                        await disprayMessageWindow(decrearLevel + " が宣言されました");
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
                                await SpecialSummon.fromDECK([decktop()],true);
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
                    await new Promise((resolve, reject) => {
                        openCardListWindow.select(game.HAND,1,1,eff);
                        const clickOkButton = async (e) => {
                            console.log("cost " + eff.targetCard.map(({ cardName }) => cardName))
                            divSelectMenuContainer.style.visibility = "hidden";
                            disprayStage.removeAllChildren();
                            await discard(eff.targetCard);
                            SelectOkButton.removeEventListener("click", clickOkButton);
                            resolve();
                        };
                        SelectOkButton.addEventListener("click",clickOkButton);
                    });

                    openCardListWindow.select(cardlist,1,1,eff);
                    const clickOkButton = async (e) => {
                        divSelectMenuContainer.style.visibility = "hidden";
                        disprayStage.removeAllChildren();
                        SelectOkButton.removeEventListener("click", clickOkButton);
                        await animationEffectTarget(eff.targetCard);
                        resolve();
                    };
                    SelectOkButton.addEventListener("click",clickOkButton);
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
                    time.destroy.forEach(tDestroy=>{
                        timeBoolArray.push(tDestroy.card== card);
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
                    card.peggingTarget = [];
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
                    game.HAND.filter(c=>c instanceof MonsterCard && c.level==8).length > 0
                    // genCardArray({level:[8],location:["HAND"]}).length > 0
                ];
                return boolarray.every(value => value==true)
            };
            eff1.whenActive = (eff :effect) => {
                return new Promise((resolve, reject) => {
                    // const cardlist = genCardArray({level:[8],location:["HAND"]});
                    const cardlist = game.HAND.filter(c=>c instanceof MonsterCard && c.level==8);
                    openCardListWindow.select(cardlist,1,1,eff);
                    const clickOkButton = async (e) => {
                        console.log("cost " + eff.targetCard.map(({ cardName }) => cardName))
                        divSelectMenuContainer.style.visibility = "hidden";
                        disprayStage.removeAllChildren();
                        await discard(eff.targetCard);
                        SelectOkButton.removeEventListener("click", clickOkButton);
                        resolve();
                    };
                    SelectOkButton.addEventListener("click",clickOkButton);
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
                    const cardlist = game.GY.filter(card=>card instanceof SpellCard)
                    await new Promise((resolve, reject) => {
                        openCardListWindow.select(game.HAND,2,2,eff);
                        const clickOkButton = async (e) => {
                            console.log("cost " + eff.targetCard.map(({ cardName }) => cardName))
                            divSelectMenuContainer.style.visibility = "hidden";
                            disprayStage.removeAllChildren();
                            await discard(eff.targetCard);
                            SelectOkButton.removeEventListener("click", clickOkButton);
                            resolve();
                        };
                        SelectOkButton.addEventListener("click",clickOkButton);
                    });

                    openCardListWindow.select(cardlist,1,1,eff);
                    const clickOkButton = async (e) => {
                        divSelectMenuContainer.style.visibility = "hidden";
                        disprayStage.removeAllChildren();
                        SelectOkButton.removeEventListener("click", clickOkButton);
                        await animationEffectTarget(eff.targetCard);
                        resolve();
                    };
                    SelectOkButton.addEventListener("click",clickOkButton);
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
                    game.DECK.length >= game.HAND.length
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
                    game.ST.filter(c=> c!=card).length >= 1
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
                    await bounce(game.ST,"EFFECT");
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
                        await new Promise((resolve, reject) => {
                            openCardListWindow.select(cardlist,1,1,eff,"手札に加えるカードを選択してください");
                            SelectOkButton.addEventListener("click",clickOkButton);
                            function clickOkButton(e) {
                                divSelectMenuContainer.style.visibility = "hidden";
                                disprayStage.removeAllChildren();
                                SelectOkButton.removeEventListener("click", clickOkButton);
                                resolve();
                            };
                        });
                        if(eff.targetCard[0].location=="DECK"){
                            await search(eff.targetCard);
                        }else if(eff.targetCard[0].location=="GY"){
                            await moveCard.GY.toHAND(eff.card);
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
                    time.move.forEach(tMove=>{
                        timeBoolArray.push(tMove.card==card && tMove.from=="BOARD");
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
                        await new Promise((resolve, reject) => {
                            openCardListWindow.select(game.DECK,1,1,eff,"除外するカードを選択してください");
                            SelectOkButton.addEventListener("click",clickOkButton);
                            function clickOkButton(e) {
                                divSelectMenuContainer.style.visibility = "hidden";
                                disprayStage.removeAllChildren();
                                SelectOkButton.removeEventListener("click", clickOkButton);
                                resolve();
                            };
                        });
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
            eff1.range = ["HAND","ST"]
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
        }
    };

    const game = new Game;

    const mainCanv =<HTMLCanvasElement>document.getElementById("canv") ;
    const mainstage = new createjs.Stage(mainCanv);
    mainstage.enableMouseOver();

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

    const messageWindowContainer = new createjs.Container();
    const messageWindowtext = new createjs.Text("-", "36px serif","black");
    messageWindowtext.textBaseline = "middle";
    messageWindowtext.textAlign = "center";
    const messageBack = new createjs.Shape();
    messageBack.graphics.beginFill("white"); 
    messageBack.graphics.drawRect(0, 0, cardImgSize.x*4, cardImgSize.y);
    messageBack.alpha = 0.5;
    messageWindowContainer.addChild(messageBack,messageWindowtext);
    messageBack.regX = cardImgSize.x*2;
    messageBack.regY = cardImgSize.y/2;
    messageWindowContainer.setTransform(game.grid.front[3][0],(game.grid.front[0][1]+game.grid.back[0][1])/2);
    messageWindowContainer.regX = messageWindowContainer.getBounds().width/2;
    messageWindowContainer.regY = messageWindowContainer.getBounds().height/2;
    messageWindowContainer.scaleX = 0;
    messageWindowContainer.scaleY = 0;
    mainstage.addChild(messageWindowContainer);


    setBoard(mainstage);

    const myLP = new createjs.Text(game.myLifePoint.toString(), "80px serif", "#4169e1");
    myLP.textBaseline = "bottom";
    myLP.y = 800;
    mainstage.addChild(myLP);
    const EnemyLP = new createjs.Text(game.enemyLifePoint.toString(), "80px serif", "#cd5c5c");
    EnemyLP.textAlign = "right";
    EnemyLP.x = 1450;
    mainstage.addChild(EnemyLP);

    const deckRecipe :{json:Object,num:number}[] = [
        {json:status.Dogma, num:3},
        {json:status.CyberVary, num:2},
        {json:status.Airman, num:1},
        {json:status.Kuraz, num:1},
        {json:status.Disk, num:1},
        {json:status.MagicianOfChaos, num:1},
        {json:status.MonsterGate, num:3},
        {json:status.Reasoning, num:3},
        {json:status.DestinyDraw, num:3},
        {json:status.HiddenArmory, num:3},
        {json:status.TradeIn, num:2},
        {json:status.PhenixBlade, num:2},
        {json:status.Reinforcement, num:2},
        {json:status.DDR, num:2},
        {json:status.MagicStoneExcavation, num:2},
        {json:status.HandDestruction, num:1},
        {json:status.PrematureBrial, num:1},
        {json:status.MonsterReborn, num:1},
        {json:status.Hurricane, num:1},
        {json:status.GoldSalcophagus, num:1},
        {json:status.DimensionFusion, num:1},
        {json:status.SpellEconomics, num:1},
        {json:status.MagicalExplosion, num:2}
    ];

    deckRecipe.forEach((numOfCard,index,array)=>{
        const json = numOfCard.json;
        for(let i = 0; i < numOfCard.num ; i++){
            if(json["cardType"]=="Monster"){
                const monsterCardObj = genCardObject.Monster(json);
                console.log(monsterCardObj.cardName);
                if(monsterCardObj.monsterType=="Effect"){
                    monsterCardObj.effect = effectSetting[monsterCardObj.effectKey](monsterCardObj);
                };
                if(!(monsterCardObj.canNS)){
                    monsterCardObj.RuleSSpromise = SSconditionSetting[monsterCardObj.SSconditionKey](monsterCardObj);
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

    deckset(mainstage, Array.from(game.defaultDeck));
    console.log(game.DECK); 

    const drawButton = createButton("draw", 150, 40, "#0275d8");
    drawButton.x = 1200;
    drawButton.y = 550;
    mainstage.addChild(drawButton);

    drawButton.on("click", function(e){
        draw(1);
    }, null, false);

    const shuffleButton = createButton("shuffle", 150, 40, "#0275d8");
    shuffleButton.x = 1200;
    shuffleButton.y = 600;
    mainstage.addChild(shuffleButton);

    shuffleButton.on("click", function(e){
        deckShuffle();
    }, null, false);

    const DeckViewButton = createButton("DECK View", 150, 40, "#0275d8");
    DeckViewButton.x = 1200;
    DeckViewButton.y = 650;
    mainstage.addChild(DeckViewButton);

    DeckViewButton.on("click", function(e){
        openCardListWindow.view(game.DECK,"DECK");
        console.log(game.DECK)
        const clickOkButton = async (e) => {
            divSelectMenuContainer.style.visibility = "hidden";
            disprayStage.removeAllChildren();
            SelectOkButton.removeEventListener("click", clickOkButton);
        };
        SelectOkButton.addEventListener("click",clickOkButton);
    }, null, false);

    const testButton = createButton("test", 150, 40, "#0275d8");
    testButton.x = 1200;
    testButton.y = 700;
    mainstage.addChild(testButton);

    testButton.on("click", function async(e){
        // discard(game.HAND);
        // OpenSelectEffectWindow(new Card,"tttttA","tttttB");
        // disprayMessageWindow("aaaaaaaaaaaaaaaaaaaaa")
        // vanish(game.HAND,"EFFECT");
        // shadPhase("DRAW PHASE");
        gameStart();
    }, null, false);

    const endButton = createButton("TURN END", 150, 40, "#0275d8");
    endButton.x = 1200;
    endButton.y = 750;
    mainstage.addChild(endButton);

    endButton.on("click", function async(e){
        // discard(game.HAND);
        // OpenSelectEffectWindow(new Card,"tttttA","tttttB");
        // disprayMessageWindow("aaaaaaaaaaaaaaaaaaaaa")
        // vanish(game.HAND,"EFFECT");
        // shadPhase("DRAW PHASE");
        gameEnd();
    }, null, false);

    createjs.Ticker.addEventListener("tick", handleTick);
    function handleTick() {
        mainstage.update();
        windowBackStage.update();
        disprayStage.update();
        selectButtonStage.update();
        myLP.text = zerofix(game.myLifePoint);
        EnemyLP.text = zerofix(game.enemyLifePoint);
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
        select: (cardArray  :Card[], moreThan :Number, lessThan :Number, activeEff :effect,message? :string,cansel? :boolean) => {
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
                        if(activeEff.targetCard.length==lessThan){
                            selectedCardImgArray[0].selected.visible = false;
                            activeEff.targetCard.shift();
                            selectedCardImgArray.shift();
                        };
                        selected.visible = true;
                        activeEff.targetCard.push(card);
                        selectedCardImgArray.push(selectedCardImg);
                    }else{
                        selected.visible = false; 
                        activeEff.targetCard = activeEff.targetCard.filter(i => i !== card);
                        selectedCardImgArray = selectedCardImgArray.filter(i => i !== selectedCardImg);
                    };
                    SelectOkButton.mouseEnabled = countCheck(activeEff.targetCard.length);
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

        view:(cardArray :Card[], message? :string) => {
            const disprayCards = [...cardArray].reverse();
            divSelectMenuContainer.style.visibility = "visible";
            SelectCancelButton.visible = false;
            SelectOkButton.x = selectButtonCanv.width/2 - 75;
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

    const openYesNoWindow = (message :string) => {
        divSelectMenuContainer.style.visibility = "visible";
        SelectCancelButton.visible = false;
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
};

