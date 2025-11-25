import React, { useState } from 'react';
import PaymentForm from './components/PaymentForm';
import WhatsAppConfirmation from './components/WhatsAppConfirmation';
import ConfirmationPage from './components/ConfirmationPage';
import { PaymentData } from './types';

function App() {
  const [paymentData, setPaymentData] = useState<(PaymentData & { id: string }) | null>(null);
  const [currentStep, setCurrentStep] = useState<'form' | 'whatsapp' | 'confirmation'>('form');

  const handleFormSubmit = (data: PaymentData) => {
    setPaymentData({ ...data, id: '' }); // ID will be set after WhatsApp confirmation
    setCurrentStep('whatsapp');
  };

  const handleWhatsAppConfirmed = async (data: PaymentData & { id: string }) => {
    setPaymentData(data);
    setCurrentStep('confirmation');
    
    // Log successful submission
    console.log('Payment data successfully submitted to Supabase:', {
      id: data.id,
      name: data.name,
      nim: data.nim,
      totalAmount: data.totalAmount
    });
  };

  const handleBackToForm = () => {
    setCurrentStep('form');
    setPaymentData(null);
  };

  const handleBackToWhatsApp = () => {
    setCurrentStep('whatsapp');
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 py-8 px-4">
      <div className="container mx-auto">
        {currentStep === 'confirmation' && paymentData ? (
          <ConfirmationPage 
            data={paymentData} 
            onBack={handleBackToWhatsApp}
          />
        ) : currentStep === 'whatsapp' && paymentData ? (
          <WhatsAppConfirmation
            data={paymentData}
            onBack={handleBackToForm}
            onConfirmed={handleWhatsAppConfirmed}
          />
        ) : (
          <PaymentForm onSubmit={handleFormSubmit} />
        )}
      </div>
    </div>
  );
}

export default App;
