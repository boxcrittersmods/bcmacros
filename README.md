# BCMacro API


## How to use
```can someone add screenshots i dont know how```

1. Click Settings
1. and away you go
## Docs
	new BCMacro(name,action,mod?)
* name:string
* action:function
* mod:boolean  *optional*
	* deletes on refresh
	* but other settings such as button and keys are saved
	* useful for mods incase they change the functionality of a macro
### Methods
#### `toggleButton(color?,place?,text?)`
#### `bindKey(keycode)`
#### `dataify()`
#### `setupMod()`

### Static
#### BCMacro.createDialogue
#### BCMacro.createButton
#### BCMacro.sendMessage
#### BCMacro.save
#### BCMacro.reset
#### BCMacro.DisplaySettings