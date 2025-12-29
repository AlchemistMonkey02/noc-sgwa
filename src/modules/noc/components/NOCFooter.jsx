import React from 'react';
import '../styles/noc-portal.css';

const NOCFooter = () => {
    return (
        <footer className="noc-footer">
            <div className="noc-container">
                <div className="noc-footer-content">
                    <div className="noc-footer-section">
                        <h3>About CGWA</h3>
                        <ul>
                            <li><a href="#">About Us</a></li>
                            <li><a href="#">Organization Structure</a></li>
                            <li><a href="#">Guidelines</a></li>
                            <li><a href="#">Notifications</a></li>
                        </ul>
                    </div>

                    <div className="noc-footer-section">
                        <h3>Quick Links</h3>
                        <ul>
                            <li><a href="#">Application Status</a></li>
                            <li><a href="#">Download Forms</a></li>
                            <li><a href="#">Payment Gateway</a></li>
                            <li><a href="#">Grievance Redressal</a></li>
                        </ul>
                    </div>

                    <div className="noc-footer-section">
                        <h3>Contact Information</h3>
                        <p>Central Ground Water Authority</p>
                        <p>Ministry of Jal Shakti</p>
                        <p>CSMRS Campus, Olof Palme Marg</p>
                        <p>Hauz Khas, New Delhi-110016</p>
                        <p style={{ marginTop: '10px' }}>
                            <strong>Phone:</strong> 011-23383824<br />
                            <strong>Mobile:</strong> 9868232311<br />
                            <strong>Email:</strong> bhuneersupport-cgwa@gov.in
                        </p>
                    </div>
                </div>

                <div className="noc-footer-bottom">
                    <p>© 2024 Central Ground Water Authority. All Rights Reserved.</p>
                    <p>Designed & Developed By National Informatics Centre (NIC)</p>
                </div>
            </div>
        </footer>
    );
};

export default NOCFooter;
