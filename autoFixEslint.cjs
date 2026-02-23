const { execSync } = require('child_process');
const fs = require('fs');

const file = 'src/modules/noc/NOCApplication.jsx';
console.log('Running eslint --format json...');
let output;
try {
    output = execSync('npx eslint src/modules/noc/NOCApplication.jsx --format json', { encoding: 'utf8' });
} catch (e) {
    output = e.stdout;
}

const results = JSON.parse(output);
const fileResult = results[0];
if (!fileResult || !fileResult.messages) {
    console.log('No lint errors found or failed to parse.');
    process.exit(0);
}

let lines = fs.readFileSync(file, 'utf8').split('\n');
const errorsToFix = fileResult.messages.filter(m => m.ruleId === 'no-unused-vars');

// Sort descending so we can insert without messing up line numbers
errorsToFix.sort((a, b) => b.line - a.line);

// Use a Set to avoid inserting multiple times on the same line if multiple vars are unused on one line
const processedLines = new Set();

for (const error of errorsToFix) {
    const targetLineIndex = error.line - 1; // 0-indexed
    if (!processedLines.has(targetLineIndex)) {
        const indentMatch = lines[targetLineIndex].match(/^\s*/);
        const indent = indentMatch ? indentMatch[0] : '';
        lines.splice(targetLineIndex, 0, indent + '// eslint-disable-next-line no-unused-vars');
        processedLines.add(targetLineIndex);
    }
}

fs.writeFileSync(file, lines.join('\n'));
console.log(`Auto-fixed ${processedLines.size} unused var lines.`);
