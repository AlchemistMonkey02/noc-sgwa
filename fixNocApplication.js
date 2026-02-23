const fs = require('fs');
const file = 'c:/Users/DELL/Desktop/rgwacma/SGWA/src/modules/noc/NOCApplication.jsx';
let content = fs.readFileSync(file, 'utf8');
let lines = content.split(/\r?\n/);

const startIdx = lines.findIndex(l => l.includes('Step 5: Conditional - Meter Details OR Documents Checklist'));
const newStep5Idx = lines.findIndex(l => l.includes('Step 5: Meter Details (If Applicable)'));
const navIdx = lines.findIndex(l => l.includes('Navigation Buttons') && l.includes('{/*'));

if (startIdx !== -1 && newStep5Idx !== -1 && navIdx !== -1) {
    // Keep lines before the old Step 5
    const topPart = lines.slice(0, startIdx);

    // Get the new premium form steps
    let premiumSteps = lines.slice(newStep5Idx, navIdx);
    // Unindent premium steps (remove up to 52 leading spaces)
    premiumSteps = premiumSteps.map(line => line.replace(/^ {50,90}/, '                            '));

    // We can also extract the FormNavigation and Success Modal from the current file!
    const endFooterIdx = lines.findIndex((l, idx) => idx > navIdx && l.includes('export default NOCApplication;'));

    if (endFooterIdx !== -1) {
        let footerPart = lines.slice(navIdx, endFooterIdx + 1);
        // Correct the unindentation for footer part as well
        footerPart = footerPart.map(line => line.replace(/^ {50,90}/, '                            '));

        // Also fix the closing tags before the Navigation Buttons.
        // In premiumSteps, the last step closes with `    )}`. We need to make sure the structure is balanced.
        // Wait, the new step 9/10 closes perfectly.

        // Let's create a custom footer that is GUARANTEED to be syntactically correct and balanced.
        const customFooter = [
            '                            {/* Navigation Buttons */}',
            '                            {!successData && (',
            '                                <FormNavigation',
            '                                    currentStep={currentStep}',
            '                                    totalSteps={dynamicFormSteps.length}',
            '                                    onPrevious={handlePrevious}',
            '                                    onNext={handleNext}',
            '                                    onSubmit={handleSubmit}',
            '                                    isLastStep={currentStep === dynamicFormSteps.length}',
            '                                />',
            '                            )}',
            '                        </div>',
            '                    )}',
            '',
            '                    {/* Success Modal */}',
            '                    {successData && (',
            '                        <div className="nd-modal-overlay">',
            '                            <div className="nd-modal-content nd-animate nd-visible">',
            '                                <div style={{ width: "80px", height: "80px", background: "#10b981", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "40px", margin: "0 auto 20px auto" }}>✓</div>',
            '                                <h2 style={{ textAlign: "center", color: "#10b981" }}>Application Submitted!</h2>',
            '                                <p style={{ textAlign: "center", opacity: 0.7, marginBottom: "30px" }}>Your application has been received and is under review.</p>',
            '',
            '                                <div className="nd-summary-card" style={{ background: "rgba(255,255,255,0.05)", padding: "20px", borderRadius: "15px", marginBottom: "30px" }}>',
            '                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>',
            '                                        <span>Application ID:</span>',
            '                                        <strong>{successData.applicationNumber || "SGWA-2024-001"}</strong>',
            '                                    </div>',
            '                                    <div style={{ display: "flex", justifyContent: "space-between" }}>',
            '                                        <span>Status:</span>',
            '                                        <span style={{ color: "#10b981", fontWeight: "bold" }}>{successData.status || "Received"}</span>',
            '                                    </div>',
            '                                </div>',
            '',
            '                                <button',
            '                                    className="nd-btn-primary"',
            '                                    style={{ width: "100%" }}',
            '                                    onClick={() => navigate("/noc/dashboard")}',
            '                                >',
            '                                    Return to Dashboard',
            '                                </button>',
            '                            </div>',
            '                        </div>',
            '                    )}',
            '                </div>',
            '            </div>',
            '            <NOCFooter />',
            '        </div>',
            '    );',
            '};',
            '',
            'export default NOCApplication;'
        ];

        const newFileLines = [...topPart, ...premiumSteps, ...customFooter];
        fs.writeFileSync(file, newFileLines.join('\\n'));
        console.log('File successfully refactored. Lines updated.');
    } else {
        console.log('Could not find export default.');
    }
} else {
    console.log('Indices not found:', { startIdx, newStep5Idx, navIdx });
}
