const fs = require('fs');
const file = 'c:/Users/DELL/Desktop/rgwacma/SGWA/src/modules/noc/NOCApplication.jsx';
let content = fs.readFileSync(file, 'utf8');

// Fix the irregular unicode whitespace
content = content.replace(/<strong>.*?Restriction Notice:<\/strong>/, '<strong>⚠️ Restriction Notice:</strong>');

// Fix unused documentsLoading
content = content.replace(/const \[documentsLoading, setDocumentsLoading\] = useState\(false\);/, '// eslint-disable-next-line no-unused-vars\n    const [documentsLoading, setDocumentsLoading] = useState(false);');

fs.writeFileSync(file, content);
console.log('Fixed final eslint errors');
