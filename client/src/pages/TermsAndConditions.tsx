import React from 'react';

const TermsAndConditions: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Terms and Conditions</h1>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">1. Introduction</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Welcome to Carzi! These Terms and Conditions ("Terms") govern your use of our car rental platform, including our website and mobile applications (collectively, the "Service"). By accessing or using the Service, you agree to be bound by these Terms and our Privacy Policy. If you do not agree to these Terms, please do not use our Service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">2. Eligibility</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            You must be at least 18 years old and possess a valid driver's license to rent a car through Carzi. You also agree to provide accurate and complete information during the registration and booking process.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">3. Car Rental Process</h2>
          <ul className="list-disc list-inside text-gray-700 leading-relaxed mb-4">
            <li><strong>Booking:</strong> All car bookings are subject to availability and confirmation by the car owner.</li>
            <li><strong>Payment:</strong> Payment terms will be clearly outlined during the booking process. Carzi may offer various payment methods, including online payments and pay-later options.</li>
            <li><strong>Cancellation:</strong> Cancellation policies vary and will be specified at the time of booking.</li>
            <li><strong>Vehicle Condition:</strong> You are responsible for returning the vehicle in the same condition as received, reasonable wear and tear excepted.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">4. Fuel Policy</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            All vehicles are provided with a full tank of fuel at the time of rental. Customers are expected to return the vehicle with a full tank. Failure to do so will result in a refueling charge plus the cost of the missing fuel.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">5. Insurance</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            All cars listed on Carzi are required to have valid third-party insurance. Comprehensive insurance options may be available at an additional cost, which will be clearly communicated during the booking process. In case of an accident, customers must immediately notify Carzi and the car owner, and follow all procedures outlined by the insurance provider.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">6. Vehicle Condition and Return</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Upon receiving the vehicle, customers must inspect it for any existing damages and report them to the car owner immediately. The vehicle must be returned to the agreed-upon location at the specified time. Late returns may incur additional charges. Any new damages to the vehicle will be assessed and charged to the customer.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">7. Required Documents for Physical Rental</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            When picking up the rented car at the designated location, customers are required to present the following original documents:
          </p>
          <ul className="list-disc list-inside text-gray-700 leading-relaxed mb-4">
            <li><strong>Valid Driving License:</strong> An original, valid driving license held for at least one year. International driving permits are required for non-Indian nationals.</li>
            <li><strong>Aadhaar Card / Passport:</strong> For Indian nationals, an original Aadhaar Card. For foreign nationals, an original Passport.</li>
            <li><strong>Booking Confirmation:</strong> A printout or digital copy of the Carzi booking confirmation.</li>
            <li><strong>Payment Method:</strong> The credit/debit card used for the booking, if applicable, for verification purposes.</li>
          </ul>
          <p className="text-gray-700 leading-relaxed mb-4">
            Failure to present the required documents may result in the cancellation of the booking without a refund.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">8. Car Owner Responsibilities</h2>
          <ul className="list-disc list-inside text-gray-700 leading-relaxed mb-4">
            <li><strong>Vehicle Maintenance:</strong> Car owners are responsible for ensuring their vehicles are well-maintained, safe, and legally compliant.</li>
            <li><strong>Insurance:</strong> Car owners must ensure their vehicles have valid insurance coverage as required by law.</li>
            <li><strong>Accuracy of Listing:</strong> Owners must provide accurate descriptions and images of their vehicles.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">9. Limitation of Liability</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Carzi acts as a platform to connect car owners and renters. We are not responsible for the condition of vehicles, disputes between users, or any damages, losses, or injuries arising from the use of rented vehicles. Our liability is limited to the extent permitted by law.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">10. Governing Law</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            These Terms shall be governed by and construed in accordance with the laws of India, without regard to its conflict of law principles.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">11. Changes to Terms</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Carzi reserves the right to modify these Terms at any time. We will notify you of any changes by posting the new Terms on this page. Your continued use of the Service after any such modifications constitutes your acceptance of the new Terms.
          </p>
        </section>
      </div>
    </div>
  );
};

export default TermsAndConditions;
