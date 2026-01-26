import "./TermsPage.css";

const TermsPage = () => {
  return (
    <main className="terms-page">
      <div className="terms-container">
        <div className="terms-header">
          <h1 className="terms-title">Terms & Conditions</h1>
          <p className="terms-updated">Last Updated: January 16, 2026</p>
        </div>

        <div className="terms-content">
          <section className="terms-section">
            <h2 className="terms-section-title">Introduction</h2>
            <p className="terms-text">
              Welcome to I GO LANKA TOURS. These Terms and Conditions govern your use of our
              website and travel services. By accessing our website or booking our services,
              you agree to be bound by these terms. Please read them carefully before making
              any reservations.
            </p>
          </section>

          <section className="terms-section">
            <h2 className="terms-section-title">Booking Conditions</h2>
            <p className="terms-text">
              When you make a booking with I GO LANKA TOURS:
            </p>
            <ul className="terms-list">
              <li>You must be at least 18 years of age or have parental/guardian consent</li>
              <li>All information provided must be accurate and complete</li>
              <li>A booking is confirmed only upon receipt of payment and written confirmation from us</li>
              <li>Package prices are subject to availability and may change without prior notice</li>
              <li>Special requests (dietary requirements, room preferences) are subject to availability and cannot be guaranteed</li>
              <li>You are responsible for ensuring all travel documents (passport, visas) are valid</li>
            </ul>
          </section>

          <section className="terms-section">
            <h2 className="terms-section-title">Payment Terms</h2>
            <p className="terms-text">
              Payment conditions for our travel services:
            </p>
            <ul className="terms-list">
              <li>A deposit of 30% of the total package cost is required at the time of booking</li>
              <li>Full payment must be received at least 30 days prior to the departure date</li>
              <li>Late payment may result in cancellation of your booking</li>
              <li>We accept credit cards, debit cards, and bank transfers</li>
              <li>All payments are processed in US Dollars (USD) unless otherwise specified</li>
              <li>Payment processing fees may apply depending on the payment method</li>
            </ul>
          </section>

          <section className="terms-section">
            <h2 className="terms-section-title">Travel Responsibilities</h2>
            <p className="terms-text">
              As a traveler booking with I GO LANKA TOURS, you are responsible for:
            </p>
            <ul className="terms-list">
              <li>Ensuring your passport is valid for at least 6 months from your travel date</li>
              <li>Obtaining necessary visas and travel permits for Sri Lanka</li>
              <li>Purchasing adequate travel insurance covering medical expenses, trip cancellation, and personal belongings</li>
              <li>Arriving at meeting points on time as specified in your itinerary</li>
              <li>Following the instructions and guidance of your tour guide</li>
              <li>Respecting local customs, laws, and regulations</li>
              <li>Ensuring you are medically fit to travel and disclosing any health conditions that may affect your trip</li>
            </ul>
          </section>

          <section className="terms-section">
            <h2 className="terms-section-title">Changes and Modifications</h2>
            <p className="terms-text">
              I GO LANKA TOURS reserves the right to:
            </p>
            <ul className="terms-list">
              <li>Modify itineraries due to weather conditions, safety concerns, or unforeseen circumstances</li>
              <li>Substitute hotels or services of similar standard if original arrangements become unavailable</li>
              <li>Cancel tours that do not meet minimum participant requirements with a full refund</li>
            </ul>
            <p className="terms-text">
              If you wish to modify your booking:
            </p>
            <ul className="terms-list">
              <li>Changes requested more than 30 days before departure may incur a $50 administration fee</li>
              <li>Changes within 30 days of departure are subject to availability and may incur additional charges</li>
              <li>Name changes are not permitted once a booking is confirmed</li>
            </ul>
          </section>

          <section className="terms-section">
            <h2 className="terms-section-title">Liability Limitations</h2>
            <p className="terms-text">
              I GO LANKA TOURS operates as a tour operator and booking agent. We are not liable for:
            </p>
            <ul className="terms-list">
              <li>Delays, cancellations, or changes by airlines, hotels, or other service providers</li>
              <li>Loss, damage, or theft of personal belongings during your trip</li>
              <li>Injury, illness, or accidents occurring during tours or activities</li>
              <li>Force majeure events including natural disasters, political unrest, pandemics, or acts of terrorism</li>
              <li>Additional costs incurred due to delays or itinerary changes beyond our control</li>
            </ul>
            <p className="terms-text">
              Our liability is limited to the cost of the services we provide. We strongly recommend
              purchasing comprehensive travel insurance to cover unforeseen circumstances.
            </p>
          </section>

          <section className="terms-section">
            <h2 className="terms-section-title">Conduct and Behavior</h2>
            <p className="terms-text">
              Travelers are expected to:
            </p>
            <ul className="terms-list">
              <li>Behave respectfully towards guides, drivers, fellow travelers, and local communities</li>
              <li>Refrain from activities that may endanger themselves or others</li>
              <li>Comply with local laws and customs at all times</li>
            </ul>
            <p className="terms-text">
              We reserve the right to remove any traveler from a tour if their behavior is deemed
              disruptive, dangerous, or inappropriate. No refund will be provided in such cases.
            </p>
          </section>

          <section className="terms-section">
            <h2 className="terms-section-title">Complaints and Disputes</h2>
            <p className="terms-text">
              If you have any complaints during your tour, please notify your guide or contact
              our office immediately so we can resolve the issue promptly. Written complaints
              must be submitted within 30 days of trip completion. We aim to respond to all
              complaints within 14 business days.
            </p>
          </section>

          <section className="terms-section">
            <h2 className="terms-section-title">Contact Information</h2>
            <p className="terms-text">
              For questions regarding these Terms and Conditions, please contact:
            </p>
            <div className="terms-contact-box">
              <p><strong>I GO LANKA TOURS</strong></p>
              <p>123 Galle Road, Colombo 03, Sri Lanka</p>
              <p>Email: info@igolankatours.com</p>
              <p>Phone: +94 77 123 4567</p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};

export default TermsPage;
