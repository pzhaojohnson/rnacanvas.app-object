The RNAcanvas app object encapsulates an entire RNAcanvas app instance.

# Installation

With `npm`:

```
npm install @rnacanvas/app-object
```

# Usage

### Imports

```javascript
// the RNAcanvas app object constructor
import { RNAcanvas } from '@rnacanvas/app-object';
```

### Creating a new RNAcanvas app object

```javascript
var app = new RNAcanvas();
```

### Adding an RNAcanvas app instance to the document

It is important that an RNAcanvas app object be added to the document of a webpage
since much of the underlying functionality related to SVG drawing
only works for elements that have been added to the document.

```javascript
// can also be added to any container node
app.appendTo(document.body);

// remove the RNAcanvas app object from its parent container node
app.remove();
```

### The DOM node reference

The DOM node corresponding to an RNAcanvas app instance
contains all of the elements that comprise an RNAcanvas app instance
and can be accessed using the `domNode` property.

The DOM node reference can be used to set certain styles of an RNAcanvas app instance
(e.g., `width` and `height`).

However, the internal contents and styling
of the DOM node corresponding to an RNAcanvas app instance
are not meant to be directly edited by outside code.

```javascript
app.domNode;

app.domNode.style.width = '600px';
app.domNode.style.height = '400px';
```

### The `style` property

For convenience, a `style` property is also provided
that simply forwards to the `style` property of the DOM node
corresponding to an RNAcanvas app instance.

```javascript
app.style.width = '600px';
app.style.height = '750px';
```

### The drawing of the app

The drawing of an RNAcanvas app instance
represents an SVG document that is a two-dimensional nucleic acid structure drawing.

```javascript
app.drawing;
```

### Drawing structures

For convenience, structures expressed in dot-bracket notation
can be drawn using the `drawDotBracket` method,
which will append the specified structure to the drawing of the app.

Note that this method alone will not adjust the padding of the drawing
or the user's view of the drawing after a structure has been drawn.

```javascript
var seq = 'AGAGUAGCAUUCUGCUUUAGACUGUUAACUUUAUGAACCACGCGUGUCACGUGGGGAGAGUUAACAGCGCCC';
var dotBracket = '(((((((....)))))))...(((((((((((.....(((((.......)))))..))))))))))).....';

app.drawDotBracket(seq, dotBracket);

// ensure that the drawn structure fits inside the drawing
// (and include some extra space around the drawn structure)
app.drawing.setPadding(200);

app.drawingView.fitToContent();
```

### The user's view of the drawing

The user's view of the drawing of the app is represented by the `drawingView` interface.

```javascript
app.drawingView;

// the center point of the user's view of the drawing (in drawing coordinates)
app.drawingView.centerPoint = { x: 557, y: 1825 };
app.drawingView.centerPoint; // { x: 557, y: 1825 }

// adjusts the scaling of the drawing and scrollbar positions
// (to fit the content of the drawing all on screen)
app.drawingView.fitToContent();
```

### The currently selected elements

The `selectedSVGElements` property represents the set of currently selected SVG elements
in the drawing of the app.

```javascript
app.selectedSVGElements.addAll([...app.drawing.secondaryBonds].slice(10, 20).map(sb => sb.domNode));

[...app.selectedSVGElements].forEach(ele => {
  ele.setAttribute('stroke', 'blue');
  ele.setAttribute('stroke-width', '3');
  ele.setAttribute('stroke-linecap', 'round');
});

app.selectedSVGElements.include([...app.drawing.secondaryBonds][10].domNode); // true

app.selectedSVGElements.removeAll([...app.drawing.secondaryBonds].slice(5, 12).map(sb => sb.domNode));
app.selectedSVGElements.include([...app.drawing.secondaryBonds][10].domNode); // false

app.selectedSVGElements.clear();
[...app.drawing.secondaryBonds].every(sb => !app.selectedSVGElements.include(sb.domNode)); // true
```

The currently selected SVG elements can also be listened to for when they change.

```javascript
var numSelectedSVGElements = [...app.selectedSVGElements].length;

app.selectedSVGElements.addEventListener('change', () => numSelectedSVGElements = [...app.selectedSVGElements].length);
```

Similarly, the `selectedBases` property represents the currently selected set of bases
in the drawing of the app.

```javascript
let numSelectedBases = [...app.selectedBases].length;
app.selectedBases.addEventListener('change', () => numSelectedBases = [...app.selectedBases].length);

app.selectedBases.addAll([...app.drawing.bases].slice(25, 50));
numSelectedBases; // 25

app.selectedBases.include([...app.drawing.bases][25]); // true
app.selectedBases.include([...app.drawing.bases][24]); // false
```

The `selectAll` method can also be used to select all elements in the drawing of the app.

```javascript
app.selectAll();
```

### Opening forms

Forms can be opened using the `openForm` method.

```javascript
// for controlling the layout of bases in the drawing of the app
app.openForm(app.basesLayoutForm);

// for exporting the drawing (e.g., as an SVG image)
app.openForm(app.exportForm);
```

In general, any element with absolute positioning
(i.e., with a `position` CSS style of `absolute`)
could potentially be opened as a custom form in an RNAcanvas app instance.

```javascript
var customForm = document.createElement('div');
customForm.textContent = 'A custom form.';

customForm.style.position = 'absolute';
customForm.style.left = '50px';
customForm.style.top = '50px';

app.openForm(customForm);
```

Alternatively, a wrapping object can be opened as a form
(i.e., input to the `openForm` method)
so long as it fulfills the `Form` interface below.

```typescript
interface Form {
  /**
   * Appends the DOM node corresponding to the form to the provided container node.
   */
  appendTo(container: Node): void;
}
```

Forms are positioned relative to the bounding box of the RNAcanvas app instance.

Forms are closed by simply removing them
(i.e., by calling the `remove` method on their corresponding DOM nodes).

Forms can be made draggable by applying the `DragTranslater` class of the `@rnacanvas/forms` package to them.

### `closeForm()`

Closes the topmost form.

Does nothing if no forms are open.

```javascript
app.closeForm();
```

### `closeAllForms()`

Closes all currently open forms.

Does nothing if no forms are open.

```javascript
app.closeAllForms();
```

### `exportSVG()`

Exports the drawing of the app in its current state as an SVG image for the user to download.

```javascript
app.exportSVG();
```

### `newTab()`

Opens a new blank tab of the RNAcanvas app.

```javascript
app.newTab();
```

### `duplicateTab()`

Opens a new duplicate tab of the RNAcanvas app
(i.e., a tab with the same URL parameters).

<b>Known issue #1:</b> This method cannot currently recreate (in the new duplicate tab)
edits to the drawing that the user has made.

To open a new tab of the drawing exactly as is (i.e., with all edits preserved),
download a `.rnacanvas` file of the drawing
and open the `.rnacanvas` file in a new tab of the RNAcanvas app.

<b>Known issue #2:</b> This method only works if the RNAcanvas URL interface
was used in the first place to draw the drawing currently being shown.

```javascript
app.duplicateTab();
```

This method will omit the `peripheral_ui` URL parameter from the new tab
so that it is always opened with a full peripheral UI.

(This is a useful property of this method when the RNAcanvas app is currently embedded in another website
without the full peripheral UI being shown.)
