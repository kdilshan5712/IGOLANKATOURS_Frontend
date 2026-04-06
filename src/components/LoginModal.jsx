import { useState } from "react";
import { X, Mail, Lock, User, Phone, MapPin } from "lucide-react";
import { authAPI } from "../services/api";
import { validatePassword } from "../utils/passwordValidation";

const LoginModal = ({ isOpen, onClose, onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register form state
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [country, setCountry] = useState("");
  const [phone, setPhone] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const data = await authAPI.login(loginEmail, loginPassword);

    if (!data.success || !data.token) {
      setError(data.message || "Login failed");
    } else {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("email", data.user.email);
      localStorage.setItem("name", data.user.name || data.user.email);
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userEmail", data.user.email);
      localStorage.setItem("userName", data.user.name || data.user.email);

      onLoginSuccess();
      onClose();
    }

    setLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate password strength
    const passwordValidation = validatePassword(registerPassword);
    if (!passwordValidation.isValid) {
      setError(passwordValidation.message);
      setLoading(false);
      return;
    }

    const data = await authAPI.register({
      name: fullName,
      email: registerEmail,
      password: registerPassword,
      country,
      phone
    });

    if (!data.success || !data.token) {
      setError(data.message || "Registration failed");
    } else {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("email", data.user.email);
      localStorage.setItem("name", data.user.name || data.user.email);
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userEmail", data.user.email);
      localStorage.setItem("userName", data.user.name || data.user.email);

      onLoginSuccess();
      onClose();
    }

    setLoading(false);
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError(null);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 className="modal-title">
              {isLogin ? "Login to Continue" : "Create an Account"}
            </h2>
            <p className="login-modal-subtitle" style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              {isLogin
                ? "Please login to complete your booking"
                : "Register to proceed with your booking"}
            </p>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {error && (
            <div className="login-modal-error" style={{ background: '#fee2e2', border: '1px solid #fecaca', borderRadius: '0.5rem', padding: '0.75rem 1rem', marginBottom: '1.5rem' }}>
              <p style={{ color: '#dc2626', fontSize: '0.875rem', margin: 0 }}>{error}</p>
            </div>
          )}

          {isLogin ? (
            <form onSubmit={handleLogin} className="login-modal-form">
              <div className="modal-form-group">
                <label className="modal-label">
                  <Mail size={16} />
                  <span>Email</span>
                </label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="modal-input"
                  placeholder="your.email@example.com"
                  required
                  disabled={loading}
                />
              </div>

              <div className="modal-form-group">
                <label className="modal-label">
                  <Lock size={16} />
                  <span>Password</span>
                </label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="modal-input"
                  placeholder="Enter your password"
                  required
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '0.5rem' }}
                disabled={loading}
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="login-modal-form">
              <div className="modal-form-group">
                <label className="modal-label">
                  <User size={16} />
                  <span>Full Name</span>
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="modal-input"
                  placeholder="John Doe"
                  required
                  disabled={loading}
                />
              </div>

              <div className="modal-form-group">
                <label className="modal-label">
                  <Mail size={16} />
                  <span>Email</span>
                </label>
                <input
                  type="email"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  className="modal-input"
                  placeholder="your.email@example.com"
                  required
                  disabled={loading}
                />
              </div>

              <div className="modal-form-group">
                <label className="modal-label">
                  <Lock size={16} />
                  <span>Password</span>
                </label>
                <input
                  type="password"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  className="modal-input"
                  placeholder="Create a strong password"
                  required
                  disabled={loading}
                />
                <small className="password-hint" style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.375rem', display: 'block' }}>
                  Must contain: 8+ characters, uppercase, lowercase, number, special character
                </small>
              </div>

              <div className="modal-form-group">
                <label className="modal-label">
                  <MapPin size={16} />
                  <span>Country (Optional)</span>
                </label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="modal-input"
                  placeholder="Your country"
                  disabled={loading}
                />
              </div>

              <div className="modal-form-group">
                <label className="modal-label">
                  <Phone size={16} />
                  <span>Phone (Optional)</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="modal-input"
                  placeholder="+1 234 567 8900"
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '0.5rem' }}
                disabled={loading}
              >
                {loading ? "Creating Account..." : "Register"}
              </button>
            </form>
          )}

          <div className="login-modal-toggle" style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #f1f5f9', textAlign: 'center' }}>
            <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button
                type="button"
                onClick={toggleMode}
                className="login-modal-toggle-btn"
                style={{ background: 'none', border: 'none', color: '#4f46e5', fontWeight: '600', cursor: 'pointer', marginLeft: '0.5rem' }}
                disabled={loading}
              >
                {isLogin ? "Register" : "Login"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
