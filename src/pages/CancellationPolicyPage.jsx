import "./CancellationPolicyPage.css";

const CancellationPolicyPage = () => {
  return (
    <main className="cancellation-page">
      <div className="cancellation-container">
        <div className="cancellation-header">
          <h1 className="cancellation-title">Cancellation Policy</h1>
          <p className="cancellation-updated">Last Updated: January 16, 2026</p>
        </div>

        <div className="cancellation-content">
          <section className="cancellation-section">
            <h2 className="cancellation-section-title">Introduction</h2>
            <p className="cancellation-text">
              At I GO LANKA TOURS, we understand that travel plans can change. This Cancellation
              Policy outlines the terms and conditions for canceling your booking and the refund
              process. We encourage you to review this policy carefully before making a reservation.
            </p>
          </section>

          <section className="cancellation-section">
            <h2 className="cancellation-section-title">Cancellation by Customer</h2>
            <p className="cancellation-text">
              If you need to cancel your booking, please notify us in writing via email at
              bookings@igolankatours.com. Cancellations are effective from the date we receive
              your written notice.
            </p>
            <p className="cancellation-text">
              The following cancellation charges apply based on the number of days before your
              scheduled departure date:
            </p>
            
            <div className="cancellation-table">
              <div className="cancellation-table-row cancellation-table-header">
                <div className="cancellation-table-cell">Days Before Departure</div>
                <div className="cancellation-table-cell">Cancellation Fee</div>
              </div>
              <div className="cancellation-table-row">
                <div className="cancellation-table-cell">More than 60 days</div>
                <div className="cancellation-table-cell">10% of total booking cost</div>
              </div>
              <div className="cancellation-table-row">
                <div className="cancellation-table-cell">45 to 60 days</div>
                <div className="cancellation-table-cell">25% of total booking cost</div>
              </div>
              <div className="cancellation-table-row">
                <div className="cancellation-table-cell">30 to 44 days</div>
                <div className="cancellation-table-cell">50% of total booking cost</div>
              </div>
              <div className="cancellation-table-row">
                <div className="cancellation-table-cell">15 to 29 days</div>
                <div className="cancellation-table-cell">75% of total booking cost</div>
              </div>
              <div className="cancellation-table-row">
                <div className="cancellation-table-cell">Less than 15 days</div>
                <div className="cancellation-table-cell">100% of total booking cost (No refund)</div>
              </div>
            </div>
          </section>

          <section className="cancellation-section">
            <h2 className="cancellation-section-title">Refund Process</h2>
            <p className="cancellation-text">
              Refunds will be processed according to the following guidelines:
            </p>
            <ul className="cancellation-list">
              <li>Eligible refunds will be processed within 14 business days of cancellation approval</li>
              <li>Refunds will be credited to the original payment method used for booking</li>
              <li>Payment processing fees are non-refundable</li>
              <li>Bank charges or currency conversion fees are the responsibility of the customer</li>
              <li>Partial refunds for unused services during a tour are not provided</li>
            </ul>
          </section>

          <section className="cancellation-section">
            <h2 className="cancellation-section-title">Non-Refundable Items</h2>
            <p className="cancellation-text">
              The following items are non-refundable regardless of the cancellation timing:
            </p>
            <ul className="cancellation-list">
              <li>Visa application fees and processing charges</li>
              <li>Travel insurance premiums</li>
              <li>Flight tickets purchased on your behalf (subject to airline policies)</li>
              <li>Special permit fees (e.g., wildlife park entries, archaeological site permits)</li>
              <li>Service charges and transaction fees</li>
            </ul>
          </section>

          <section className="cancellation-section">
            <h2 className="cancellation-section-title">Cancellation by I GO LANKA TOURS</h2>
            <p className="cancellation-text">
              We reserve the right to cancel a tour in the following circumstances:
            </p>
            <ul className="cancellation-list">
              <li>Minimum participant requirements are not met (full refund provided)</li>
              <li>Safety concerns due to weather, political instability, or natural disasters</li>
              <li>Force majeure events beyond our control</li>
            </ul>
            <p className="cancellation-text">
              If we cancel your tour, you will receive:
            </p>
            <ul className="cancellation-list">
              <li>A full refund of all payments made, or</li>
              <li>The option to reschedule to an alternative date with no additional fees, or</li>
              <li>Credit toward a future booking of equal or greater value</li>
            </ul>
          </section>

          <section className="cancellation-section">
            <h2 className="cancellation-section-title">Changes vs. Cancellations</h2>
            <p className="cancellation-text">
              If you wish to modify your booking rather than cancel:
            </p>
            <ul className="cancellation-list">
              <li>Changes requested more than 30 days before departure incur a $50 administration fee plus any difference in package cost</li>
              <li>Changes within 30 days of departure are treated as cancellations and subject to the cancellation policy above</li>
              <li>Subject to availability of alternative dates and services</li>
            </ul>
          </section>

          <section className="cancellation-section">
            <h2 className="cancellation-section-title">Travel Insurance Recommendation</h2>
            <p className="cancellation-text">
              We strongly recommend purchasing comprehensive travel insurance that covers trip
              cancellations, medical emergencies, and unforeseen circumstances. Travel insurance
              can protect you from financial loss due to unexpected cancellations and provide
              peace of mind during your travels.
            </p>
          </section>

          <section className="cancellation-section">
            <h2 className="cancellation-section-title">Examples</h2>
            
            <div className="cancellation-example">
              <h4 className="cancellation-example-title">Example 1: Early Cancellation</h4>
              <p className="cancellation-text">
                You book a 7-day tour costing $1,500 and cancel 70 days before departure.
              </p>
              <p className="cancellation-text">
                <strong>Cancellation fee:</strong> 10% of $1,500 = $150<br />
                <strong>Refund amount:</strong> $1,350
              </p>
            </div>

            <div className="cancellation-example">
              <h4 className="cancellation-example-title">Example 2: Late Cancellation</h4>
              <p className="cancellation-text">
                You book a 5-day tour costing $900 and cancel 20 days before departure.
              </p>
              <p className="cancellation-text">
                <strong>Cancellation fee:</strong> 75% of $900 = $675<br />
                <strong>Refund amount:</strong> $225
              </p>
            </div>

            <div className="cancellation-example">
              <h4 className="cancellation-example-title">Example 3: Last-Minute Cancellation</h4>
              <p className="cancellation-text">
                You book a 10-day tour costing $2,000 and cancel 10 days before departure.
              </p>
              <p className="cancellation-text">
                <strong>Cancellation fee:</strong> 100% of $2,000 = $2,000<br />
                <strong>Refund amount:</strong> $0 (No refund)
              </p>
            </div>
          </section>

          <section className="cancellation-section">
            <h2 className="cancellation-section-title">Contact Us</h2>
            <p className="cancellation-text">
              For cancellation requests or questions about this policy, please contact:
            </p>
            <div className="cancellation-contact-box">
              <p><strong>I GO LANKA TOURS</strong></p>
              <p>123 Galle Road, Colombo 03, Sri Lanka</p>
              <p>Email: bookings@igolankatours.com</p>
              <p>Phone: +94 77 123 4567</p>
              <p>WhatsApp: +94 77 123 4567 (Available 24/7)</p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};

export default CancellationPolicyPage;
