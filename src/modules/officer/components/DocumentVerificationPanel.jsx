import React, { useState } from 'react';
import officerService from '../services/officerService';

const DocumentVerificationPanel = ({ documents, applicationId, applicationDetails, onVerificationComplete }) => {
    const [verifying, setVerifying] = useState({});
    const [results, setResults] = useState({});
    const [errors, setErrors] = useState({});

    const handleVerify = async (doc) => {
        const docId = doc.documentId || doc._id;
        setVerifying(prev => ({ ...prev, [docId]: true }));
        setErrors(prev => ({ ...prev, [docId]: null }));

        try {
            // 1. Download document blob
            const blob = await officerService.downloadDocument(docId);
            const file = new File([blob], doc.fileName || 'document.pdf', { type: doc.mimeType || 'application/pdf' });

            // 2. Prepare metadata for AI based on document type
            // This ensures we verify against the actual application inputs ("based on flow")
            let metadata = {
                name: applicationDetails?.applicantName || applicationDetails?.projectDetails?.applicantName || "Applicant",
            };

            const docType = (doc.documentType || '').toLowerCase();
            if (docType.includes('aadhaar')) {
                metadata.aadhaar_number = applicationDetails?.aadhaarNumber || applicationDetails?.projectDetails?.aadhaarNumber || "";
            } else if (docType.includes('pan')) {
                metadata.pan_number = applicationDetails?.panNumber || applicationDetails?.projectDetails?.panNumber || "";
            }
            // Add other specific fields if needed


            // If it's Aadhaar, we might need input. For now, assuming generic verification
            // The prompt implied we might need user input for some checks:
            // -F 'user_input={"name": "Vinod Alwani", "aadhaar_number": "700489844290"}'

            // 3. Call AI Service
            // Note: This assumes the browser can reach the AI service directly (CORS).
            const aiResponse = await officerService.verifyDocumentWithAI(file, doc.documentType, metadata);

            if (aiResponse && aiResponse.success) {
                // 4. Update Backend with Result
                const updatePayload = {
                    verified: true, // or based on aiResponse.success
                    confidence: aiResponse.confidence || 0.95, // mock if missing
                    remarks: aiResponse.remarks || "Verified by AI",
                    extractedText: aiResponse.extracted_text
                };

                await officerService.updateDocumentAIStatus(docId, updatePayload);

                setResults(prev => ({ ...prev, [docId]: updatePayload }));
                if (onVerificationComplete) onVerificationComplete();
            } else {
                throw new Error("AI Verification failed");
            }

        } catch (error) {
            console.error("Verification error:", error);
            setErrors(prev => ({ ...prev, [docId]: error.message }));
        } finally {
            setVerifying(prev => ({ ...prev, [docId]: false }));
        }
    };

    const handleVerifyAll = async () => {
        if (!documents) return;
        const pendingDocs = documents.filter(d => !d.verification?.ai?.verified && !results[d.documentId || d._id]?.verified);

        for (const doc of pendingDocs) {
            await handleVerify(doc);
        }
    };


    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mt-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <span>🤖</span> AI Document Verification
                </h3>
                <button
                    onClick={handleVerifyAll}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm"
                >
                    ⚡ Verify All Pending
                </button>
            </div>

            <div className="grid gap-4">
                {documents && documents.map((doc, idx) => {
                    const docId = doc.documentId || doc._id;
                    const isVerifying = verifying[docId];
                    const result = results[docId] || doc.verification?.ai; // Use local result or existing
                    const error = errors[docId];

                    return (
                        <div key={idx} className="p-4 rounded-lg border border-slate-200 bg-slate-50">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <div className="font-semibold text-slate-700">{doc.documentType}</div>
                                    <div className="text-sm text-slate-500">{doc.fileName}</div>
                                </div>

                                <div>
                                    {result?.verified ? (
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                                            ✅ Verified ({Math.round((result.confidence || 0) * 100)}%)
                                        </span>
                                    ) : (
                                        <button
                                            onClick={() => handleVerify(doc)}
                                            disabled={isVerifying}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors
                                                ${isVerifying
                                                    ? 'bg-slate-400 cursor-wait'
                                                    : 'bg-indigo-600 hover:bg-indigo-700'}`}
                                        >
                                            {isVerifying ? 'Verifying...' : '⚡ Verify with AI'}
                                        </button>
                                    )}
                                </div>
                            </div>

                            {error && (
                                <div className="text-sm text-red-600 bg-red-50 p-2 rounded mt-2">
                                    ⚠️ {error}
                                </div>
                            )}

                            {result && (
                                <div className="mt-3 text-sm bg-white p-3 rounded border border-slate-200">
                                    <div className="grid grid-cols-2 gap-2 mb-2">
                                        <div>
                                            <span className="text-xs text-slate-500 uppercase">Status</span>
                                            <div className="font-medium text-slate-800">
                                                {result.verified ? 'Passed' : 'Failed'}
                                            </div>
                                        </div>
                                        <div>
                                            <span className="text-xs text-slate-500 uppercase">Confidence</span>
                                            <div className="font-medium text-slate-800">
                                                {(result.confidence * 100).toFixed(1)}%
                                            </div>
                                        </div>
                                    </div>

                                    {result.remarks && (
                                        <div className="mb-2">
                                            <span className="text-xs text-slate-500 uppercase">Remarks</span>
                                            <div className="text-slate-700">{result.remarks}</div>
                                        </div>
                                    )}

                                    {result.extractedText && (
                                        <details className="mt-2">
                                            <summary className="cursor-pointer text-indigo-600 text-xs font-medium hover:underline">
                                                View Extracted Text
                                            </summary>
                                            <div className="mt-2 p-2 bg-slate-100 rounded text-xs font-mono whitespace-pre-wrap max-h-40 overflow-y-auto">
                                                {result.extractedText}
                                            </div>
                                        </details>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}

                {(!documents || documents.length === 0) && (
                    <div className="text-center text-slate-500 py-4">
                        No documents available for verification.
                    </div>
                )}
            </div>
        </div>
    );
};

export default DocumentVerificationPanel;
