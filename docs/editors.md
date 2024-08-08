# Editors

Editor windows are created by inheriting from the `Editor` class. This class creates the skeleton for editors that you can build on in the specific editor sub-class. The first thing that's needed is to call the `Editor` constructor in your sub-class's constructor. You can then create methods to build the specific rows and fields you need for the editor.

```
import { Editor } from "./editor";
import * as fields from "./menu-field";

export class MyEditor extends Editor {
    constructor() {
        super("My Editor");

        this.buildFirstRow();
        this.buildSecondRow();
        this.buildThirdRow();
    }

    ...

}
```

Then, to add it to the page, call its constructor in `main.ts`.

```
import { MyEditor } from "./elements/editors/my-editor";

...

const myEditor = new MyEditor();
```

To open the editor, call its `openMenu()` method. Closing the editor is already handled by the save and cancel buttons.

Editors work by saving a "buffer" of changes that can be validated separately before being applied to the object being edited.

To build the fields in an editor, you can first use the `addRow()` method to add a new row to the editor, then call any of the `addField` methods to add new fields to that row. Each of these methods take at least these arguments:

- `row: number` - The row number to add the field to.
- `title: string` - The name that will be used as a key to get the field, and will be displayed in the editor.
- `validate: (string) => boolean` - Run any time the user changes the value of the field. Return true if the user's input is valid, false if not.
- `valid: (MenuField) => void` - Run if the validate function above returns true. The `MenuField` argument is the field instance that is being made.
- `invalid: (MenuField) => void` - Run if the validate function above returns false.

Different fields will require different arguments. You can refer to the Editor class interface for specifics.

Part of the Editor skeleton is a cancel and save button. When the user clicks the save button, the editor will validate all fields. If they all return true, then `applyChanges()` will be called. This is an abstract method that is used to set the actual properties of the object that's being edited.

You can refer to [the BuildingEditor](../src/ts/elements/editors/building-editor.ts) for a smaller example of how editors are built, and how they handle state.

While the table parser looks similar to editors, it is a separate class. It does use most of the same structure though.