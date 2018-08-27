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
* Matches on:
*  (Done via convertEscapeCharacters)
*  /target[target] (target an event or player)
* Returns: void
*
* Function: Window_Message.prototype.centerPlacement(text)
* Desc: Centers the window_message to the center x/y positions
* Matches on:
* /center
* Returns: void 
* 
* Function: Window_Message.prototype.buildText()
* Desc: Calls $gameMessage.allText(), converts escape characters, and rebuilds
* the text to be formatted to wrap based on the lineWidth. 
* Returns: Text string with properly place /n
* 
* Function: Window_Message.prototype.createCharName(name)
* Desc: Used to instantiate the new Window_CharName
* Returns: void
*
* Function: Window_Message.prototype.createTail()
* Desc: Draws the message tail for targetted messages 
* Returns: void
*
* Window_CharName(name)
* Desc: For instatiating a new Window_CharName object (added as a
* child of a parent window)
* 
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
    this._center = false;
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
    text = text.replace(/\x1bCENTER/gi, function(){
        $gameMessage._center = true;
        return '';
    });
    return text;
};

Window_Base.prototype.loadWindowskin = function() {
    this.windowskin = ImageManager.loadSystem('Window_Message');
    this.windowskin = ImageManager.loadSystem('Window');
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
    this.drawText(name, 3, 0, 200, 'left')
    this.windowskin = ImageManager.loadSystem('Window_Message'); 
};

Window_CharName.prototype.resetFontSettings = function() {
    this.contents.fontFace = 'NameFont';
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
    this._textState.text = this.buildText();

    if($gameMessage._speaker === true){
        this.createCharName($gameMessage._speakerName);
    }

    if($gameMessage._target === true){
        this.windowskin = ImageManager.loadSystem('Window_Message');   
        this._refreshAllParts();
        this.newPage(this._textState);
        this.width = ($gameMessage._msgLength + this.standardPadding() * 2)
        this.height = this.fittingHeight($gameMessage._msgRows);
        this.customPlacement($gameMessage._targetid);
    }else if($gameMessage._center === true){
        this.windowskin = ImageManager.loadSystem('Window'); 
        this._refreshAllParts();
        this.newPage(this._textState);
        this.width = ($gameMessage._msgLength + this.standardPadding() * 2)
        this.height = this.fittingHeight($gameMessage._msgRows);
        this.centerPlacement(this._textState.text);
        
    }else{
        this.windowskin = ImageManager.loadSystem('Window');
        this._refreshAllParts();
        this.width = Graphics.boxWidth;
        this.height = 4 * 40 + this.standardPadding() * 2;
        this.newPage(this._textState);
        this.updatePlacement();
    }

    this.updateBackground();
    this.open();
};


Window_Message.prototype.buildText = function() {
    var maxWidth = 0;
    var text = this.convertEscapeCharacters($gameMessage.allText());
    text = text.replace(/(\r\n|\n|\r)/gm, '');
    text = text.split(' ');
    if($gameMessage._center == true || $gameMessage._target == true){
        maxWidth = 500;
    }else{
        maxWidth = Graphics.boxWidth - this.standardPadding() * 2;
        console.log(maxWidth);
    }
    var longestLineLength = 0;
    var currentLineText = [];
    var currentLineLength = 0;
    var builtMsg = [];
    for (j = 0; j < text.length; j++){
        wordLength = this.textWidthEx(text[j]);
        if((currentLineLength + wordLength) > maxWidth){
            longestLineLength = Math.max(longestLineLength, currentLineLength);
            currentLineLength = 0;
            currentLineText.push(' \n');
            currentLineText = currentLineText.join(' ');
            builtMsg.push(currentLineText);
            currentLineText = [];
            currentLineText.push(text[j]);
            currentLineLength += wordLength;      
        } else{
            currentLineText.push(text[j]);
            currentLineLength += wordLength;
            currentLineLength += 6.75;
            if(j == text.length - 1){
                longestLineLength = Math.max(longestLineLength, currentLineLength);
                currentLineText = currentLineText.join(' ');
                builtMsg.push(currentLineText);
            } 
        }
    }
    $gameMessage._msgLength = longestLineLength;
    $gameMessage._msgRows = builtMsg.length;
    return builtMsg.join('');
}

Window_Message.prototype.textWidthEx = function(text) {
    return this.drawTextEx(text, 0, this.contents.height);
};

Window_Message.prototype.createCharName = function(name) {
    this._charName = new Window_CharName(name);
    this.addChild(this._charName);
}

Window_Message.prototype.customPlacement = function(targetid) {
    
    
    if (targetid > 0) { 
        var ev = $gameMap.event(targetid);
        this.x = ev.screenX() - (this.width / 2) + ChoiceEngine.Message.Target_X_Offset;
        this.y = ev.screenY() - this.height - ChoiceEngine.Message.Target_Y_Offset;
    } else if (targetid == 0){
        this.x = $gamePlayer.screenX() - (this.width / 2) + ChoiceEngine.Message.Target_X_Offset;
        this.y = $gamePlayer.screenY() - this.height - ChoiceEngine.Message.Target_Y_Offset;
    }
    this.messageTail();
    this._goldWindow.y = this.y > 0 ? 0 : Graphics.boxHeight - this._goldWindow.height;
};

Window_Message.prototype.centerPlacement = function(text) {
    this.height = 40 + this.standardPadding() * 2;
    this.width = this.contents.measureTextWidth(text) + (this.standardPadding() * 3);
    this.x = (Graphics.boxWidth / 2) - (this.width / 2);
    this.y = (Graphics.boxHeight / 2) - (this.height / 2);
};

ChoiceEngine.Message._updatePlacement = Window_Message.prototype.updatePlacement
Window_Message.prototype.updatePlacement = function() {
    ChoiceEngine.Message._updatePlacement.call(this);
    this.x = 0;
};

Window_Message.prototype.resetFontSettings = function() {
    
    if($gameMessage._target == true){
        this.contents.fontFace = 'MessageFont';
    } else {
        this.contents.fontFace = 'GameFont';
    }
    
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

Window_Message.prototype._refreshPauseSign = function() {
    var sx = 144;
    var sy = 96;
    var p = 24;
    this._windowPauseSignSprite.bitmap = this._windowskin;
    this._windowPauseSignSprite.anchor.x = 0.5;
    this._windowPauseSignSprite.anchor.y = 1;
    if($gameMessage._target == true || $gameMessage._center == true){
        this._windowPauseSignSprite.move(this._width * .9, this._height * .9);
    }else{
        this._windowPauseSignSprite.move(this._width / 2, this._height);
    }
    this._windowPauseSignSprite.setFrame(sx, sy, p, p);
    this._windowPauseSignSprite.alpha = 0;
};




})();