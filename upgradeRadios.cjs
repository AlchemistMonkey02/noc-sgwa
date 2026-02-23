const fs = require('fs');
const file = 'c:/Users/DELL/Desktop/rgwacma/SGWA/src/modules/noc/NOCApplication.jsx';
let content = fs.readFileSync(file, 'utf8');

// Replace standard radios with premium nd-radio cards
content = content.replace(/className="noc-radio-group"/g, 'className="nd-radio-group"');
content = content.replace(/className="noc-radio-item"/g, 'className="nd-radio-card"');

fs.writeFileSync(file, content);
console.log('Replaced standard radios with premium nd-radio-group cards.');
