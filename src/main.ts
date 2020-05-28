// EaselJS系の読み込み
import { Text, Shape, Stage, Bitmap, Container, Tween, Timeline} from 'createjs-module';
import { createButton }  from './createButton';
import Alpha from './Alpha.json';
import Beta from './Beta.json';
import Gamma from './Gamma.json';
import Airman from './Airman.json';
import Disk from './Disk.json';
import Dogma from './Dogma.json';
import Kuraz from './Kuraz.json';
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
    grid : Grid;
    displayOrder : any;
    selectedCards : Card[];
    chain : effect[];
    nowTime : Time;
    timeArray : Time[];
    constructor(){
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
        this.chain = [];
        this.nowTime = new Time;
        this.timeArray = [];


        const front_position: number[][] = (() => {
            const array: number[][] = [];
            for(let i = 0; i < 8 ; i++){
                if(i<7){
                  array.push([cardImgSize.x/2+20+(cardImgSize.y+cardImgSize.margin)*i,cardImgSize.y/2+20]);  
                }else if(i==7){
                    array.push([cardImgSize.x/2-20+(cardImgSize.y+cardImgSize.margin)*i,cardImgSize.y/2+20]);
                };
            };
            return array
        })();

        const back_position = (() => {
            const array: number[][] = [];
            for(let i = 8; i < 15 ; i++){
                array.push([cardImgSize.x/2+20+(cardImgSize.y+cardImgSize.margin)*(i-8),cardImgSize.y*1.5+40]);
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
                hand:[this.grid.front[3][0],this.grid.front[3][1]*5]
                    };
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
        from? : "BOARD"|"DECK"|"HAND"|"GY"|"DD";
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
        this.effectActived= [];
    };
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

class effect {
    card : Card;
    effType : "CardActived"|"Ignition"|"Trigger"|"Continuous"|"Quick"|"Rule";
    spellSpeed : 1|2|3;
    range : ("MO"|"ST"|"FIELD"|"DECK"|"HAND"|"GY"|"DD")[];
    whetherToActivate : "Any"|"Forced";
    costCard : Card[];
    targetCard : Card[];
    chainBrock : Text;
    actionPossible :(time:Time) => boolean;
    whenActive : (eff?: effect) => Promise<any>;
    whenResolve : (eff?: effect) => Promise<any>;
    apply : () => Promise<any>;
    constructor(card:Card){
        this.card = card;
        this.targetCard = [];
        this.costCard = [];
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

function timeout(ms: number): Promise<void> {
    return new Promise<void>(resolve => setTimeout(resolve, ms));
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
                    await result.whenActive(result);
                    await animationChainEffectActivate(result);
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
                    await result.whenActive(result);
                    await animationChainEffectActivate(result);
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
                        await result.whenActive(result);
                        await animationChainEffectActivate(result);
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
                    if(await(OpenYesNoWindow(activeEffOrg.card.cardName + "の効果を発動しますか？"))){
                        const result :effect = {...activeEffOrg,targetCard:[],costCard:[]};
                        game.nowTime = new Time;
                        game.nowTime.effectActived.push({
                            card:result.card,
                            eff:result
                        });
                        await result.whenActive(result);
                        await animationChainEffectActivate(result);
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
        let CardArray = [...myDeck]
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
                    button.y = cardImgSize.x/2-40*(array.length) + 40*(index+1);
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
                    // 起動効果発動
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
                if(canActiveEffects(card).length >0){
                    disprayButtonArray.push(card.button.ACTIVATE.buttonContainer);
                };
                if(card instanceof MonsterCard && card.RuleSScondition()){
                    disprayButtonArray.push(card.button.SS.buttonContainer);
                };
                if(card instanceof MonsterCard && JudgeNS(card)){
                    disprayButtonArray.push(card.button.NS.buttonContainer);
                    disprayButtonArray.push(card.button.SET.buttonContainer);
                }else if(card instanceof SpellCard){
                    disprayButtonArray.push(card.button.SET.buttonContainer);
                };

                disprayButtonArray.forEach((button, index, array) => {
                    button.x = -cardImgSize.x/2;
                    button.y = cardImgSize.x/2-40*(array.length) + 40*(index+1);
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
                    // 起動効果発動
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
                    normalSummon(card,"ATK");
                };
            };

            card.button.SET.buttonContainer.addEventListener("click",handleSETbuttonClick);
            async function handleSETbuttonClick(event) {
                if(card instanceof MonsterCard){
                    await normalSummon(card,"SET");
                };
                if(card instanceof SpellCard){
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
                    button.y = cardImgSize.x/2-40*(array.length) + 40*(index+1)-10;
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
                    button.y = cardImgSize.x/2-40*(array.length) + 40*(index+1)-10;
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
                    };
                    if(card instanceof SpellCard){
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
                await Promise.all([Animation.fromGY(card), Animation.toBOARD(card, position)]);
            },
            toDD:async(card: Card) => {
                await LocationSetting(card,"DD");
                await Promise.all([Animation.toDD(card),Animation.fromGY(card)]);
            },
        },
        DD:{
            toHAND:async(card: Card)=>{
                await LocationSetting(card,"HAND")
                await animationHandAdjust();
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
     * 墓地効果発動
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
        fromHAND:async(card: SpellCard) => {
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
        if(card.level<=4){
            return(game.normalSummon && card.canNS);
        }else if(5<=card.level && card.level<=6){
            return(game.normalSummon && card.canNS && 1<=countMonster);
        }else{
            return(game.normalSummon && card.canNS && 2<=countMonster);
        };
    };

    /**
     * 魔法罠のカード発動場所判定
     */
    const JudgeSpellTrapActivateLoc = (card : SpellCard) => {
        return card.location=="HAND"||(card.location=="ST"&&card.face=="DOWN")
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
    const vanish = async(cardArray : Card[],by:"EFFECT"|"COST") => {
        await (async () => {
            for(let card of cardArray){
                await moveCard.GY.toDD(card);
                game.nowTime.vanish.push({
                    card:card,
                    by:by
                });
                console.log("vanish "+card.cardName+" by "+by);
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
                    .to({scaleX:0,scaleY:0},250)
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
                    .to({x:game.displayOrder.deck[0][0]+index*1,y:game.displayOrder.deck[0][1]-index*2},100)
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
        // time処理
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
                    await (async () => {
                        for(let tCard of [card]){
                            await moveCard.BOARD.toGY(tCard);
                            game.nowTime.move.push({
                                card:tCard,
                                from:"BOARD",
                                to:"GY"
                            });
                        };
                    })();
                };
                card.peggingTarget = [];
                resolve();
            });
        };
        return EDeff;
    };
    
    const effectSetting = {
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
                    await (async () => {
                        for(let tCard of target){
                            await moveCard.BOARD.toGY(tCard);
                            game.nowTime.move.push({
                                card:tCard,
                                from:"BOARD",
                                to:"GY"
                            });
                        };
                    })();
                    await ContinuousEffect(game.nowTime);
                    await draw(target.length);
                    game.timeArray.push({...game.nowTime});
                    resolve();
                });
            };
            return [eff1];
        },
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

    setBoard(mainstage);

    const ALPHA = genMonsterCard(Alpha);
    const BETA = genMonsterCard(Beta);
    const GAMMA = genMonsterCard(Gamma);
    const AIRMAN = genMonsterCard(Airman);
    const DISK = genMonsterCard(Disk);
    const DOGMA = genMonsterCard(Dogma);
    const KURAZ = genMonsterCard(Kuraz);

    DOGMA.RuleSScondition = ()=>{
        const boolarray = [
            genCardArray({location:["MO"],category:["D-HERO"]}).length >= 1,
            genCardArray({location:["MO"]}).length >= 3
        ];
        return boolarray.every(value => value==true)
    };

    AIRMAN.effect = effectSetting.AIRMAN(AIRMAN)
    DISK.effect = effectSetting.DISK(DISK)
    KURAZ.effect = effectSetting.KURAZ(KURAZ)


    const potOfGreed = new SpellCard
    potOfGreed.spellType = "Normal"
    potOfGreed.imageFileName = "PotOfGreed.png"
    potOfGreed.cardName = "PotOfGreed"
    potOfGreed.effect[0] = new effect(potOfGreed);
    potOfGreed.effect[0].effType = "CardActived"
    potOfGreed.effect[0].range = ["HAND","ST"]
    potOfGreed.effect[0].whenActive = (eff :effect) => {
        return new Promise<void>((resolve, reject) => {
            resolve();
        });
    };
    potOfGreed.effect[0].actionPossible = (time:Time) =>{
        const boolarray = [
            JudgeSpellTrapActivateLoc(potOfGreed),
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
    reinforcement.effect[0].range = ["HAND","ST"]
    reinforcement.effect[0].actionPossible = (time:Time) =>{
        const boolarray = [
            JudgeSpellTrapActivateLoc(reinforcement),
            genCardArray({race:["WARRIOR"],location:["DECK"]})
                                .filter(card => card instanceof MonsterCard && card.level <= 4).length > 0
        ];
        return boolarray.every(value => value==true)
    };
    reinforcement.effect[0].whenActive = (eff :effect) => {
        return new Promise((resolve, reject) => {
            const cardlist = genCardArray({race:["WARRIOR"],location:["DECK"]})
                                .filter(card => card instanceof MonsterCard && card.level <= 4);
            openCardListWindow.select(cardlist,1,1,eff);
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
            game.nowTime = new Time;
            if(eff.targetCard.length > 0){
                await search(eff.targetCard);
            };
            game.timeArray.push({...game.nowTime});
            resolve();
        });
    };

    const destinyDraw = new SpellCard
    destinyDraw.spellType = "Normal"
    destinyDraw.cardName = "destinyDraw"
    destinyDraw.imageFileName = "Ddraw.jpg"
    destinyDraw.effect[0] = new effect(destinyDraw);
    destinyDraw.effect[0].effType = "CardActived"
    destinyDraw.effect[0].range = ["HAND","ST"]
    destinyDraw.effect[0].actionPossible = (time:Time) =>{
        const boolarray = [
            JudgeSpellTrapActivateLoc(destinyDraw),
            genCardArray({category:["D-HERO"],location:["HAND"]}).length > 0
        ];
        return boolarray.every(value => value==true)
    };
    destinyDraw.effect[0].whenActive = (eff :effect) => {
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
    destinyDraw.effect[0].whenResolve = (eff :effect) => {
        return new Promise<void>(async(resolve, reject) => {
            game.nowTime = new Time;
            await draw(2);
            game.timeArray.push({...game.nowTime});
            resolve();
        });
    };

    const monsterReborn = new SpellCard
    monsterReborn.spellType = "Normal"
    monsterReborn.cardName = "monsterReborn"
    monsterReborn.imageFileName = "MonsterReborn.jpg"
    monsterReborn.effect[0] = new effect(monsterReborn);
    monsterReborn.effect[0].effType = "CardActived"
    monsterReborn.effect[0].range = ["HAND","ST"]
    monsterReborn.effect[0].actionPossible = (time:Time) =>{
        const boolarray = [
            JudgeSpellTrapActivateLoc(monsterReborn),
            game.GY.filter(card=>card instanceof MonsterCard && card.canNS).length>0
        ];
        return boolarray.every(value => value==true)
    };
    monsterReborn.effect[0].whenActive = (eff :effect) => {
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
    monsterReborn.effect[0].whenResolve = (eff :effect) => {
        return new Promise<void>(async(resolve, reject) => {
            const targetarray = eff.targetCard.filter(card=>card.location=="GY");
            // game.nowTime = new Time;
            await SpecialSummon.fromGY(targetarray.reverse(),true);
            // game.timeArray.push({...game.nowTime});
            resolve();
        });
    };

    const prematureBrial = new SpellCard;
    prematureBrial.cardName = "prematureBrial"
    prematureBrial.spellType = "Equip";
    prematureBrial.imageFileName = "prematureBrial.jpg";
    prematureBrial.effect[0] = new effect(prematureBrial);
    prematureBrial.effect[0].effType = "CardActived"
    prematureBrial.effect[0].range = ["HAND","ST"]
    prematureBrial.effect[0].actionPossible = (time:Time) =>{
        const boolarray = [
            JudgeSpellTrapActivateLoc(prematureBrial),
            game.GY.filter(card=>card instanceof MonsterCard && card.canNS).length>0
            // genCardArray({cardType:["Monster"],location:["GY"]}).length > 0
        ];
        return boolarray.every(value => value==true)
    };
    prematureBrial.effect[0].whenActive = (eff :effect) => {
        return new Promise((resolve, reject) => {
            // const cardlist = genCardArray({cardType:["Monster"],location:["GY"]});
            const cardlist = game.GY.filter(card=>card instanceof MonsterCard && card.canNS)
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
    prematureBrial.effect[0].whenResolve = (eff :effect) => {
        return new Promise<void>(async(resolve, reject) => {
            game.nowTime = new Time;
            if(eff.targetCard[0].location=="GY" && eff.card.location=="ST" && eff.card.face=="UP"){
                await SpecialSummon.fromGY(eff.targetCard,false,"ATK");
                Equip(prematureBrial,eff);
                // prematureBrial.peggingTarget = eff.targetCard;
            };
            game.timeArray.push({...game.nowTime});
            resolve();
        });
    };
    prematureBrial.effect[1] = new effect(prematureBrial);
    prematureBrial.effect[1].effType = "Continuous";
    prematureBrial.effect[1].actionPossible = (time:Time) =>{
        const timeCondition = (()=>{
            const timeBoolArray :boolean[] = [];
            time.destroy.forEach(tDestroy=>{
                timeBoolArray.push(tDestroy.card== prematureBrial);
            });
            return timeBoolArray.some(value => value);
        })();
        const boolarray = [
           prematureBrial.peggingTarget.filter(card=>card.canDestroy).length>0,
           timeCondition
        ];
        return boolarray.every(value => value==true)
    };
    prematureBrial.effect[1].apply = () => {
        return new Promise<void>(async(resolve, reject) => {
            if(prematureBrial.peggingTarget[0].location=="MO"){
                await destroy(prematureBrial.peggingTarget,"EFFECT");
                await (async () => {
                    for(let tCard of prematureBrial.peggingTarget){
                        await moveCard.BOARD.toGY(tCard);
                        game.nowTime.move.push({
                            card:tCard,
                            from:"BOARD",
                            to:"GY"
                        });
                    };
                })();
            };
            prematureBrial.peggingTarget = [];
            resolve();
        });
    };
    prematureBrial.effect.push( equipDestroy(prematureBrial) );
    prematureBrial.effect.push( equipDisEnchant(prematureBrial) );

    const monsterGate = new SpellCard
    monsterGate.cardName="prematureBrial";
    monsterGate.spellType="Normal";
    monsterGate.imageFileName="monsterGate.jpg";
    monsterGate.effect[0] = new effect(monsterGate);
    monsterGate.effect[0].effType = "CardActived";
    monsterGate.effect[0].range = ["HAND","ST"]
    monsterGate.effect[0].actionPossible = (time:Time) =>{
        const boolarray = [
            JudgeSpellTrapActivateLoc(monsterGate),
            game.DECK.filter(card=>card instanceof MonsterCard && card.canNS).length >0,
            genCardArray({location:["MO"]}).length > 0
        ];
        return boolarray.every(value => value==true)
    };
    monsterGate.effect[0].whenActive = (eff :effect) => {
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
    monsterGate.effect[0].whenResolve = (eff :effect) => {
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
                    // if(decktop().face=="DOWN"){
                    //     await cardFlip(decktop());
                    // };
                    // await timeout(250);
                    await SpecialSummon.fromDECK([decktop()],true);
                };
            };
            game.timeArray.push({...game.nowTime});
            resolve();
        });
    };

    const phenixBlade = new SpellCard;
    phenixBlade.cardName = "phenixBlade"
    phenixBlade.spellType = "Equip";
    phenixBlade.imageFileName = "phenixBlade.jpg";
    phenixBlade.effect[0] = new effect(phenixBlade);
    phenixBlade.effect[0].effType = "CardActived"
    phenixBlade.effect[0].range = ["HAND","ST"]
    phenixBlade.effect[0].actionPossible = (time:Time) =>{
        const boolarray = [
            JudgeSpellTrapActivateLoc(phenixBlade),
            genCardArray({face:["UP"],location:["MO"]}).length > 0
        ];
        return boolarray.every(value => value==true)
    };
    phenixBlade.effect[0].whenActive = (eff :effect) => {
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
    phenixBlade.effect[0].whenResolve = (eff :effect) => {
        return new Promise<void>(async(resolve, reject) => {
            game.nowTime = new Time;
            if(eff.targetCard[0].location=="MO" && eff.targetCard[0].face=="UP" && eff.card.location=="ST" && eff.card.face=="UP"){
                await Equip(phenixBlade,eff);
                const equiptarget = phenixBlade.peggingTarget[0];
                if(equiptarget instanceof MonsterCard){
                    equiptarget.buff.push({eff:eff,atkBuff:300,defBuff:0})
                };
            };
            game.timeArray.push({...game.nowTime});
            resolve();
        });
    };

    phenixBlade.effect[1] = new effect(phenixBlade);
    phenixBlade.effect[1].effType = "Ignition";
    phenixBlade.effect[1].range = ["GY"];
    phenixBlade.effect[1].actionPossible = (time:Time) =>{
        const boolarray = [
            phenixBlade.effect[1].range.includes(phenixBlade.location),
            genCardArray({race:["WARRIOR"],location:["GY"]}).length >= 2
        ];
        return boolarray.every(value => value==true)
    };
    phenixBlade.effect[1].whenActive = (eff :effect) => {
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
    phenixBlade.effect[1].whenResolve = (eff :effect) => {
        return new Promise<void>(async(resolve, reject) => {
            if(eff.card.location=="GY"){
                game.nowTime = new Time;
                await (async () => {
                    await moveCard.DD.toHAND(eff.card);
                    game.nowTime.move.push({
                        card:eff.card,
                        from:"DD",
                        to:"HAND"
                    });
                })();
                await ContinuousEffect(game.nowTime);
            };
            game.timeArray.push({...game.nowTime});
            resolve();
        });
    };

    phenixBlade.effect.push( equipDestroy(phenixBlade) );
    phenixBlade.effect.push( equipDisEnchant(phenixBlade) ) ;



    const myDeck : Card[]= [DOGMA,ALPHA,BETA,GAMMA,potOfGreed,
        prematureBrial,destinyDraw,reinforcement,monsterGate,monsterReborn,AIRMAN,KURAZ,DISK,phenixBlade];
    deckset(mainstage, Array.from(myDeck));
    console.log(game.DECK); 

    const drawButton = createButton("draw", 150, 40, "#0275d8");
    drawButton.x = 1200;
    drawButton.y = 450;
    mainstage.addChild(drawButton);

    drawButton.on("click", function(e){
        draw(1);
    }, null, false);

    const shuffleButton = createButton("shuffle", 150, 40, "#0275d8");
    shuffleButton.x = 1200;
    shuffleButton.y = 500;
    mainstage.addChild(shuffleButton);

    shuffleButton.on("click", function(e){
        deckShuffle();
    }, null, false);

    const DeckViewButton = createButton("DECK View", 150, 40, "#0275d8");
    DeckViewButton.x = 1200;
    DeckViewButton.y = 600;
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
    
    const GyViewButton = createButton("GY View", 150, 40, "#0275d8");
    GyViewButton.x = 1200;
    GyViewButton.y = 550;
    mainstage.addChild(GyViewButton);

    GyViewButton.on("click", function(e){
        openCardListWindow.view(game.GY,"GY");
        console.log(game.GY)
        const clickOkButton = async (e) => {
            divSelectMenuContainer.style.visibility = "hidden";
            disprayStage.removeAllChildren();
            SelectOkButton.removeEventListener("click", clickOkButton);
        };
        SelectOkButton.addEventListener("click",clickOkButton);
    }, null, false);

    const testButton = createButton("test", 150, 40, "#0275d8");
    testButton.x = 1200;
    testButton.y = 650;
    mainstage.addChild(testButton);

    testButton.on("click", function async(e){
         discard(game.HAND);
    }, null, false);

    createjs.Ticker.addEventListener("tick", handleTick);
    function handleTick() {
        mainstage.update();
        windowBackStage.update();
        disprayStage.update();
        selectButtonStage.update();

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
        select: (disprayCards :Card[], moreThan :Number, lessThan :Number, activeEff :effect,message? :string,cansel? :boolean) => {
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

        view:(disprayCards :Card[], message? :string) => {
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

    const OpenYesNoWindow = (message :string) => {
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
};

