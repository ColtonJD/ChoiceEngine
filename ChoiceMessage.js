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
 * Function: Window_Message.prototype.target()
 * Desc: Checks if a target has been identified in the string. If it has it 
 * returns a object containing target details
 * Returns:
 * target{
 *  found: Boolean,
 *  x: x position of target adjusted for offset,
 *  y: y position of taget adjusted for offset, 
 * }
 * 
 * 
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
 * @default 0
 */
ChoiceEngine.Message.Params = PluginManager.parameters('ChoiceMessage');

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
    var target = new Window_Message.prototype.target();
    
    this._textState.text = this.convertEscapeCharacters($gameMessage.allText());
    
    
    if(target.found == true){
        this.newPage(this._textState);
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

Window_Message.prototype.target = function() {
    this.found = false;
    var text = $gameMessage.allText();

    text = text.replace(/TARGET\[(\d+)\]/gi, function() {
        var eventid = arguments[1];
        if (eventid > 0) {
        this.found = true; 
        var ev = $gameMap.event(eventid);
        this.x = ev.screenX();
        this.y = ev.screenY();
        } else{
            
        }
        return '';
    }.bind(this));

    return this;
};

Window_Message.prototype.customPlacement = function(target) {
    this._positionType = $gameMessage.positionType();
    this.y = target.y;
    this.x = target.x;
    this._goldWindow.y = this.y > 0 ? 0 : Graphics.boxHeight - this._goldWindow.height;
};

})();