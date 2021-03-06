# BCMacro API

[![BCMacro API](https://api.boxcrittersmods.ga/button/bcmacro-api)](https://boxcrittersmods.ga/mods/bcmacro-api/)

An API for creating buttons and keybinds.


### Installing

Install us via the [BCMC Website](https://boxcrittersmods.ga/mods/bcmacro-api/).

## Usage

Go on to the [BoxCritters Website](https://boxcritters.com) and click the the ⚙️Settings button.

### Mod Development

When making macros for your mod, enable the mod flag in the constructor so it gets deleted each refresh. After setting up your default settings, run `setupMod()` on your macro to apply the user settings.

### Usage

#### In Mods
```js
var myMacroPack = BCMacros.createMacroPack("Pack Name");
myMacroPack.createMacro({
    name:"Macro 1",
    action:function() {
        console.log("Hello World")
    },
    button:{}
})

myMacroPack.createMacro({
    name:"Macro 2",
    action:function() {
        console.log("Hello World")
    },
    key:"p"
})
```

### Docuementation

All documentation lives [here](https://docs.boxcrittersmods.ga/BCMacroAPI/)


## Licensing

All the code of this project is licensed under the [Apache License version 2.0](https://github.com/boxcritters/bcmacroapi/blob/master/LICENSE) (Apache-2.0).

```license
	Copyright 2020 TumbleGamer <tumblegamer@gmail.com>
	Copyright 2020 The Box Critters Modding Community

	Licensed under the Apache License, Version 2.0 (the "License");
	you may not use this file except in compliance with the License.
	You may obtain a copy of the License at

		http://www.apache.org/licenses/LICENSE-2.0

	Unless required by applicable law or agreed to in writing, software
	distributed under the License is distributed on an "AS IS" BASIS,
	WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	See the License for the specific language governing permissions and
	limitations under the License.
```

All the documentation of this project is licensed under the [Creative Commons Attribution-ShareAlike 4.0 International](https://creativecommons.org/licenses/by-sa/4.0/) (CC BY-SA 4.0) license.

[![CC BY-SA 4.0](https://i.creativecommons.org/l/by-sa/4.0/88x31.png)](https://creativecommons.org/licenses/by-sa/4.0/)