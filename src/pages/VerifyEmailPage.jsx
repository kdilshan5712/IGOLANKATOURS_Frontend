import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Loader } from 'lucide-react';
import './VerifyEmailPage.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('');
  const token = searchParams.get('token');

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Invalid verification link. No token provided.');
        return;
      }

      try {
        const res = await fetch(`${API_BASE_URL}/auth/verify-email?token=${token}`);
        const data = await res.json();

        if (res.ok && data.success !== false) {
          setStatus('success');
          setMessage(data.message || 'Email verified successfully!');
          
          // Update user in localStorage if logged in
          const userStr = localStorage.getItem('user');
          if (userStr) {
            const user = JSON.parse(userStr);
            user.email_verified = true;
            localStorage.setItem('user', JSON.stringify(user));
          }

          // Redirect after 3 seconds
          setTimeout(() => {
            const isLoggedIn = localStorage.getItem('token');
            if (isLoggedIn) {
              navigate('/profile');
            } else {
              navigate('/login');
            }
          }, 3000);
        } else {
          setStatus('error');
          setMessage(data.message || 'Email verification failed. Please try again.');
        }
      } catch (error) {
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
              <button onClick={() => navigate('/profile')} className="btn-primary">
                Go to Profile
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
