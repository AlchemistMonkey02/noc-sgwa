const fs = require('fs');
const file = 'c:/Users/DELL/Desktop/rgwacma/SGWA/src/modules/noc/NOCApplication.jsx';
let content = fs.readFileSync(file, 'utf8');

// The Final Review block contains a stray `nd-form-card nd-animate nd-visible` inside it with a closing div on 2886. Wait, line 2849 has it.
// Checking line 2872:
// `<div className="nd-checkbox-item-premium">` already exists.
// Let's fix the navigation button component
content = content.replace(/className="nd-btn-primary"/g, 'className="bhuneer-submit-btn"');

// Ensure the final declaration checkbox has full styling
content = content.replace(/<div className="nd-checkbox-item-premium">\s*<input\s*type="checkbox"\s*id="final_declaration"/,
    '<div className="nd-checkbox-item-premium" style={{ display: \'flex\', gap: \'15px\', alignItems: \'flex-start\', padding: \'20px\', background: \'rgba(37, 99, 235, 0.04)\', border: \'1px solid rgba(37, 99, 235, 0.1)\', borderRadius: \'12px\' }}>\n                                                <input\n                                                    type="checkbox"\n                                                    id="final_declaration"\n                                                    style={{ marginTop: \'4px\', cursor: \'pointer\', width: \'20px\', height: \'20px\' }}'
);


fs.writeFileSync(file, content);
console.log('Fixed final declaration checkbox and success modal button');
