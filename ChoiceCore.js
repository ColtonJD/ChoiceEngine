//=============================================================================
// Choice Engine Core Version 1.0
// ChoiceCore.js
// For: RPG Maker MV v 1.6.1
//============================================================================= 

var Imported = Imported || [];
Imported.ChoiceEngine = true;

var ChoiceEngine = ChoiceEngine || {};
ChoiceEngine.Core = ChoiceEngine.Core || {};


//-----------------------------------------------------------------------------
//  Parameters
//-----------------------------------------------------------------------------
 /*:
 * @plugindesc Choice Engine core functionality and system function
 * @author Choice
 *
 * @param Screen Width
 * @desc Sets the screen width. Default is 1280
 * @default 1280
 *
 * @param Screen Height
 * @desc Sets the screen height. Default is 720
 * @default 720
 *
 *
 * @help
 * //-----------------------------------------------------------------------------
 * //  Description
 * //-----------------------------------------------------------------------------
 *  Core functionality for the Choice Engine.
 *  
 * //-----------------------------------------------------------------------------
 * //  New Function Descriptions
 * //-----------------------------------------------------------------------------
 * No new functions... yet!
 * 
 */

ChoiceEngine.Core.Params = PluginManager.parameters('ChoiceCore');
var screenWidth = Number(ChoiceEngine.Core.Params['screenWidth'], 816);
var screenHeight = Number(ChoiceEngine.Core.Params['screenHeight'], 624);
var windowWidth = screenWidth;
var windowHeight = screenHeight;
SceneManager._screenWidth = screenWidth;
SceneManager._screenHeight = screenHeight;
SceneManager._boxWidth = screenWidth;
SceneManager._boxHeight = screenHeight;


(function() {
//-----------------------------------------------------------------------------
//  ConfigManager
//-----------------------------------------------------------------------------

    var _ConfigManager_applyData = ConfigManager.applyData;
    ConfigManager.applyData = function(config) {
        _ConfigManager_applyData.apply(this, arguments);
    };

//-----------------------------------------------------------------------------
//  SceneManager
//-----------------------------------------------------------------------------

    var _SceneManager_initNwjs = SceneManager.initNwjs;
    SceneManager.initNwjs = function() {
        _SceneManager_initNwjs.apply(this, arguments);
        if (Utils.isNwjs() && windowWidth && windowHeight) {
            var dw = windowWidth - window.innerWidth;
            var dh = windowHeight - window.innerHeight;
            window.moveBy(-dw / 2, -dh / 2);
            window.resizeBy(dw, dh);
        }
    };



})();