# I/O

The main I/O is done through table parsers, and table makers.

The parsers, unlike the rest of the project, uses a procedural structure. Each parser is exposed as single function that expects raw pasted text from the data tables. The first step for all parsers is to split that string into a more manageable matrix. Google Sheets separates rows with newlines, and columns with tabs. However, it isn't as simple as using `split()` a few times. Cells can contain newlines and tabs themselves, and rows can be empty, or not contain the expected number of filled cells. Each parser has a function to split its input string, deal with unexpected tabs and newlines, and remove empty cells.

After creating the matrix, it's used to create the program state by building objects, and giving them to the associated singleton managers.

The [buildings parser](../src/ts/parsers/building-parser.ts) is a simple example of this.

The exception is response parsing, which is more complicated. In order to rebuild the response table for copying schedules out of the program, the split matrix is given to `ResponseTableMaker`. Importantly, the response table maker will also create `Response` objects for each row in the table. This is done in `ResponseTableMaker.buildResponses()`. The is called as a side-effect of setting the response matrix with `ResponseTableMaker.setOriginalMatrix()`. The response parser then uses the created response objects to set up tutor state.

Output is created as updated tables that can be pasted back into Google Sheets. The actual buttons are for this are created in the [header factory](../src/ts/elements/header/header-factory.ts).

To create the updated response table, the `ResponseTableMaker` will create JSON serializations of each tutor, and replace the timestamp column in the tutor's response with this serialization. To create a serialization use `ResponseTableMaker.encodeTutor(tutor)`, and deserialize use `ResponseTableMaker.decodeTutor(string)`. To easily differentiate a serialized tutor from a timestamp, the header "TE:" (for Tutor Encoding) is added to the start of the JSON string.

The other 3 schedule outputs are made in the `ScheduleTableMaker`. These are just using simple string concatenation.