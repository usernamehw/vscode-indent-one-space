## Features

You can move selected code left or right with the <kbd>Spacebar</kbd> key.

![Moving left or right with hotkeys](https://raw.githubusercontent.com/usernamehw/vscode-indent-one-space/master/img/demo.gif "Theme: Palenight")

## Settings
```javascript
"indentOneSpace.workOnSingleLine": true,// Even if 1 character on 1 line is selected - the command will work.
"indentOneSpace.cramReversed": true,// Outdent lines even if one of them has reached column 0 (gutter).
"indentOneSpace.onlyCompleteRange": false,// Indent works only when selection has nothing or whitespace characters on the sides
```

## Commands

* **extension.indentOneSpace** default keybinding <kbd>Space</kbd>
* **extension.reverseIndentOneSpace** default keybinding <kbd>Shift</kbd>+<kbd>Space</kbd>
