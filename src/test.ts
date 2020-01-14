// Card　共通プロパティを持つ親クラス
class Card {
    imageFileName : String;  cardBackImageFileName : String;
    ID : Number;
    cardName : String;
    location : String;
    fromLocation : String;
    cardType : "Monster"|"Spell"|"Trap";
    face : "UP"|"DOWN" ;
    constructor(){
        this.cardBackImageFileName = "cardback.jpeg";
        this.location = "DECK"
    }
}

// MonsterCard　Cardクラスを継承
class MonsterCard extends Card {
    monsterType : "Normal"|"Effect";
    level : Number;
    race : String;
    attribute : String;
    atkPoint : Number;
    defPoint : Number;
    position : "ATK"|"DEF";
    NSed : Boolean;
    constructor(){
        super();
        this.cardType = "Monster"
    }
}

// SpellCard　Cardクラスを継承
class SpellCard extends Card {
    spellType : "Normal"|"Quick"|"Equip"|"Field"|"Continuous";
    effect : Function
    Actived : Boolean;
    constructor(){
        super();
        this.cardType = "Spell"  
    }
}

// 通常召喚関数
function nomalSummon(card:MonsterCard) {
    console.log("通常召喚");
    card.NSed = true;
}
// 魔法発動関数
function spellActivate(card:SpellCard) {
    console.log("魔法発動");
    card.Actived = true;
}

// MonsterとSpellが混在するCardArrayについて、クラスに応じた処理を行いたいが
// nomalSummon(card:MonsterCard) spellActivate(card:SpellCard) の引数にCardを割り当てることができない
const cardlist :Card[] = [];
cardlist.map((card, index, array) => {
    if(card.cardType=="Monster"){
        nomalSummon(card);
    }else{
        if(card.cardType=="Spell"){
            spellActivate(card);
        }
    }
})