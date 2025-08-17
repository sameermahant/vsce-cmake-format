# cmake-format

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
All settings are prefixed with your extension ID: `intellect-ind-in.cmake-format`.

| Setting | Type | Default | Description |
|--------|------|---------|-------------|
| `intellect-ind-in.cmake-format.executablePath` | `string` | `""` | Absolute path to the `cmake-format` executable installed via pip |
| `intellect-ind-in.cmake-format.neededVersion` | `string` | `""` | Required version of `cmake-format` (optional) |
| `intellect-ind-in.cmake-format.formatOnSave` | `boolean` | `false` | Automatically apply formatting when saving CMake files |

### Example Configuration

```json
"intellect-ind-in.cmake-format.executablePath": "/usr/local/bin/cmake-format",
"intellect-ind-in.cmake-format.neededVersion": "0.6.13",
"intellect-ind-in.cmake-format.formatOnSave": true
```

## Commands

Use these commands from the Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P`):

- `Apply cmake-format` – Format the current CMake file
- `Toggle cmake-format Format on Save` – Enable or disable format-on-save

## Requirements

You must have `cmake-format` installed via Python pip:

```bash
pip install cmake-format
# Or
pip install cmake-format==0.6.13
```

To find the executable path:
```bash
which cmake-format   # Linux/macOS
where cmake-format   # Windows
```

## Release Notes

### 0.0.1 - 2025-08-18

- Initial release
- Supports formatting `.cmake` and `CMakeLists.txt` files
- Includes manual formatting and format-on-save toggle
- Configurable settings for executable path and version

## License

MIT

## Contributing

Feel free to open issues or pull requests to improve the extension. Bug fixes, feature suggestions, and documentation updates are welcome.

## Resources

- [GitHub Repository](https://github.com/sameermahant/vsce-cmake-format)

## Acknowledgments

This extension was developed with assistance from [Microsoft Copilot](https://copilot.microsoft.com), an AI companion that supported code generation, refactoring, and documentation.
