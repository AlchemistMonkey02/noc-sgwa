# This script adds district/block dropdowns and block category display to Step 2
import re

# Read the file
with open(r'c:\Users\DELL\Desktop\SGWA\src\modules\noc\NOCApplication.jsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find the line with "Assessment Unit" label (line 624)
# We need to replace from line 623 to 661 (the two-col section with Assessment Unit and Relevant Blocks)

new_content = """                                    <div className="noc-form-group">
                                        <label className="noc-form-label required">District</label>
                                        <select
                                            name="district"
                                            className={`noc-form-control ${errors.district ? 'error' : ''}`}
                                            value={formData.district || ''}
                                            onChange={handleChange}
                                        >
                                            <option value="">Select District</option>
                                            {formData.state && getDistricts(formData.state).map(district => (
                                                <option key={district} value={district}>{district}</option>
                                            ))}
                                        </select>
                                        {errors.district && <span className="noc-form-error">{errors.district}</span>}
                                    </div>
                                </div>

                                <div className="noc-form-row two-col">
                                    <div className="noc-form-group">
                                        <label className="noc-form-label required">Block</label>
                                        <select
                                            name="block"
                                            className={`noc-form-control ${errors.block ? 'error' : ''}`}
                                            value={formData.block || ''}
                                            onChange={handleChange}
                                            disabled={!formData.district}
                                        >
                                            <option value="">Select Block</option>
                                            {availableBlocks.map(block => (
                                                <option key={block} value={block}>{block}</option>
                                            ))}
                                        </select>
                                        {errors.block && <span className="noc-form-error">{errors.block}</span>}
                                        {!formData.district && (
                                            <span className="noc-form-help">Please select a district first</span>
                                        )}
                                    </div>

                                    <div className="noc-form-group">
                                        <label className="noc-form-label">Tehsil</label>
                                        <input
                                            type="text"
                                            name="tehsil"
                                            className="noc-form-control"
                                            value={formData.tehsil}
                                            onChange={handleChange}
                                            placeholder="Enter tehsil"
                                        />
                                    </div>
                                </div>

                                {/* Block Category Display */}
                                {blockCategory && (
                                    <div className="noc-alert" style={{
                                        marginBottom: '20px',
                                        background: blockCategory === 'Safe' ? 'linear-gradient(135deg, #d4edda 0%, #c3f0ca 100%)' :
                                                   blockCategory === 'Semi-Critical' ? 'linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%)' :
                                                   blockCategory === 'Critical' ? 'linear-gradient(135deg, #f8d7da 0%, #fab1a0 100%)' :
                                                   'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
                                        border: `2px solid ${blockCategory === 'Safe' ? '#28a745' :
                                                             blockCategory === 'Semi-Critical' ? '#ffc107' :
                                                             blockCategory === 'Critical' ? '#dc3545' :
                                                             '#a94442'}`,
                                        color: '#000'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <span style={{ fontSize: '1.5rem' }}>
                                                {blockCategory === 'Safe' ? '✅' :
                                                 blockCategory === 'Semi-Critical' ? '⚠️' :
                                                 blockCategory === 'Critical' ? '🚨' : '❌'}
                                            </span>
                                            <div>
                                                <strong>Block Category: {blockCategory}</strong>
                                                <p style={{ margin: '5px 0 0 0', fontSize: '0.9rem' }}>
                                                    {blockCategory === 'Safe' && 'This block has sufficient groundwater resources. Standard NOC procedures apply.'}
                                                    {blockCategory === 'Semi-Critical' && 'This block has limited groundwater availability. Enhanced monitoring and water conservation measures may be required.'}
                                                    {blockCategory === 'Critical' && 'This block faces groundwater stress. Strict monitoring, mandatory rainwater harvesting, and conservation measures are required.'}
                                                    {blockCategory === 'Over-Exploited' && 'This block is over-exploited. Additional scrutiny, mandatory piezometer installation, and stringent water conservation measures are MANDATORY. New NOC applications may face restrictions.'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
"""

# Replace lines 623-660 (the Assessment Unit and Relevant Blocks sections)
# Lines are 0-indexed in the list, so 623 is index 622  
new_lines = lines[:622] + [new_content + "\r\n"] + lines[661:]

# Write back
with open(r'c:\Users\DELL\Desktop\SGWA\src\modules\noc\NOCApplication.jsx', 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print("Successfully added district/block dropdowns and block category display!")
