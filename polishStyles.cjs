const fs = require('fs');
const file = 'c:/Users/DELL/Desktop/rgwacma/SGWA/src/modules/noc/styles/noc-portal.css';
let content = fs.readFileSync(file, 'utf8');

// The goal is to enhance the existing `nd-` classes with even better premium UI characteristics

// Enhance nd-form-card background and shadow
content = content.replace(
    /\.nd-form-card \{([^}]+)\}/,
    `.nd-form-card {\n  background: rgba(255, 255, 255, 0.92);\n  backdrop-filter: blur(25px);\n  border: 1px solid rgba(255, 255, 255, 0.8);\n  border-radius: 28px;\n  padding: 45px 50px;\n  box-shadow: 0 20px 50px -15px rgba(15, 23, 42, 0.08);\n  margin-bottom: 40px;\n  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);\n  position: relative;\n  overflow: hidden;\n}`
);

// Enhance nd-form-control inputs
content = content.replace(
    /\.nd-form-control \{([^}]+)\}/,
    `.nd-form-control {\n  background: #f8fafc;\n  border: 2px solid #e2e8f0;\n  border-radius: 14px;\n  padding: 14px 20px;\n  font-size: 1rem;\n  color: #1e293b;\n  font-weight: 500;\n  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);\n  width: 100%;\n  box-shadow: inset 0 2px 4px rgba(0,0,0,0.01);\n}`
);

// Enhance input focus states
content = content.replace(
    /\.nd-form-control:focus \{([^}]+)\}/,
    `.nd-form-control:focus {\n  border-color: #3b82f6;\n  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.15), inset 0 2px 4px rgba(0,0,0,0.01);\n  outline: none;\n  background: white;\n  transform: translateY(-2px);\n}`
);

// Add smoother hover states to inputs
content = content.replace(
    /\.nd-form-control:hover:not\(:focus\):not\(:disabled\) \{([^}]+)\}/,
    `.nd-form-control:hover:not(:focus):not(:disabled) {\n  border-color: #cbd5e1;\n  background: #f1f5f9;\n}`
);

// Enhance buttons - next
content = content.replace(
    /\.nd-btn-next \{([^}]+)\}/,
    `.nd-btn-next {\n  padding: 15px 40px;\n  border-radius: 16px;\n  font-weight: 700;\n  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);\n  color: white;\n  border: none;\n  box-shadow: 0 10px 25px -5px rgba(37, 99, 235, 0.4);\n  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);\n  display: flex;\n  align-items: center;\n  gap: 12px;\n  cursor: pointer;\n}`
);


// Enhance buttons - prev
content = content.replace(
    /\.nd-btn-prev \{([^}]+)\}/,
    `.nd-btn-prev {\n  padding: 15px 32px;\n  border-radius: 16px;\n  font-weight: 700;\n  background: white;\n  color: #475569;\n  border: 2px solid #e2e8f0;\n  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);\n  display: flex;\n  align-items: center;\n  gap: 12px;\n  cursor: pointer;\n}`
);

fs.writeFileSync(file, content);
console.log('Applied highly polished premium CSS styles to noc-portal.');
