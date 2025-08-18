# cmake-formatter

Visual Studio Code extension that formats CMake files using `cmake-format`, installed via Python's `pip`. Developed with help from Microsoft Copilot.

This extension integrates `cmake-format` into Visual Studio Code, allowing you to format `.cmake` and `CMakeLists.txt` files manually or automatically on save.

## Features

- Format `.cmake` and `CMakeLists.txt` files using `cmake-format`
- Manual formatting via Command Palette
- Format-on-save support
- Version check against required `cmake-format` version
- Configurable executable path and version

## Settings

Configure the extension in your VS Code settings (`settings.json` or via the UI).

| Setting | Type | Default | Description |
|--------|------|---------|-------------|
| `cmake-formatter.executablePath` | `string`  | `""`    | Absolute path to the `cmake-format` executable installed via pip |
| `cmake-formatter.neededVersion`  | `string`  | `""`    | Required version of `cmake-format` (optional) |
| `cmake-formatter.formatOnSave`   | `boolean` | `false` | Automatically apply formatting when saving CMake files |

### Example Configuration

```json
"cmake-formatter.executablePath": "/usr/local/bin/cmake-format",
"cmake-formatter.neededVersion": "0.6.13",
"cmake-formatter.formatOnSave": true
```

## Commands

Use these commands from the Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P`):

- `cmake-formatter: Apply cmake-format` – Format the current CMake file
- `cmake-formatter: Toggle cmake-formatter format-on-save` – Enable or disable format-on-save

## Requirements

You must have `cmake-format` installed via Python pip:
```bash
pip install cmakelang
# Or
pip install cmakelang==0.6.13
```

To find the executable path:
```bash
which cmake-format   # Linux/macOS
where cmake-format   # Windows
```

## Release Notes

### 0.0.2 - 2025-08-19

- Added an icon for the extension to improve visibility in the VSCode marketplace and editor
- Fixed an issue where no error was shown if `cmake-formatter.executablePath` was not set

## License

MIT

## Contributing

Feel free to open issues or pull requests to improve the extension. Bug fixes, feature suggestions, and documentation updates are welcome.

## Resources

- [GitHub Repository](https://github.com/sameermahant/vsce-cmake-format)

## Acknowledgments

This extension was developed with assistance from [Microsoft Copilot](https://copilot.microsoft.com), an AI companion that supported code generation, refactoring, and documentation.
