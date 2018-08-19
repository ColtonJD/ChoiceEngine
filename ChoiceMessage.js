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
 * Window_Message.prototype.customPosition()
 * Desc: Used for determing if a target was set, and the locations of the target.
 * Returns: 
 * 1. eventId: TheId of the targeted event determined by parsing $gameMessage text 
 * for \target[eventId].
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
 */
ChoiceEngine.Message.Params = PluginManager.parameters('ChoiceMessage');

(function() {

//-----------------------------------------------------------------------------
//  Window_Base
//-----------------------------------------------------------------------------
ChoiceEngine.Message._Base_converEscapeCharacters = Window_Base.prototype.convertEscapeCharacters;
Window_Base.prototype.convertEscapeCharacters = function(text) {
    ChoiceEngine.Message._Base_converEscapeCharacters.call(this, text);

};

//-----------------------------------------------------------------------------
//  Window_Message
//-----------------------------------------------------------------------------

Window_Message.prototype.startMessage = function() {
    this._textState = {};
    this._textState.index = 0;

    var target = this.customPosition();

    this._textState.text = this.convertEscapeCharacters($gameMessage.allText());

    if (target >= 0 && target !== "false"){
        alert(target)
    } else{
        this.newPage(this._textState);
        this.updatePlacement();
        this.updateBackground();
        this.open();
    }
};

Window_Message.prototype.customPosition = function() {
    this._eventid = 'false';
    this._text = $gameMessage.allText();
    //Accepting text from another method cannot be garunteed to not have escaped characters removed
    this._text = this._text.replace(/TARGET\[(\d+)\]/gi, function() {
        this._eventid = Number(arguments[1]);
        return '';
    }.bind(this));

    return this._eventid;
};

})();