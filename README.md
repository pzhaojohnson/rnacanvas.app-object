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

It is important for the RNAcanvas app object to be added to the document body
since much of the underlying functionality related to SVG drawing
only works for elements that have been added to the document body.

```javascript
rnaCanvas.appendTo(document.body);

// remove the RNAcanvas app object from its parent container node
// (has no effect if the RNAcanvas app object did not have a parent container node to begin with)
rnaCanvas.remove();
```
