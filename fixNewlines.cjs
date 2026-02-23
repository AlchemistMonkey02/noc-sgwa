const fs = require('fs');
const file = 'c:/Users/DELL/Desktop/rgwacma/SGWA/src/modules/noc/NOCApplication.jsx';
let content = fs.readFileSync(file, 'utf8');
// The file has literal '\\n' strings. We need to replace them with actual newlines.
content = content.split('\\n').join('\n');
fs.writeFileSync(file, content);
console.log('Fixed newlines.');
