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

### Adding an RNAcanvas app object to the document

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

### The drawing of an app

The drawing of an RNAcanvas app instance
represents an SVG document that is a two-dimensional nucleic acid structure drawing.

```javascript
app.drawing;
```

### The user's view of the drawing

The user's view of the drawing of the app is represented by the `drawingView` interface.

```javascript
app.drawingView;

// the center point of the user's view of the drawing (in drawing coordinates)
app.drawingView.centerPoint = { x: 557, y: 1825 };
app.drawingView.centerPoint; // { x: 557, y: 1825 }

// adjusts the scaling of the drawing and scrollbar positions
app.drawingView.fitToContent();
```
