## 0.2.8 `15 Aug 2021`

- 💄 Lighter color for icon

## 0.2.7 `15 Aug 2021`

- 🔨 Refactor a bit, upgrade dependencies

## 0.2.6 `26 Sep 2019`

- 🔨 Remove gifs from the extension

## 0.2.5 `05 Feb 2019`

- 🔨 Reduce the size of `.gif` and improve its quality
- 🔨 Register TextEditor commands instead of the global ones

## 0.2.4 `06 Jan 2019`

- 🔨 Ignore more files

## 0.2.3 `06 Jan 2019`

- 🐛 Using `"workOnSingleLine": false,` should type <kbd>Space</kbd> instead of no-op
- 🔨 Bundle extension with [webpack](https://github.com/Microsoft/vscode-extension-samples/tree/master/webpack-sample)
- 🔨 Exclude unecessary files from bundle `package-lock.json`, `tslint.json`
- 🔨 Convert indentation to tabs
- 🔨 Bundle 1 `.gif` example insted of 3

## 0.2.2 `06 Feb 2018`

- ✨ New setting for indenting only when the range is completed fixes([#2][i2])

## 0.2.0 `14 Nov 2017`

- 🐛 Don't replace the entire range. Fixes ([#1 Decorations are wobbly][i1])

## 0.1.0 `13 Nov 2017`

- 🐛 Preserve cursor position

## 0.0.1 `10 Nov 2017`

- Initial release

[i1]: https://github.com/usernamehw/vscode-indent-one-space/issues/1
[i2]: https://github.com/usernamehw/vscode-indent-one-space/issues/2