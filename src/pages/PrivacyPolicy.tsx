
import React from 'react';

const PrivacyPolicy = () => {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <div className="prose max-w-none">
        <p>Last updated: June 2024</p>
        
        <h2 className="text-xl font-semibold mt-6 mb-3">1. Information We Collect</h2>
        <p>
          We collect information you provide when you create an account, upload images, and use our services.
          This includes your email address, name, and the palm images you upload for analysis.
        </p>
        
        <h2 className="text-xl font-semibold mt-6 mb-3">2. How We Use Your Information</h2>
        <p>
          We use your information to provide and improve our palm reading services, process payments,
          communicate with you, and ensure the security of our platform.
        </p>
        
        <h2 className="text-xl font-semibold mt-6 mb-3">3. Data Security</h2>
        <p>
          We implement appropriate security measures to protect your personal information from unauthorized
          access, alteration, disclosure, or destruction.
        </p>
        
        <h2 className="text-xl font-semibold mt-6 mb-3">4. Your Rights</h2>
        <p>
          You have the right to access, correct, or delete your personal information. You can also request
          that we restrict the processing of your data.
        </p>
        
        <h2 className="text-xl font-semibold mt-6 mb-3">5. Contact Us</h2>
        <p>
          If you have any questions about this Privacy Policy, please contact us.
        </p>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
