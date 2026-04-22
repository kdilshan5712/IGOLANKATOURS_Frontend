/**
 * 🎯 I GO LANKA TOURS - Email Verification Page
 * 
 * Auto-executing verification page that handles the account activation flow.
 * Consumes a token from the URL, calls the backend verification endpoint,
 * and handles success/error UI states with automatic redirection.
 * 
 * @module VerifyEmailPage
 */

import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Loader } from 'lucide-react';
import './VerifyEmailPage.css';

// Local API URL for direct fetch in this component
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

/**
 * VerifyEmailPage Component
 * 
 * Automatically triggers verification on mount and manages activation lifecycle UI.
 * 
 * @returns {JSX.Element}
 */
const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('');
  const token = searchParams.get('token');
  const verificationAttemptedRef = useRef(false);

  useEffect(() => {
    // Prevent multiple verification attempts
    if (verificationAttemptedRef.current) {
      console.log('⚠️ Verification already attempted, skipping duplicate call');
      return;
    }

    const verifyEmail = async () => {
      console.log('📧 VerifyEmailPage - Token from URL:', token);
      
      // @VALIDATION: Ensure token is present before attempting verification
      if (!token) {
        setStatus('error');
        setMessage('Invalid verification link. No token provided.');
        return;
      }

      // Mark as attempted before async call to prevent StrictMode double-call
      verificationAttemptedRef.current = true;

      try {
        // @API_CALL: Send token to backend to activate user account
        console.log('🔄 Sending verify request to:', `${API_BASE_URL}/auth/verify-email?token=${token.substring(0, 20)}...`);
        const res = await fetch(`${API_BASE_URL}/auth/verify-email?token=${token}`);
        console.log('📬 Response status:', res.status);
        
        const data = await res.json();
        console.log('📊 Verification response:', { status: res.status, success: data.success, verified: data.verified, message: data.message });

        // @ERROR_HANDLING: Success if: backend says success OR user is already verified
        if (res.ok && (data.success === true || data.verified === true)) {
          setStatus('success');
          setMessage(data.message || 'Email verified successfully!');
          
          // SESSION CLEANUP: Clear any previous auth tokens/data 
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('userRole');
          
          // NAVIGATION: Redirect to login page after 3 seconds
          setTimeout(() => {
            navigate('/login');
          }, 3000);
        } else {
          // @ERROR_HANDLING: Invalid/Expired token case
          setStatus('error');
          setMessage(data.message || 'Email verification failed. Please try again.');
        }
      } catch (error) {
        // @ERROR_HANDLING: Server unreachable or network error
        console.error('Verification error:', error);
        setStatus('error');
        setMessage('Failed to verify email. Please try again later.');
      }
    };

    verifyEmail();
  }, [token, navigate]);

  return (
    <div className="verify-email-container">
      <div className="verify-email-card">
        {status === 'verifying' && (
          <>
            <Loader className="verify-icon spin" size={64} />
            <h1>Verifying Your Email</h1>
            <p>Please wait while we verify your email address...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="verify-icon success" size={64} />
            <h1>Email Verified!</h1>
            <p>{message}</p>
            <p className="redirect-text">Redirecting you shortly...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="verify-icon error" size={64} />
            <h1>Verification Failed</h1>
            <p>{message}</p>
            <div className="verify-actions">
              <button onClick={() => navigate('/check-email')} className="btn-primary">
                Back to Email
              </button>
              <button onClick={() => navigate('/login')} className="btn-secondary">
                Login
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmailPage;
