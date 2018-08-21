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
//  New Function Descriptions
//-----------------------------------------------------------------------------
 /*
 * Function: Window_Message.prototype.customMessage()
 * Desc: Checks message for custom settings and returns object with the
 * flags / values
 * Matches on:
 *  /target[target] (target an event or player)
 *  /fitmessage (Fits message to fit text)
 * Returns:
 * target{
 *  found: Boolean, (is there a target)
 *  "x": Number (x position of target adjusted for offset),
 *  "y": Number (y position of taget adjusted for offset),
 *  "fitmsg": Boolean (flag to shrink message) 
 * }
 * 
 * Function: Window_Message.prototype.customPlacement()
 * Desc: Replaces Window_Message.updatePlacement when moving message to   
 * a custom location
 */

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
 * @param Target Offset X
 * @desc X Offset for Targeted Messages
 * @default 0
 * 
 * @param Target Offset Y
 * @desc Y Offset for Targeted Messages
 * @default 150
 */
ChoiceEngine.Message.Params = PluginManager.parameters('ChoiceMessage');
ChoiceEngine.Message.Target_Y_Offset = Number(ChoiceEngine.Message.Params['Target Offset Y']);
ChoiceEngine.Message.Target_X_Offset = Number(ChoiceEngine.Message.Params['Target Offset X']);

(function() {

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
    text = text.replace(/\[.*?\]/g, '');
    return text;
};

//-----------------------------------------------------------------------------
//  Window_Message
//-----------------------------------------------------------------------------

Window_Message.prototype.startMessage = function() {
    this._textState = {};
    this._textState.index = 0;
    var target = new Window_Message.prototype.customMessage();

    this._textState.text = this.convertEscapeCharacters($gameMessage.allText());
    
    var temp = this.textWidth($gameMessage.text);
    console.log(temp);
    
    if(target.found == true){
        this.newPage(this._textState);
        
        target.x -= (this.width / 2) + ChoiceEngine.Message.Target_X_Offset;
        target.y -= this.height + ChoiceEngine.Message.Target_Y_Offset; 
        
        this.customPlacement(target);
        this.updateBackground();
        this.open();
    }else{
        this.newPage(this._textState);
        this.updatePlacement();
        this.updateBackground();
        this.open();
    }
};

Window_Message.prototype.customMessage = function() {
    this.found = false;
    var text = $gameMessage.allText();

    text = text.replace(/\bTARGET\[(\d+)\]/gi, function() {
            var eventid = arguments[1];
            if (eventid > 0) {
            this.found = true; 
            var ev = $gameMap.event(eventid);
            this.x = ev.screenX();
            this.y = ev.screenY();
        } else if (eventid == 0){
            this.found = true; 
            this.x = $gamePlayer.screenX();
            this.y = $gamePlayer.screenY();
        } else {

        };
        return '';
    }.bind(this));
    
    text = text.replace(/\bFITMSG/gi, function() {
        console.log("fit message found");
        return ''
    }.bind(this));

    return this;
};

/*Window_Message.prototype.sizeWindow = function() {
    var textArr = $gameMessage._texts;
    for (var i = 0; i < textArr.length; i++) {
        if($gameMessage._texts[i] == ''){
            textArr.slice(i, i+1);
        } else {
            console.log(textArr[i]);
        }
    }
}*/

Window_Message.prototype.customPlacement = function(target) {
    this._positionType = $gameMessage.positionType();
    this.y = target.y;
    this.x = target.x;
    this._goldWindow.y = this.y > 0 ? 0 : Graphics.boxHeight - this._goldWindow.height;
};

})();