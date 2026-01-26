import { useState } from "react";
import { X, Mail, Lock, User, Phone, MapPin } from "lucide-react";
import { authAPI } from "../services/api";
import { validatePassword } from "../utils/passwordValidation";
import "./LoginModal.css";

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
    <div className="login-modal-overlay" onClick={onClose}>
      <div className="login-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="login-modal-close" onClick={onClose}>
          <X size={24} />
        </button>

        <div className="login-modal-header">
          <h2 className="login-modal-title">
            {isLogin ? "Login to Continue" : "Create an Account"}
          </h2>
          <p className="login-modal-subtitle">
            {isLogin
              ? "Please login to complete your booking"
              : "Register to proceed with your booking"}
          </p>
        </div>

        {error && (
          <div className="login-modal-error">
            <p>{error}</p>
          </div>
        )}

        {isLogin ? (
          <form onSubmit={handleLogin} className="login-modal-form">
            <div className="login-modal-form-group">
              <label className="login-modal-label">
                <Mail size={18} />
                <span>Email</span>
              </label>
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="login-modal-input"
                placeholder="your.email@example.com"
                required
                disabled={loading}
              />
            </div>

            <div className="login-modal-form-group">
              <label className="login-modal-label">
                <Lock size={18} />
                <span>Password</span>
              </label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="login-modal-input"
                placeholder="Enter your password"
                required
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              className="login-modal-btn login-modal-btn-primary"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="login-modal-form">
            <div className="login-modal-form-group">
              <label className="login-modal-label">
                <User size={18} />
                <span>Full Name</span>
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="login-modal-input"
                placeholder="John Doe"
                required
                disabled={loading}
              />
            </div>

            <div className="login-modal-form-group">
              <label className="login-modal-label">
                <Mail size={18} />
                <span>Email</span>
              </label>
              <input
                type="email"
                value={registerEmail}
                onChange={(e) => setRegisterEmail(e.target.value)}
                className="login-modal-input"
                placeholder="your.email@example.com"
                required
                disabled={loading}
              />
            </div>

            <div className="login-modal-form-group">
              <label className="login-modal-label">
                <Lock size={18} />
                <span>Password</span>
              </label>
              <input
                type="password"
                value={registerPassword}
                onChange={(e) => setRegisterPassword(e.target.value)}
                className="login-modal-input"
                placeholder="Create a strong password"
                required
                disabled={loading}
              />
              <small className="password-hint">
                Must contain: 8+ characters, uppercase, lowercase, number, special character
              </small>
            </div>

            <div className="login-modal-form-group">
              <label className="login-modal-label">
                <MapPin size={18} />
                <span>Country (Optional)</span>
              </label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="login-modal-input"
                placeholder="Your country"
                disabled={loading}
              />
            </div>

            <div className="login-modal-form-group">
              <label className="login-modal-label">
                <Phone size={18} />
                <span>Phone (Optional)</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="login-modal-input"
                placeholder="+1 234 567 8900"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              className="login-modal-btn login-modal-btn-primary"
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Register"}
            </button>
          </form>
        )}

        <div className="login-modal-toggle">
          <p>
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button
              type="button"
              onClick={toggleMode}
              className="login-modal-toggle-btn"
              disabled={loading}
            >
              {isLogin ? "Register" : "Login"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
