# Fix JSX structure error
with open(r'c:\Users\DELL\Desktop\SGWA\src\modules\noc\NOCApplication.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Find and replace the problematic section
old_text = """                            </div>
                                    <div className="noc-form-group">
                                        <label className="noc-form-label required">District</label>"""

new_text = """                            </div>

                        {/* Step 2: Project & Location Details */}
                        {currentStep === 2 && (
                            <div>
                                <h3 className="noc-section-title">Project & Location Details</h3>

                                <div className="noc-form-group">
                                    <label className="noc-form-label required">Project Name</label>
                                    <input
                                        type="text"
                                        name="projectName"
                                        className={`noc-form-control ${errors.projectName ? 'error' : ''}`}
                                        value={formData.projectName}
                                        onChange={handleChange}
                                        placeholder="Enter project name"
                                    />
                                    {errors.projectName && <span className="noc-form-error">{errors.projectName}</span>}
                                </div>

                                <div className="noc-form-row two-col">
                                    <div className="noc-form-group">
                                        <label className="noc-form-label required">State</label>
                                        <select
                                            name="state"
                                            className={`noc-form-control ${errors.state ? 'error' : ''}`}
                                            value={formData.state}
                                            onChange={handleChange}
                                        >
                                            <option value="">Select State</option>
                                            {states.map(state => (
                                                <option key={state} value={state}>{state}</option>
                                            ))}
                                        </select>
                                        {errors.state && <span className="noc-form-error">{errors.state}</span>}
                                    </div>

                                    <div className="noc-form-group">
                                        <label className="noc-form-label required">District</label>"""

# Only replace if the old text is found
if old_text in content:
    content = content.replace(old_text, new_text, 1)
    
    with open(r'c:\Users\DELL\Desktop\SGWA\src\modules\noc\NOCApplication.jsx', 'w', encoding='utf-8') as f:
        f.write(content)
    
    print("Fixed JSX structure!")
else:
    print("Pattern not found. Let me check the file...")
    # Print the section around line 622-623 for debugging
    lines = content.split('\n')
    for i in range(620, 630):
        if i < len(lines):
            print(f"{i}: {lines[i][:100]}")
