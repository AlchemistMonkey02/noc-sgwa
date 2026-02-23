const fs = require('fs');
const file = 'c:/Users/DELL/Desktop/rgwacma/SGWA/src/modules/noc/NOCApplication.jsx';
let content = fs.readFileSync(file, 'utf8');

// The goal is to replace noc-form-row, noc-form-group, bhuneer-label, bhuneer-input 
// with the new nd-form-grid, nd-form-group, nd-form-label, nd-form-control

// For 'bhuneer-label required' -> 'nd-form-label' + add required star span
content = content.replace(/<label className="bhuneer-label required">(.*?)<\/label>/g,
    '<label className="nd-form-label">\n                                                <span>$1</span>\n                                                <span className="required-star" style={{ color: \'#ef4444\' }}>*</span>\n                                            </label>'
);

// For normal 'bhuneer-label'
content = content.replace(/<label className="bhuneer-label">(.*?)<\/label>/g,
    '<label className="nd-form-label">$1</label>'
);

// For 'noc-form-row two-col' -> 'nd-form-grid'
content = content.replace(/className="noc-form-row two-col"/g, 'className="nd-form-grid"');

// For 'noc-form-row' -> 'nd-form-grid'
content = content.replace(/className="noc-form-row"/g, 'className="nd-form-grid"');

// For 'noc-form-group' -> 'nd-form-group'
content = content.replace(/className="noc-form-group"/g, 'className="nd-form-group"');

// For 'bhuneer-input' -> 'nd-form-control'
content = content.replace(/className={`bhuneer-input(.*?`)}/g, 'className={`nd-form-control$1}');
content = content.replace(/className="bhuneer-input"/g, 'className="nd-form-control"');


fs.writeFileSync(file, content);
console.log('Replaced old styling classes with premium nd-classes.');
