## Layer Sort Scripts for Adobe<sup>&reg;</sup> Photoshop<sup>&reg;</sup>

These scripts sort your groups and layers alphabetically.

| Script | Description |
|--------|-------------|
| `ps-layer-sort.jsx` | Sorts **all** layers and groups in the entire document recursively. |
| `ps-layer-sort-selected.jsx` | Sorts only the layers inside the **currently selected group/folder**. |

### Compatibility

These scripts have only been tested using Adobe<sup>&reg;</sup> Photoshop<sup>&reg;</sup> 22.0 (x64) and later. Please use at your own risk.

### Installing

To install a script and have it appear in the `File > Scripts` menu you must place it in the `Scripts` folder. That folder is located in one of the following locations depending on your operating system:

#### Windows

`%ProgramFiles%\Adobe\Adobe Photoshop 2021\Presets\Scripts`

#### OS X

`/Applications/Adobe Photoshop 2021/Presets/Scripts`

Once you have copied the script to its respective location please restart the application (if it was open while installing the file).

### Running

#### Sort all layers (`ps-layer-sort.jsx`)

1. Open the document that has layers you would like to sort.
2. Click `File > Scripts > ps-layer-sort`.
3. Voilà!

#### Sort selected group only (`ps-layer-sort-selected.jsx`)

1. Open the document that has layers you would like to sort.
2. In the **Layers** panel, select the group/folder whose contents you want to sort.
3. Click `File > Scripts > ps-layer-sort-selected`.
4. Only the direct children of that group will be sorted alphabetically.

> **Tip:** Use this script when you have multiple folders and only want to sort the layers inside one of them, leaving the rest untouched.

### Testing

The `tests/` folder contains PSD fixture files used for manual verification, and a Node.js test script for the selected-sort logic:

```
node tests/test-ps-layer-sort-selected.js
```

Copyright &copy; 2020 Matthew Kimber. All rights reserved.