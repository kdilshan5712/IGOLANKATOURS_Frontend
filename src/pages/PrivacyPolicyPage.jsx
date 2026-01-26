import "./PrivacyPolicyPage.css";

const PrivacyPolicyPage = () => {
  return (
    <main className="privacy-page">
      <div className="privacy-container">
        <div className="privacy-header">
          <h1 className="privacy-title">Privacy Policy</h1>
          <p className="privacy-updated">Last Updated: January 16, 2026</p>
        </div>

        <div className="privacy-content">
          <section className="privacy-section">
            <h2 className="privacy-section-title">Introduction</h2>
            <p className="privacy-text">
              Welcome to I GO LANKA TOURS. We are committed to protecting your personal
              information and your right to privacy. This Privacy Policy explains how we
              collect, use, disclose, and safeguard your information when you visit our
              website or use our travel services.
            </p>
            <p className="privacy-text">
              By using our services, you consent to the data practices described in this policy.
              If you do not agree with the terms of this Privacy Policy, please do not access
              our website or use our services.
            </p>
          </section>

          <section className="privacy-section">
            <h2 className="privacy-section-title">Information We Collect</h2>
            <p className="privacy-text">
              We collect personal information that you voluntarily provide to us when you:
            </p>
            <ul className="privacy-list">
              <li>Register for an account on our website</li>
              <li>Make a booking or reservation for tours and travel services</li>
              <li>Subscribe to our newsletter or marketing communications</li>
              <li>Contact us with inquiries or support requests</li>
              <li>Submit reviews or feedback about our services</li>
            </ul>
            <p className="privacy-text">
              The personal information we collect may include:
            </p>
            <ul className="privacy-list">
              <li>Name and contact information (email address, phone number, mailing address)</li>
              <li>Passport and travel document details</li>
              <li>Payment information (credit card details, billing address)</li>
              <li>Travel preferences and special requirements</li>
              <li>Emergency contact information</li>
            </ul>
          </section>

          <section className="privacy-section">
            <h2 className="privacy-section-title">How We Use Your Information</h2>
            <p className="privacy-text">
              We use the information we collect to:
            </p>
            <ul className="privacy-list">
              <li>Process your bookings and manage your travel arrangements</li>
              <li>Communicate with you about your reservations and travel itinerary</li>
              <li>Provide customer support and respond to your inquiries</li>
              <li>Send you promotional offers, newsletters, and travel updates (with your consent)</li>
              <li>Improve our website, services, and customer experience</li>
              <li>Comply with legal obligations and protect against fraudulent activities</li>
              <li>Facilitate payment processing and transaction verification</li>
            </ul>
          </section>

          <section className="privacy-section">
            <h2 className="privacy-section-title">Data Protection and Security</h2>
            <p className="privacy-text">
              We implement appropriate technical and organizational security measures to protect
              your personal information against unauthorized access, alteration, disclosure, or
              destruction. These measures include:
            </p>
            <ul className="privacy-list">
              <li>Secure SSL encryption for data transmission</li>
              <li>Restricted access to personal information by authorized personnel only</li>
              <li>Regular security assessments and updates to our systems</li>
              <li>Secure payment processing through trusted payment gateways</li>
            </ul>
            <p className="privacy-text">
              While we strive to protect your personal information, no method of transmission
              over the internet or electronic storage is 100% secure. We cannot guarantee
              absolute security but are committed to protecting your data to the best of our ability.
            </p>
          </section>

          <section className="privacy-section">
            <h2 className="privacy-section-title">Sharing Your Information</h2>
            <p className="privacy-text">
              We may share your personal information with:
            </p>
            <ul className="privacy-list">
              <li>Travel service providers (hotels, transport companies, tour guides) necessary to fulfill your bookings</li>
              <li>Payment processors to complete financial transactions</li>
              <li>Legal authorities when required by law or to protect our rights</li>
              <li>Business partners with your explicit consent for marketing purposes</li>
            </ul>
            <p className="privacy-text">
              We do not sell, rent, or trade your personal information to third parties for their
              marketing purposes without your explicit consent.
            </p>
          </section>

          <section className="privacy-section">
            <h2 className="privacy-section-title">Your Rights</h2>
            <p className="privacy-text">
              You have the right to:
            </p>
            <ul className="privacy-list">
              <li>Access and receive a copy of your personal information</li>
              <li>Request correction of inaccurate or incomplete data</li>
              <li>Request deletion of your personal information</li>
              <li>Object to or restrict the processing of your data</li>
              <li>Withdraw consent for marketing communications at any time</li>
            </ul>
          </section>

          <section className="privacy-section">
            <h2 className="privacy-section-title">Contact Us</h2>
            <p className="privacy-text">
              If you have any questions, concerns, or requests regarding this Privacy Policy
              or the handling of your personal information, please contact us at:
            </p>
            <div className="privacy-contact-box">
              <p><strong>I GO LANKA TOURS</strong></p>
              <p>123 Galle Road, Colombo 03, Sri Lanka</p>
              <p>Email: privacy@igolankatours.com</p>
              <p>Phone: +94 77 123 4567</p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};

export default PrivacyPolicyPage;
