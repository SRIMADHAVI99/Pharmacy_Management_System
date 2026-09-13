const fs = require('fs');
let text = fs.readFileSync('src/pages/POS.jsx', 'utf8');
text = text.replace(/\?\{/g, '${');
text = text.replace(/>\$\{Number/g, '>₹{Number');
text = text.replace(/>\$\{subtotal/g, '>₹{subtotal');
text = text.replace(/>\$\{taxAmount/g, '>₹{taxAmount');
text = text.replace(/>\$\{Math\.max/g, '>₹{Math.max');
text = text.replace(/\$\{Number\(item\.unit_price/g, '₹{Number(item.unit_price');
fs.writeFileSync('src/pages/POS.jsx', text);
