# ChoiceEngine
Choice Engine Plugins for RPG Maker MV. This is a collection of plugins designed to enhance the RPGMaker MV experience and provide a more complete and flexible development experience for game creators. Plugins have been primarily tested using [Time Fantasy](http://timefantasy.net/) style assets. 

## Prerequisites

What things you need to install the software and how to install them

RPG Maker MV v 1.6.0 or newer.

## Installing

1. If you do not have the ChoiceCore.js plugin installed, you must install that first. 
2. Select the plugin .js file you wish to add into your game.
3. Download and paste it into the js/plugins folder for your RPG Maker MV project. The individual instructions, script commands, parameters, etc are described within the help text of the plugin and in the README below the appropriate heading.
4. Add the plugin to the RPG Maker MV plugin list inside the RPG Maker MV game engine. 

## Plugin Descriptions

### ChoiceCore.js
Core funcitonality. This is required for all other plugins. Availble is the option to adjust the screen resolution in the plugin settings. 

#### Installing

1. Place the file in your plugins folder. 
2. You may then install the plugin inside of RPG Maker MV. 

### ChoiceMessage.js
![Demo ChoiceMessage.js screenshot of bubble text](/img/ChoiceMessage.png "Example Dialouge")
The choice bubble dialouge system. This plugin allows you to anchor dialouge to the player or a specific event. You may also draw an indicator from the speaking player/event to the dialouge. Additional dialouge commands allow the automatic centering and resizing of messages. Finally, the text boxes will automatically react to screen edges and follow moving events. 

#### Installing
1. Place the file in your plugins folder. 
2. You may then install the plugin inside of RPG Maker MV. 
3. The ChoiceMessage plugin require a 'Window Arrow' to be saved into the img/system folder. 
4. You must also provide a custom Window_Message image in the same folder. 
(Included in this repository are the images from the example screenshot. Find those files in the /img folder.)
5. The fonts css file (found in fonts/gamefont.css) must load in a new GameFont and MessageFont. You may set this to whatever you like. I have included an example in the repo under \font.

#### Usage
Message boxes will work as they normally would unless you include one of the following commands:
1. \center Displays a centered message box that has margins adjusted for text width (as opposed to the normal full width message box).
2. \target[targetid] Displays a bubble dialouge for the target event id. To target the player, use a target id of 0. (The event id is found in the top left corner of the event editor. Do not include proceeding zeros. For example: ID:008 can be targeted using \target[8])
3. \charname[Name] Displays "Name" as the speaker name. Only availible when used along with a \target command. 


#### Parameters
The following plugin settings are availible: 
1. Speech Pointer: The name of the .png file to be used as a arrow from character to speech dialouge. 
2. Message Padding: Padding between message window border and internal text.
3. Message Text Size: Font size of the message text.
4. Text Color Code: The Window_Message Color Code to be used for dialouge text.
5. Text Outline Color Code: The Window_Message Color Code to be used for outlining dialouge text.
6. Text Outline Width: The width of the dialouge outline.
7. Name Text Size: 
8. Name Color Code: The Window_Message Color Code to be used for
9. Name Outline Color Code: The Window_Message Color Code to be used for
10. Name Outline Width: 
11. Target Offset X: The X axis offset for dialouge bubbles. Only used when a dialouge bubble goes outside of the screen and must be adjusted to the left or right.
12. Target Offset Y: The Y axis offset for dialouge bubbles.  Used when placing a message bubble above or below a sprite. Required to adjust for sprite height and window arrow height. 

## Contributing

Bugs: In the event you encounter a plug, please use the issues option in this repo to submit it. 

Fixes: Feel free to make any enhancements or changes you like. If you do submit a pull request for a bug fix, please reference the issue # in your commit. 

Enhancements: New functionality or non-requested improvements are fine as well. Just be sure to be descriptive in your pull requests.

## Versioning

The version of each individual plugin is mainted within the plugins .js file itself

## Authors

* **Colton J. Dale** - *Initial work* - [Portfolio](https://www.coltonjdale.com)

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
