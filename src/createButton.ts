export function createButton(text, width, height, keyColor) {
  // ボタン要素をグループ化
  var button = new createjs.Container();
  button.name = text; // ボタンに参考までに名称を入れておく(必須ではない)
  button.cursor = "pointer"; // ホバー時にカーソルを変更する

  // 通常時の座布団を作成
  var bgUp = new createjs.Shape();
  bgUp.graphics
          .setStrokeStyle(1.0)
          .beginStroke(keyColor)
          .beginFill("white")
          .drawRoundRect(0.5, 0.5, width - 1.0, height - 1.0, 20);
  button.addChild(bgUp);
  bgUp.visible = true; // 表示する

  // ロールオーバー時の座布団を作成
  var bgOver = new createjs.Shape();
  bgOver.graphics
          .beginFill(keyColor)
          .drawRoundRect(0, 0, width, height, 20);
  
  bgOver.visible = false; // 非表示にする
  button.addChild(bgOver);

  // ラベルを作成
  var label = new createjs.Text(text, "18px sans-serif", keyColor);
  label.x = width / 2;
  label.y = height / 2;
  label.textAlign = "center";
  label.textBaseline = "middle";
  button.addChild(label);
  
  // ロールオーバーイベントを登録
  button.addEventListener("mouseover", handleMouseOver);
  button.addEventListener("mouseout", handleMouseOut);
  function handleMouseOver(event) {
    bgUp.visible = false;
    bgOver.visible = true;
    label.color = "white";
  }
  function handleMouseOut(event) {
    bgUp.visible = true;
    bgOver.visible = false;
    label.color = keyColor;
  }
  return button;
}
