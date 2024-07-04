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
var rnaCanvas = new RNAcanvas();
```

### Adding an RNAcanvas app object to the document

It is important that an RNAcanvas app object be added to the document of a webpage
since much of the underlying functionality related to SVG drawing
only works for elements that have been added to the document.

```javascript
// can also be added to any container node
rnaCanvas.appendTo(document.body);

// remove the RNAcanvas app object from its parent container node
rnaCanvas.remove();
```

### The RNAcanvas app object DOM node

The DOM node of an RNAcanvas app object
contains all of the elements comprising an RNAcanvas app instance.

The DOM node reference can be used to set certain styles of an RNAcanvas app instance
(e.g., `width` and `height`).

However, the internal contents of an RNAcanvas app object DOM node
are not meant to be directly edited by outside code.

```javascript
rnaCanvas.domNode;

rnaCanvas.domNode.style.width = '600px';
rnaCanvas.domNode.style.height = '400px';
```
