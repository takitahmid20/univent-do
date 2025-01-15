"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaCreditCard, FaMoneyBill, FaSpinner } from 'react-icons/fa';

export default function PaymentPage({ params }) {
  const [loading, setLoading] = useState(true);
  const [registration, setRegistration] = useState(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchRegistrationDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/signin');
          return;
        }

        const response = await fetch(`http://127.0.0.1:5656/events/registration/${params.registrationId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setRegistration(data);
        } else {
          throw new Error('Failed to fetch registration details');
        }
      } catch (error) {
        console.error('Error:', error);
        alert('Error fetching registration details');
      } finally {
        setLoading(false);
      }
    };

    fetchRegistrationDetails();
  }, [params.registrationId, router]);

  const handlePayment = async (paymentMethod) => {
    setProcessingPayment(true);
    
    // Simulate payment processing
    setTimeout(async () => {
      try {
        // Here you would normally make a call to your payment API
        // For now, we'll just simulate a successful payment
        
        // After successful payment, update registration status
        const token = localStorage.getItem('token');
        const response = await fetch(`http://127.0.0.1:5656/events/registration/${params.registrationId}/confirm`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ payment_method: paymentMethod })
        });

        if (response.ok) {
          alert('Payment successful! You can now view your ticket in the dashboard.');
          router.push('/dashboard/user/tickets');
        } else {
          throw new Error('Failed to confirm registration');
        }
      } catch (error) {
        console.error('Error:', error);
        alert('Payment failed. Please try again.');
      } finally {
        setProcessingPayment(false);
      }
    }, 2000); // Simulate 2 second payment processing
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#f6405f]"></div>
      </div>
    );
  }

  if (!registration) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Registration not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Complete Your Payment</h1>

            {/* Order Summary */}
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Event</span>
                  <span className="font-medium">{registration.event_title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tickets</span>
                  <span className="font-medium">{registration.number_of_seats}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Price per ticket</span>
                  <span className="font-medium">${registration.ticket_price}</span>
                </div>
                <div className="border-t pt-3 mt-3">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total Amount</span>
                    <span>${registration.total_amount}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold mb-4">Select Payment Method</h2>
              
              <button
                onClick={() => handlePayment('card')}
                disabled={processingPayment}
                className="w-full flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center">
                  <FaCreditCard className="w-6 h-6 text-[#f6405f] mr-3" />
                  <div>
                    <div className="font-medium">Credit/Debit Card</div>
                    <div className="text-sm text-gray-500">Pay with your card</div>
                  </div>
                </div>
                {processingPayment && <FaSpinner className="w-5 h-5 animate-spin" />}
              </button>

              <button
                onClick={() => handlePayment('cash')}
                disabled={processingPayment}
                className="w-full flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center">
                  <FaMoneyBill className="w-6 h-6 text-[#f6405f] mr-3" />
                  <div>
                    <div className="font-medium">Cash Payment</div>
                    <div className="text-sm text-gray-500">Pay at the venue</div>
                  </div>
                </div>
                {processingPayment && <FaSpinner className="w-5 h-5 animate-spin" />}
              </button>
            </div>

            <div className="mt-8 text-sm text-gray-500 text-center">
              This is a demo payment page. No actual payment will be processed.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
