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
 * @param Message Padding
 * @desc Padding added around all message edges.
 * @ type number 
 * @default 20
 * 
 * @param Message Text Size
 * @type number
 * @desc Font size for names. 
 * @default 24
 * 
 * @param Text Color Code
 * @type number
 * @desc Color code for message text. 
 * @default 15
 * 
 * @param Text Outline Color Code
 * @type number
 * @desc Color code for message text outline. 
 * @default 15
 * 
 * @param Text Outline Width
 * @type number
 * @desc Width of the message outline color
 * @default 0
 * 
 * @param Name Text Size
 * @type number
 * @desc Font size for names. 
 * @default 32
 * 
 * @param Name Color Code
 * @type number
 * @desc Color code for character names. 
 * @default 15
 * 
 * @param Name Outline Color Code
 * @type number
 * @desc Color code for character name outline. 
 * @default 27
 * 
 * @param Name Outline Width
 * @type number
 * @desc Width of the name outline color
 * @default 7
 * 
 * @param Target Offset X
 * @desc X Offset for Targeted Messages
 * @default 150
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
* Function: Window_Message.prototype.buildText()
* Desc: Calls $gameMessage.allText(), converts escape characters, and rebuilds
* the text to be formatted to wrap based on the lineWidth. 
* Returns: Text string with properly place /n
* 
* Function: Window_Message.prototype.customPlacement(targetid)
* Desc: Updates the x/y positions of the Message_window relative to a 
* targetid. Checks for the message tail dirction and creates it 
* Returns: void
*
* Function: Window_Message.prototype.windowDimensions(type)
* Desc: Size the Message_Window based on a type
* Returns: void
*
* Function: Window_Message.prototype.createCharName(name)
* Desc: Used to instantiate the new Window_CharName
* Returns: void
*
* Function: Window_Message.prototype.messageTail()
* Desc: Draws the message tail for targetted messages 
* Returns: void
*
* Window_CharName(name)
* Desc: For instatiating a new Window_CharName object (added as a
* child of a parent window)
* 
*/



(function() {

//-----------------------------------------------------------------------------
//  Parameters
//-----------------------------------------------------------------------------

    ChoiceEngine.Message.Params = PluginManager.parameters('ChoiceMessage');
    ChoiceEngine.Message.Message_Padding = Number(ChoiceEngine.Message.Params['Message Padding']);
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
//Kinda Spaghetti, but it works so I'm leaving it
    this._textState = {};
    this._textState.index = 0;
    this._textState.text = this.buildText();

    if($gameMessage._target === true){
        this.windowskin = ImageManager.loadSystem('Window_Message');   
        this._refreshAllParts();
        this.newPage(this._textState);
        this.windowDimensions('target');
        this.customPlacement($gameMessage._targetid);
    }else if($gameMessage._center === true){
        this.windowskin = ImageManager.loadSystem('Window_Message'); 
        this._refreshAllParts();
        this.newPage(this._textState);
        this.windowDimensions('center');
    }else{
        this.windowskin = ImageManager.loadSystem('Window');
        this._refreshAllParts();
        this.newPage(this._textState);
        this.windowDimensions('default');
        this.updatePlacement();
    }

    if($gameMessage._speaker === true){
        this.createCharName($gameMessage._speakerName);
    }

    this.updateBackground();
    this.open();
};

Window_Message.prototype.standardPadding = function() {
    return ChoiceEngine.Message.Message_Padding;
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
    }
    var longestLineLength = 0;
    var currentLineText = [];
    var currentLineLength = 0;
    var builtMsg = [];
    for (j = 0; j < text.length; j++){
        var wordLength = this.textWidthCheck(text[j]);
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
    return builtMsg.join('');
}

Window_Message.prototype.textWidthCheck = function(text) {
    if (text) {
        var textState = { index: 0, x: 0, y: this.contents.height, left: 0 };
        textState.text = this.convertEscapeCharacters(text);
        textState.height = this.calcTextHeight(textState, false);
        while (textState.index < textState.text.length) {
            this.processCharacter(textState);
        }
        return textState.x;
    } else {
        return 0;
    }
};

Window_Message.prototype.createCharName = function(name) {
    this._charName = new Window_CharName(name);
    this.addChildAt(this._charName, 2);
}

//Need to fix delay here where \| or \. delays the actual message starting
Window_Message.prototype.customPlacement = function(targetid) {

    var tailDirection = 'up'; 
    var targetTemp = ''; 

    if (targetid > 0) {
        targetTemp = $gameMap.event(targetid); 
    } else {
        targetTemp = $gamePlayer;
    }
    
    this.x = targetTemp.screenX()- (this.width / 2);
    this.y = targetTemp.screenY() - this.height - ChoiceEngine.Message.Target_Y_Offset;

    if (this.x + this.width > Graphics.boxWidth) {
        this.x = targetTemp.screenX() - (this.width + ChoiceEngine.Message.Target_X_Offset);
        this.y = Math.max (targetTemp.screenY() - (this.height / 2) - 60, 5);
        //Hardcoded Sprite Sizes (currently at 60) needs to be fixed
        if (this.y == 5){
            //hardcoded that 5 for padding. Should fix that to be a variable
            tailDirection = 'leftReach'
        } else{
            tailDirection = 'left';
        }
    } else if (this.x < 0){
        this.x = targetTemp.screenX() + ChoiceEngine.Message.Target_X_Offset;
        this.y = Math.max (targetTemp.screenY() - (this.height / 2) - 60, 5);
        //Hardcoded Sprite Sizes (currently at 60) needs to be fixed
        if (this.y == 5){
            //hardcoded that 5 for padding. Should fix that to be a variable
            tailDirection = 'rightReach'
        } else{
            tailDirection = 'right';
        }
    }

    if (tailDirection === 'up' && this.y < 0){
            this.y = targetTemp.screenY();
            tailDirection = 'down';
            
        } 

    this.messageTail(tailDirection);
};

Window_Message.prototype.windowDimensions = function(type) {
    switch(type){
        case 'target':
            this.width = ($gameMessage._msgLength + this.standardPadding() * 2);
            this.height = this.calcTextHeight(this._textState, true) + this.standardPadding() * 2 + 10;
            break;
        case 'center':
            this._background = $gameMessage.background();
            if (this._background == 1){
                this.contents.x = (Graphics.boxWidth / 2) - (this.width / 2);
            } else {
                this.width = ($gameMessage._msgLength + this.standardPadding() * 2);
                this.x = (Graphics.boxWidth / 2) - (this.width / 2);    
            }
            this.height = this.calcTextHeight(this._textState, true) + this.standardPadding() * 2 + 10;
            this.y = (Graphics.boxHeight / 2) - (this.height / 2) - 48;
            break;
        default:
            this.width = Graphics.boxWidth;
            this.height = 4 * 40 + this.standardPadding() * 2;
            this.x = 0;
            break;
    }

};

Window_Message.prototype.messageTail = function(tailDirection) {
    if(this._tail){
        this.removeChild(this._tail)
    }
	this._tail = new Sprite();
	this._tail.bitmap = ImageManager.loadSystem('WindowArrow');
    this._tail.opacity = 255;

    switch (tailDirection) {
        case 'down':
            this._tail.rotation = 180 * Math.PI / 180;
            this._tail.y = 3;
            this._tail.x = (this.width / 2) + 25;
            break;

        case 'right':
            this._tail.rotation = 90 * Math.PI / 180;
            this._tail.x = 5;
            this._tail.y = (this.height / 2) - 25;
            break;

        case 'rightReach':
            this._tail.rotation = 90 * Math.PI / 180;
            this._tail.x = 5;
            this._tail.y = (this.height / 2) - 50;
            break;

        case 'left':
            this._tail.rotation = 270 * Math.PI / 180;
            this._tail.x = (this.width) - 5;
            this._tail.y = (this.height / 2) + 25;
            break;

        case 'leftReach':
            this._tail.rotation = 270 * Math.PI / 180;
            this._tail.x = (this.width) - 5;
            this._tail.y = (this.height / 2);
            break;

        default:        
            this._tail.x = (this.width / 2) - 25;
            this._tail.y = this.height - 5;
            break;
    }
    this.addChildAt(this._tail, 1);
};

ChoiceEngine.Message._update = Window_Message.prototype.update;
Window_Message.prototype.update = function() {
    ChoiceEngine.Message._update.call(this);
    if ($gameMessage._target == true){
        this.customPlacement($gameMessage._targetid);
    } 
};

ChoiceEngine.Message._newPage = Window_Message.prototype.newPage;
Window_Message.prototype.newPage = function (textState) {
    ChoiceEngine.Message._newPage.call(this, textState);
    if ($gameMessage._center === true && $gameMessage.background() == 1){
        textState.x = (Graphics.boxWidth - ($gameMessage._msgLength)) / 2;
    }
}

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
    this.resetFontSettings();
    $gameMessage._target = false;
    $gameMessage._targetid = undefined;
    $gameMessage._center = false;
    $gameMessage._speaker = false;
    $gameMessage._speakerName = undefined;
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

//-----------------------------------------------------------------------------
//  Window_mapName
//-----------------------------------------------------------------------------

Window_MapName.prototype.refresh = function() {
    this.contents.clear();
    if ($gameMap.displayName()) {
        var width = this.contentsWidth();
        this.drawText($gameMap.displayName(), 0, 0, width, 'center');
    }
};

})();