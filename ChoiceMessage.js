//=============================================================================
// Choice Engine Message Plugin Version 1.0
// ChoiceMessage.js
// For: RPG Maker MV v 1.6.1
//============================================================================= 

var Imported = Imported || [];
Imported.ChoiceMessage = true;

var ChoiceEngine = ChoiceEngine || {};
ChoiceEngine.Message = ChoiceEngine.Message || {};

//-----------------------------------------------------------------------------
//  Parameters
//-----------------------------------------------------------------------------
 /*:
 * @plugindesc Choice Engine message plugin.
 * @author Choice
 * 
 * @param Speech Pointer
 * @desc Graphic that connects to the speech bubble. 
 * @default Pointer1
 *
 * @param Message Text Size
 * @type number;
 * @desc Font size for names. 
 * @default 24
 * 
 * @param Text Color Code
 * @type number;
 * @desc Color code for message text. 
 * @default 15
 * 
 * @param Text Outline Color Code
 * @type number;
 * @desc Color code for message text outline. 
 * @default 15
 * 
 * @param Text Outline Width
 * @type number;
 * @desc Width of the message outline color
 * @default 0
 * 
 * @param Name Text Size
 * @type number;
 * @desc Font size for names. 
 * @default 32
 * 
 * @param Name Color Code
 * @type number;
 * @desc Color code for character names. 
 * @default 15
 * 
 * @param Name Outline Color Code
 * @type number;
 * @desc Color code for character name outline. 
 * @default 27
 * 
 * @param Name Outline Width
 * @type number;
 * @desc Width of the name outline color
 * @default 7
 * 
 * @param Target Offset X
 * @desc X Offset for Targeted Messages
 * @default 0
 * 
 * @param Target Offset Y
 * @desc Y Offset for Targeted Messages
 * @default 150
 *
 * @help
 * //-----------------------------------------------------------------------------
 * //  Description
 * //-----------------------------------------------------------------------------
 *  Choice Engine Message System. Built around "Bubble Dialouge" style messages.
 * 
 * //-----------------------------------------------------------------------------
 * //  New Function Descriptions
 * //-----------------------------------------------------------------------------
 *
 * Function: Window_Message.prototype.customPlacement(targetid)
 * Desc: Takes a targetid, determines its position, and moves the Game_message
 * window adjusted for offsets.
 * flags / values
 * Matches on:
 *  (Done via convertEscapeCharacters)
 *  /target[target] (target an event or player)
 *  /fitmessage (Fits message to fit text)
 * Returns: void
 * 
 * Window_CharName(name)
 * Desc: Instanties a new Window_CharName object (added as a child 
 * of a parent window)
 * 
 * Function: Window_Message.prototype.createWindowTail()
 * Desc: Instantiates a new Window_Tail on the Window_Message object that called it. 
 * Returns: void
 * 
 * Window_Tail()
 * Desc: Instantiates a new Window_Tail object (added as a child of a parent window)
 * Returns: Void
 */

ChoiceEngine.Message.Params = PluginManager.parameters('ChoiceMessage');
ChoiceEngine.Message.Target_Y_Offset = Number(ChoiceEngine.Message.Params['Target Offset Y']);
ChoiceEngine.Message.Target_X_Offset = Number(ChoiceEngine.Message.Params['Target Offset X']);
ChoiceEngine.Message.Name_Size = Number(ChoiceEngine.Message.Params['Name Text Size']);
ChoiceEngine.Message.Name_Color = Number(ChoiceEngine.Message.Params['Name Color Code']);
ChoiceEngine.Message.Name_Outline = Number(ChoiceEngine.Message.Params['Name Outline Color Code']);
ChoiceEngine.Message.Name_Outline_Width = Number(ChoiceEngine.Message.Params['Name Outline Width']);
ChoiceEngine.Message.Text_Size = Number(ChoiceEngine.Message.Params['Message Text Size']);
ChoiceEngine.Message.Text_Color = Number(ChoiceEngine.Message.Params['Text Color Code']);
ChoiceEngine.Message.Text_Outline = Number(ChoiceEngine.Message.Params['Text Outline Color Code']);
ChoiceEngine.Message.Text_Outline_Width = Number(ChoiceEngine.Message.Params['Text Outline Width']);

(function() {

//-----------------------------------------------------------------------------
//  Game_Message
//-----------------------------------------------------------------------------

ChoiceEngine.Message.Game_Message_Clear = Game_Message.prototype.clear;
Game_Message.prototype.clear = function() {
    ChoiceEngine.Message.Game_Message_Clear.call(this);
    this._speaker = false;
    this._speakerName = undefined;
    this._target = false;
    this._targetid = undefined;
    this._fitted = false;
};

//-----------------------------------------------------------------------------
//  Graphics
//-----------------------------------------------------------------------------

Graphics._createGameFontLoader = function() {
    this._createFontLoader('GameFont');
    this._createFontLoader('MessageFont');
    this._createFontLoader('NameFont');
};

//-----------------------------------------------------------------------------
//  Scene_Boot
//-----------------------------------------------------------------------------

Scene_Boot.prototype.isGameFontLoaded = function() {
    if (Graphics.isFontLoaded('GameFont') 
    && Graphics.isFontLoaded('MessageFont') 
    && Graphics.isFontLoaded('NameFont')) {
        return true;
    } else if (!Graphics.canUseCssFontLoading()){
        var elapsed = Date.now() - this._startDate;
        if (elapsed >= 60000) {
            throw new Error('Failed to load GameFont');
        }
    }
};

//-----------------------------------------------------------------------------
//  Window_Base
//-----------------------------------------------------------------------------

ChoiceEngine.Message.Base_convertEscapeCharacters = Window_Base.prototype.convertEscapeCharacters;
Window_Base.prototype.convertEscapeCharacters = function(text) {
    var text = ChoiceEngine.Message.Base_convertEscapeCharacters.call(this,text);
    text = text.replace(/\x1bTARGET\[(\d+)\]/gi, function(){
        $gameMessage._target = true;
        $gameMessage._targetid = arguments[1];
        return '';
    }.bind(this));
    text = text.replace(/\x1bCHARNAME\[(.*?)\]/gi, function(){
        $gameMessage._speaker = true;
        $gameMessage._speakerName = arguments[1];
        return '';
    });
    text = text.replace(/\x1bFITMSG/gi, function(){
        $gameMessage._fitted = true;
        return '';
    });
    return text;
};


//-----------------------------------------------------------------------------
//  Window_CharName
//-----------------------------------------------------------------------------

Window_CharName = function() {
    this.initialize.apply(this, arguments);
}

Window_CharName.prototype = Object.create(Window_Base.prototype);
Window_CharName.prototype.constructor = Window_CharName;

Window_CharName.prototype.initialize = function(name) {
    this._windowskin = null;

    Window_Base.prototype.initialize.call(this, -8, -33, 200, 100);
    this.setBackgroundType(2);
    this.drawText(name, 0, 0, 200, 'left')

};

Window_CharName.prototype.resetFontSettings = function() {
    this.contents.fontFace = 'MessageFont';
    this.contents.fontSize = ChoiceEngine.Message.Name_Size;
    this.changeTextColor(this.textColor(ChoiceEngine.Message.Name_Color));
    this.contents.outlineColor = this.textColor(ChoiceEngine.Message.Name_Outline);
    this.contents.outlineWidth = ChoiceEngine.Message.Name_Outline_Width;
};

//-----------------------------------------------------------------------------
//  Window_Message
//-----------------------------------------------------------------------------

Window_Message.prototype.startMessage = function() {
    
    this._textState = {};
    this._textState.index = 0;
    
    this._textState.text = this.buildText($gameMessage._texts);

    if($gameMessage._speaker === true){
        this.createCharName($gameMessage._speakerName);
    }else{
        
    }

    if($gameMessage._target === true){
        this.newPage(this._textState);
        this.customPlacement($gameMessage._targetid);
        this.updateBackground();
        this.open();
    }else{
        this.width = Graphics.boxWidth;
        this.newPage(this._textState);
        this.updatePlacement();
        this.updateBackground();
        this.open();
    }
};

Window_Message.prototype.buildText = function(arr) {
    var lineCount = 0;
    var charCount = 0;
    var gameMessageArr = [];
    var tempArr = [];
    var minWidth = 20;
    var maxWidth = 30;
    for(i = 0; i < arr.length; i++){
        var text = this.convertEscapeCharacters(arr[i]);
        if(!text.replace(/\s/g, '').length){
            console.log('spliced: ' + arr[i]);
        } else{
            lineCount++;
            charCount += text.length;
            tempArr.push(text);
        }
    }

    var lineWidth = Math.max(Math.ceil(charCount / lineCount), minWidth); 
    if(lineWidth > maxWidth){
        lineWidth = maxWidth;
    }

    tempArr = tempArr.join(' ');
    tempArr = tempArr.split(' ');
    var currentLineText = [];
    var currentLineLength = 0;
    
    for (j = 0; j < tempArr.length; j++){
        if(((currentLineLength + tempArr[j].length) >= lineWidth) 
        && gameMessageArr.length < 4){
            currentLineLength = 0;

            currentLineText.push('\n');
            currentLineText = currentLineText.join(' ');
            console.log(currentLineText);
            gameMessageArr.push(currentLineText);

            currentLineText = [];
            currentLineText.push(tempArr[j]);
            currentLineLength += tempArr[j].length;
            if(j == tempArr.length - 1){
                currentLineText = currentLineText.join(' ');
                gameMessageArr.push(currentLineText);
            } 
        } else{
            currentLineText.push(tempArr[j]);
            currentLineLength += tempArr[j].length;
            currentLineLength += 1;
        }
    }

    this.height = gameMessageArr.length * 40 + this.standardPadding() * 2;;
    this.width = this.contents.measureTextWidth(gameMessageArr[0]) + (this.standardPadding() * 3);
    return gameMessageArr.join('');
}

Window_Message.prototype.createCharName = function(name) {
    this._charName = new Window_CharName(name);
    this.addChild(this._charName);
}

Window_Message.prototype.customPlacement = function(targetid) {
    
    this._positionType = $gameMessage.positionType();
    if (targetid > 0) {
        this.found = true; 
        var ev = $gameMap.event(targetid);
        this.x = ev.screenX() - (this.width / 2) + ChoiceEngine.Message.Target_X_Offset;
        this.y = ev.screenY() - this.height - ChoiceEngine.Message.Target_Y_Offset;
    } else if (targetid == 0){
        this.found = true; 
        this.x = $gamePlayer.screenX() - (this.width / 2) + ChoiceEngine.Message.Target_X_Offset;
        this.y = $gamePlayer.screenY() - this.height - ChoiceEngine.Message.Target_Y_Offset;
    }
    this.messageTail();
    this._goldWindow.y = this.y > 0 ? 0 : Graphics.boxHeight - this._goldWindow.height;
};

ChoiceEngine.Message._updatePlacement = Window_Message.prototype.updatePlacement
Window_Message.prototype.updatePlacement = function() {
    ChoiceEngine.Message._updatePlacement.call(this);
    this.x = 0;
};

Window_Message.prototype.resetFontSettings = function() {
    this.contents.fontFace = 'MessageFont';
    this.contents.fontSize = ChoiceEngine.Message.Text_Size;
    this.changeTextColor(this.textColor(ChoiceEngine.Message.Text_Color));
    this.contents.outlineColor = this.textColor(ChoiceEngine.Message.Text_Outline);
    this.contents.outlineWidth = ChoiceEngine.Message.Text_Outline_Width;
};


ChoiceEngine.Message._terminateMessage = Window_Message.prototype.terminateMessage;
Window_Message.prototype.terminateMessage = function() {
    ChoiceEngine.Message._terminateMessage.call(this);
    if(this._tail){
        this.removeChild(this._tail)
    }
    if(this._charName){
        this.removeChild(this._charName)
    }
};

Window_Message.prototype.messageTail = function() {
	this._tail = new Sprite();
	this._tail.bitmap = ImageManager.loadSystem('WindowArrow');
	this._tail.opacity = 255;
	this._tail.x = (this.width /2) - 25;
	this._tail.y = this.height - 5;
    this.addChild(this._tail);
};

Window_Message.prototype.newLineX = function() {
    return $gameMessage.faceName() === '' ? 6 : 168;
};



})();