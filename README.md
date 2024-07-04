The RNAcanvas app object encapsulates an entire RNAcanvas app instance.

# Installation

With `npm`:

```
npm install @rnacanvas/app-object
```

# Usage

###Importing

```javascript
// the RNAcanvas app object constructor
import { RNAcanvas } from '@rnacanvas/app-object';
```

###Creating a new RNAcanvas app object

```javascript
var rnaCanvas = new RNAcanvas();

rnaCanvas.appendTo(document.body);

rnaCanvas.remove();
```
