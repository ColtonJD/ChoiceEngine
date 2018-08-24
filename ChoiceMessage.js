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
ChoiceEngine.Message.Name_Color = Number(ChoiceEngine.Message.Params['Name Color Code']);
ChoiceEngine.Message.Name_Outline = Number(ChoiceEngine.Message.Params['Name Outline Color Code']);
ChoiceEngine.Message.Name_Outline_Width = Number(ChoiceEngine.Message.Params['Name Outline Width']);

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

Window_Base.prototype.convertEscapeCharacters = function(text) {
    text = text.replace(/\\/g, '\x1b');
    text = text.replace(/\x1b\x1b/g, '\\');
    text = text.replace(/\x1bV\[(\d+)\]/gi, function() {
        return $gameVariables.value(parseInt(arguments[1]));
    }.bind(this));
    text = text.replace(/\x1bV\[(\d+)\]/gi, function() {
        return $gameVariables.value(parseInt(arguments[1]));
    }.bind(this));
    text = text.replace(/\x1bN\[(\d+)\]/gi, function() {
        return this.actorName(parseInt(arguments[1]));
    }.bind(this));
    text = text.replace(/\x1bP\[(\d+)\]/gi, function() {
        return this.partyMemberName(parseInt(arguments[1]));
    }.bind(this));
    text = text.replace(/\x1bG/gi, TextManager.currencyUnit);
    text = text.replace(/\bTARGET\[(\d+)\]/gi, function(){
        $gameMessage._target = true;
        $gameMessage._targetid = arguments[1];
        return '';
    }.bind(this));
    text = text.replace(/CHARNAME\[(.*?)\]/gi, function(){
        $gameMessage._speaker = true;
        $gameMessage._speakerName = arguments[1];
        return '';
    });
    text = text.replace(/\bFITMSG/gi, function(){
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
    this.contents.fontSize = this.standardFontSize();
    this.resetTextColor();
    this.contents.outlineColor = this.textColor(ChoiceEngine.Message.Name_Outline);
    this.contents.outlineWidth = ChoiceEngine.Message.Name_Outline_Width;
};

Window_CharName.prototype.resetTextColor = function() {
    this.changeTextColor(this.textColor(ChoiceEngine.Message.Name_Color));
};

//-----------------------------------------------------------------------------
//  Window_Message
//-----------------------------------------------------------------------------

Window_Message.prototype.startMessage = function() {
    this._textState = {};
    this._textState.index = 0;

    this._textState.text = this.convertEscapeCharacters($gameMessage.allText());

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
        this.newPage(this._textState);
        this.updatePlacement();
        this.updateBackground();
        this.open();
    }
};

Window_Message.prototype.createWindowTail = function() {
    this._tail = new Window_Tail();
    this.addChild(this._tail);
}

Window_Message.prototype.createCharName = function(name) {
    this._charName = new Window_CharName(name);
    this.addChild(this._charName);
}

Window_Message.prototype.customPlacement = function(targetid) {
    this.createWindowTail();
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
    this._goldWindow.y = this.y > 0 ? 0 : Graphics.boxHeight - this._goldWindow.height;
};

ChoiceEngine.Message._updatePlacement = Window_Message.prototype.updatePlacement
Window_Message.prototype.updatePlacement = function() {
    ChoiceEngine.Message._updatePlacement.call(this);
    this.x = 0;
};

Window_Message.prototype.resetFontSettings = function() {
    this.contents.fontFace = 'MessageFont';
    this.contents.fontSize = this.standardFontSize();
    this.resetTextColor();
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

//-----------------------------------------------------------------------------
//  Window_Tail
//-----------------------------------------------------------------------------

Window_Tail = function(name) {
    arguments.name = name;
    this.initialize.apply(this, arguments);
}

Window_Tail.prototype = Object.create(Sprite_Base.prototype);
Window_Tail.prototype.constructor = Window_Tail;

Window_Tail.prototype.initialize = function() {
    Sprite_Base.prototype.initialize.call(this);
    this.createBitmap();
};

Window_Tail.prototype.createBitmap = function() {
    this.bitmap = ImageManager.loadPicture('WindowArrow');
}

Window_Tail.prototype.update = function() {
    Sprite_Base.prototype.update.call(this);
    this.updatePosition();
};

Window_Tail.prototype.updatePosition = function() {
    this.x = Graphics.boxWidth / 2 - 20;
    this.y = 175;
};





})();