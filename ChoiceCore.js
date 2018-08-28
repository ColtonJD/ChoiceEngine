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

(function() {

//-----------------------------------------------------------------------------
//  Parameters
//-----------------------------------------------------------------------------

    ChoiceEngine.Core.Params = PluginManager.parameters('ChoiceCore');
    ChoiceEngine.Core.screenWidth = Number(ChoiceEngine.Core.Params['Screen Width'], 816);
    ChoiceEngine.Core.screenHeight = Number(ChoiceEngine.Core.Params['Screen Height'], 624);

//-----------------------------------------------------------------------------
//  SceneManager
//-----------------------------------------------------------------------------
    SceneManager._screenWidth = ChoiceEngine.Core.screenWidth;
    SceneManager._screenHeight =  ChoiceEngine.Core.screenHeight;
    SceneManager._boxWidth = ChoiceEngine.Core.screenWidth;
    SceneManager._boxHeight =  ChoiceEngine.Core.screenHeight;

    ChoiceEngine.Core._SceneManager_initNwjs = SceneManager.initNwjs;
    SceneManager.initNwjs = function() {
        ChoiceEngine.Core._SceneManager_initNwjs.apply(this, arguments);

        if (Utils.isNwjs() && ChoiceEngine.Core.screenWidth && ChoiceEngine.Core.screenHeight) {
            var dw = ChoiceEngine.Core.screenWidth - window.innerWidth;
            var dh = ChoiceEngine.Core.screenHeight - window.innerHeight;
            window.moveBy(-dw / 2, -dh / 2);
            window.resizeBy(dw, dh);
        }
    };
})();