import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Send, Sparkles, Bot, User as UserIcon, MapPin,
  Calendar, DollarSign, RefreshCw, XCircle,
  Thermometer, Wind, Droplets, CheckCircle2, CloudRain, Sun,
  FileText, ArrowRight, Clock,
  Users, Plane, Star, Hotel, Info,
  Zap, Award, ShieldCheck, Image as ImageIcon, Heart, Camera,
  ThumbsUp, MessageSquare, Save, Edit3, ChevronRight, Activity,
  ChevronDown, ChevronUp, Mail, Phone, User
} from "lucide-react";
import axios from "axios";
import "./ChatAgentPage.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// ─── Hero Image Mapping ────────────────────────────────────────────────────────
const HERO_IMAGES = {
  sigiriya: "/ai-tours/sigiriya.png",
  ella: "/ai-tours/ella.png",
  beach: "/ai-tours/beach.png",
  mirissa: "/ai-tours/beach.png",
  bentota: "/ai-tours/beach.png",
  yala: "/ai-tours/yala.png",
  safari: "/ai-tours/yala.png",
  default: "/ai-tours/sigiriya.png"
};

const getHeroImage = (route = []) => {
  if (!route || route.length === 0) return HERO_IMAGES.default;
  const firstCity = route[0].toLowerCase();
  for (const key in HERO_IMAGES) {
    if (firstCity.includes(key)) return HERO_IMAGES[key];
  }
  return HERO_IMAGES.default;
};

// ─── Lead Capture Modal ────────────────────────────────────────────────────────
const LeadCaptureModal = ({ isOpen, onClose, onConfirm, draft, selectedTier }) => {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onConfirm(formData);
    setLoading(false);
  };

  return (
    <div className="anonymous-form-overlay">
      <div className="anonymous-form-card">
        <button className="form-close" onClick={onClose}><XCircle size={20} /></button>
        <div className="form-head">
          <div className="form-icon"><Sparkles size={24} /></div>
          <h3>Secure Your Signature Tour</h3>
          <p>Please provide your contact details. Our elite travel designers will finalize this {draft.duration_days}-day journey specifically for you.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="lead-form">
          <div className="form-group">
            <label><User size={14} /> Full Name</label>
            <input 
              required 
              type="text" 
              placeholder="e.g. Kavindu Dilshan"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>
          <div className="form-group">
            <label><Mail size={14} /> Email Address</label>
            <input 
              required 
              type="email" 
              placeholder="e.g. kavindu@example.com"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>
          <div className="form-group">
            <label><Phone size={14} /> WhatsApp / Phone</label>
            <input 
              required 
              type="tel" 
              placeholder="+94 77 123 4567"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
            />
          </div>
          
          <div className="form-footer">
             <button type="submit" className="btn-primary" disabled={loading}>
               <Send size={18} /> {loading ? "Connecting to Concierge..." : "Confirm & Send to Experts"}
             </button>
             <p className="privacy-note">Privacy Guaranteed. Only Elite Travel Design.</p>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── JSON Scanner Utility ───────────────────────────────────────────────────────
// ─── JSON Scanner Utility ───────────────────────────────────────────────────────
const findJsonInText = (text) => {
  if (!text) return null;
  
  // 1. Try finding by markdown fenced block first (now enforced in AI service)
  const fenced = text.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/i);
  if (fenced) {
      try { 
          const parsed = JSON.parse(fenced[1]);
          if (parsed.type === 'CUSTOM_TOUR_DRAFT') return fenced[0];
      } catch(e) {}
  }
  
  // 2. Fallback to raw object scanning
  const firstOpen = text.indexOf('{');
  const lastClose = text.lastIndexOf('}');
  if (firstOpen !== -1 && lastClose !== -1 && lastClose > firstOpen) {
      const possibleJson = text.slice(firstOpen, lastClose + 1);
      if (possibleJson.includes('"CUSTOM_TOUR_DRAFT"')) {
          try {
              JSON.parse(possibleJson);
              return possibleJson;
          } catch(e) {}
      }
  }
  return null;
};

const extractTourDraft = (text) => {
  const rawJsonMatched = findJsonInText(text);
  if (!rawJsonMatched) return null;
  let pureJson = rawJsonMatched;
  const matchFenced = rawJsonMatched.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/i);
  if (matchFenced) pureJson = matchFenced[1];
  try {
    const parsed = JSON.parse(pureJson);
    if (parsed.type === 'CUSTOM_TOUR_DRAFT') return parsed;
    if (parsed.tour_draft?.type === 'CUSTOM_TOUR_DRAFT') return parsed.tour_draft;
  } catch (e) {}
  return null;
};

const stripJsonFromText = (text, hasDraft = false) => {
  if (!text) return text;
  let cleaned = text;
  const rawJsonMatched = findJsonInText(cleaned);
  if (rawJsonMatched) cleaned = cleaned.replace(rawJsonMatched, "");
  cleaned = cleaned.replace(/```json[\s\S]*?```/gi, "").trim();
  cleaned = cleaned.replace(/👉\s*"You can send.*?booking\."/gi, "").trim();
  if (hasDraft) {
    // If we have a draft, remove parts of the text that look like a manual itinerary
    const sectionBreak = cleaned.search(/\n\s*(Tour Overview|Experience Highlights|Pricing Overview|Day-by-Day Plan)/i);
    if (sectionBreak > 0) cleaned = cleaned.slice(0, sectionBreak).trim();
  }
  return cleaned;
};

// ─── RenderText Component ──────────────
const RenderText = ({ text }) => {
  if (!text) return null;
  const lines = text.split("\n");
  return (
    <div className="message-text">
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return <br key={i} />;
        if (trimmed.startsWith("- ") || trimmed.startsWith("• ")) {
          return (
            <div key={i} className="rt-bullet">
              <span className="rt-bullet-dot">✦</span>
              <span className="rt-bullet-text">{trimmed.replace(/^[-•]\s*/, "")}</span>
            </div>
          );
        }
        const parts = trimmed.split(/\*\*(.*?)\*\*/g);
        return (
          <p key={i} className="rt-body">
            {parts.map((part, j) => j % 2 === 1 ? <strong key={j}>{part}</strong> : part)}
          </p>
        );
      })}
    </div>
  );
};

// ─── Signature Seal SVG ──────────────
const SignatureSeal = () => (
  <svg width="100" height="100" viewBox="0 0 100 100" className="signature-seal">
    <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
    <path id="curve" fill="none" d="M 20,50 A 30,30 0 1,1 80,50 A 30,30 0 1,1 20,50" />
    <text fontSize="8" fontWeight="900" letterSpacing="2">
      <textPath xlinkHref="#curve">IGOLANKA SIGNATURE • ELITE DESIGN • </textPath>
    </text>
    <path d="M35 50 L45 60 L65 40" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ─── Proposal Card Component ──────────────
const ProposalCard = ({ draft, onSendToTeam, onModify, onChange }) => {
  const [isItineraryExpanded, setIsItineraryExpanded] = useState(false);
  const [selectedTier, setSelectedTier] = useState('standard');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showLeadModal, setShowLeadModal] = useState(false);

  const pricing = draft.pricing_estimate || { budget: 350, standard: 650, luxury: 1200 };
  const dailyPlan = draft.daily_plan || [];
  const days = draft.duration_days || dailyPlan.length || 7;

  const handleInitiateSend = () => {
    const token = localStorage.getItem("token");
    if (!token) {
        setShowLeadModal(true);
    } else {
        handleConfirmSend();
    }
  };

  const handleConfirmSend = async (contactData = null) => {
    setIsSubmitted(true);
    setShowLeadModal(false);
    await onSendToTeam(draft, selectedTier, contactData);
  };

  if (isSubmitted) {
    return (
      <div className="proposal-card success-state">
        <div className="success-content">
          <div className="success-icon-wrapper">
            <CheckCircle2 size={40} />
          </div>
          <h3>Signature Journey Requested</h3>
          <p>Our elite travel experts have received your {days}-day plan. We will review the details and contact you shortly to finalize your experience.</p>
          <button className="btn-primary" style={{ maxWidth: '280px', margin: '0 auto' }} onClick={() => setIsSubmitted(false)}>
            Close & Continue Chat
          </button>
        </div>
      </div>
    );
  }

  const inclusions = [
    "Private Chauffeur-Guide throughout",
    "Luxury Handpicked Accommodations",
    "Daily Gourmet Breakfast & Select Dinners",
    "All Entrance Fees & Private Logistics",
    "24/7 Elite Concierge Support"
  ];

  return (
    <>
      <div className="proposal-card glass-premium">
        <div className="card-seal-wrapper">
          <SignatureSeal />
        </div>

        {/* 1. Cinematic Hero */}
        <div className="hero-section">
          <img src={getHeroImage(draft.route)} alt="Tour Hero" className="hero-image" />
          <div className="hero-gradient"></div>
          <div className="hero-content">
            <div className="hero-badge"><Sparkles size={12} /> SIGNATURE AI DESIGN</div>
            <h2 className="hero-title">{draft.title || `${days}-Day Sri Lanka Experience`}</h2>
            <div className="hero-meta">
              <span><Clock size={16} /> {days} Days</span>
              <span><ShieldCheck size={16} /> {draft.travel_style || "Standard"}</span>
              <span><Users size={16} /> {draft.group_type || "Couple"}</span>
            </div>
          </div>
        </div>

        {/* 2. Route Timeline */}
        <div className="route-timeline">
           {draft.route?.map((city, idx) => (
             <React.Fragment key={idx}>
               <span className="route-city">{city}</span>
               {idx < draft.route.length - 1 && <ArrowRight size={14} className="route-arrow" />}
             </React.Fragment>
           ))}
        </div>

        {/* 3. Summary & Tags */}
        <div className="details-grid">
          <div className="summary-col">
             <h4>The Vision</h4>
             <p>{draft.summary || "A bespoke journey designed to reveal the hidden gems of Sri Lanka."}</p>
             <div className="experience-pills">
                {draft.experience_tags?.map((tag, i) => (
                  <span key={i} className="exp-pill">✦ {tag}</span>
                ))}
             </div>
          </div>
          <div className="inclusions-col">
             <h4>What's Included</h4>
             <ul className="incl-list">
                {inclusions.map((item, i) => (
                  <li key={i}><CheckCircle2 size={14} /> {item}</li>
                ))}
             </ul>
          </div>
        </div>

        {/* 4. Pricing Selection */}
        <div className="pricing-grid-wrapper">
           <div className="pricing-header">
              <span>SELECT YOUR TRAVEL TIER</span>
              <Info size={14} />
           </div>
           <div className="pricing-grid">
              {['budget', 'standard', 'luxury'].map((tier) => (
                <div 
                  key={tier}
                  className={`tier-card ${tier} ${selectedTier === tier ? 'active' : ''}`}
                  onClick={() => setSelectedTier(tier)}
                >
                  {tier === 'standard' && <div className="tier-tag">Recommended</div>}
                  <div className="tier-name">{tier.toUpperCase()}</div>
                  <div className="tier-price">${pricing[tier]}<small>/pp</small></div>
                </div>
              ))}
           </div>
        </div>

        {/* 5. Collapsible Itinerary */}
        <div className="itinerary-section-v2">
          <button 
            className="itinerary-expand-btn"
            onClick={() => setIsItineraryExpanded(!isItineraryExpanded)}
          >
            {isItineraryExpanded ? "Hide Full Journey" : "Explore Day-by-Day Journey"}
            {isItineraryExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
          
          {isItineraryExpanded && (
            <div className="itinerary-v2-grid">
              {dailyPlan.map((day, idx) => (
                <div key={idx} className="day-card-v2">
                  <div className="day-header">
                    <span className="day-ordinal">DAY {idx + 1}</span>
                    <h5>{day.location}</h5>
                  </div>
                  <div className="day-body">
                    <p>{day.description}</p>
                    <div className="day-tags">
                       {day.activities?.map((act, i) => (
                         <span key={i} className="day-act">✦ {act}</span>
                       ))}
                    </div>
                  </div>
                  <div className="day-footer-meta">
                     {day.stay && <span><Hotel size={12} /> {day.stay}</span>}
                     {day.travel_notes && <span><Plane size={12} /> {day.travel_notes}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 6. Elite Actions */}
        <div className="card-actions-v2">
           <button className="primary-action-btn" onClick={handleInitiateSend}>
              <Zap size={20} />
              Finalize Proposal with Humans
           </button>
           <div className="secondary-buttons">
              <button className="sec-btn" onClick={onModify}><Edit3 size={16} /> Refine Plan</button>
              <button className="sec-btn" onClick={onChange}><RefreshCw size={16} /> Start Over</button>
           </div>
        </div>
      </div>

      <LeadCaptureModal 
        isOpen={showLeadModal} 
        onClose={() => setShowLeadModal(false)}
        onConfirm={handleConfirmSend}
        draft={draft}
        selectedTier={selectedTier}
      />
    </>
  );
};

// ─── Weather Card ─────────────────────────────────────────────────────────────
const WeatherCard = ({ weather }) => {
  if (!weather) return null;
  const isGood = weather.is_good_for_travel;
  return (
    <div className={`weather-card ${isGood ? "good" : "bad"}`} style={{ padding: '16px', borderRadius: '16px', background: '#f8fafc', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
      <div className="weather-head" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
        {isGood ? <Sun size={20} color="#f59e0b" /> : <CloudRain size={20} color="#0ea5e9" />}
        <div className="w-city">
          <strong style={{ display: 'block', fontSize: '0.9rem' }}>{weather.city}</strong>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{weather.condition}</span>
        </div>
        <span style={{ marginLeft: 'auto', fontSize: '0.65rem', fontWeight: 800, padding: '4px 10px', borderRadius: '50px', background: isGood ? '#f0fdf4' : '#fef2f2', color: isGood ? '#166534' : '#991b1b' }}>
          {isGood ? "PERFECT CONDITIONS" : "CHECK FORECAST"}
        </span>
      </div>
      <div className="w-stats" style={{ display: 'flex', gap: '16px', fontSize: '0.75rem', color: '#475569' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Thermometer size={12} /> {weather.temperature_c}°</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Droplets size={12} /> {weather.humidity}% Humidity</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Wind size={12} /> {weather.wind_kph}km/h</span>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const ChatAgentPage = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "assistant",
      text: "Ayubowan! 🇱🇰 I am your Signature AI Travel Designer for I GO LANKA TOURS.\n\ndescribe your dream journey — the duration, your preferred travel style, and the experiences you crave. I will craft an elite, custom-tailored tour proposal just for you.",
      timestamp: new Date(),
    },
  ]);
  const [userInput, setUserInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [history, setHistory] = useState([]);
  const messagesEndRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    const savedMsg = sessionStorage.getItem("chat_messages");
    if (savedMsg) {
      const parsed = JSON.parse(savedMsg);
      setMessages(parsed.map(m => ({ ...m, timestamp: new Date(m.timestamp) })));
    }
    const savedHist = sessionStorage.getItem("chat_history");
    if (savedHist) setHistory(JSON.parse(savedHist));
  }, []);

  useEffect(() => {
    if (messages.length > 1) sessionStorage.setItem("chat_messages", JSON.stringify(messages));
    if (history.length > 0) sessionStorage.setItem("chat_history", JSON.stringify(history));
  }, [messages, history]);

  useEffect(() => {
    if (location.state?.prefillContext) {
      setUserInput(location.state.prefillContext);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = async (textOverride = null) => {
    const text = (textOverride || userInput).trim();
    if (!text || isTyping) return;

    const userMsg = { id: Date.now(), sender: "user", text, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setUserInput("");
    setIsTyping(true);

    const updatedHistory = [...history, { role: "user", content: text }];

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(`${API_BASE}/ai/chat`, { 
        message: text, 
        history: updatedHistory.slice(-10) 
      }, {
        headers: { ...(token && { Authorization: `Bearer ${token}` }) }
      });

      const data = res.data;
      setHistory([...updatedHistory, { role: "assistant", content: data.reply }]);

      const tourDraft = data.custom_tour_draft || extractTourDraft(data.reply);
      const cleanedText = tourDraft ? stripJsonFromText(data.reply, true) : data.reply;

      const aiMsg = {
        id: Date.now() + 1,
        sender: "assistant",
        text: cleanedText,
        weather: data.weather || null,
        tourDraft: tourDraft,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message;
      console.error("❌ Chat API Error:", errMsg);
      setMessages((prev) => [...prev, {
        id: Date.now() + 1,
        sender: "assistant",
        text: `⚠️ Something went wrong: ${errMsg}. Please try again.`,
        isError: true,
        timestamp: new Date(),
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSendToTeam = async (draft, tier, contactData = null) => {
    try {
      const token = localStorage.getItem("token");
      const pricing = draft.pricing_estimate || {};
      const selectedPrice = pricing[tier] || 0;

      // Extract user info if authenticated
      const userName = localStorage.getItem("userName");
      const userEmail = localStorage.getItem("userEmail");

      const payload = {
        title: draft.title,
        duration_days: draft.duration_days,
        travel_month: draft.assumptions?.find(a => a.toLowerCase().includes("month")) || "Flexible",
        traveler_count: draft.group_type === 'couple' ? 2 : (draft.group_type === 'family' ? 4 : 1),
        hotel_preference: tier,
        estimated_price_min: selectedPrice,
        estimated_price_max: selectedPrice * 1.2,
        recommendations: draft,
        // Use contactData if provided (anonymous flow) or fall back to localStorage (auth flow)
        tourist_name: contactData?.name || userName || "Authenticated User",
        tourist_email: contactData?.email || userEmail || "authenticated@example.com",
        tourist_phone: contactData?.phone || "N/A"
      };

      await axios.post(`${API_BASE}/ai/submit-custom-tour`, payload, {
        headers: { ...(token && { Authorization: `Bearer ${token}` }) }
      });
      console.log("✅ Custom tour submitted successfully");
    } catch (err) {
      console.error("❌ Failed to submit tour:", err);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const QuickPrompt = ({ text, icon: Icon }) => (
    <button onClick={() => handleSend(text)} className="quick-prompt-btn">
      {Icon && <Icon size={14} color="#c5a059" />}
      <span>{text}</span>
    </button>
  );

  return (
    <div className="chat-page-wrapper">
      <div className="chat-main-container">
        
        <header className="chat-header">
          <div className="header-ai">
            <div className="avatar-orb"><Sparkles size={20} /></div>
            <div className="header-text">
              <h1>I GO LANKA <span className="ai-tag">SIGNATURE AI</span></h1>
              <p>Designing your bespoke journey to Sri Lanka</p>
            </div>
          </div>
          <button className="reset-btn" style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }} onClick={() => { setMessages([]); setHistory([]); sessionStorage.clear(); window.location.reload(); }}>
            <RefreshCw size={18} />
          </button>
        </header>

        <div className="chat-scroll-area">
          {messages.map((msg) => (
            <div key={msg.id} className={`message-frame ${msg.sender}`}>
              
                {msg.sender === "assistant" && (
                    <div className="ai-mini-header" style={{ fontSize: '0.65rem', fontWeight: 900, color: '#c5a059', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Bot size={14} /> <span>ELITE CONCIERGE</span>
                    </div>
                )}

              <div className="message-content">
                {msg.text && (
                  <div className={`text-bubble ${msg.sender}`}>
                    <RenderText text={msg.text} />
                  </div>
                )}

                {msg.weather && <WeatherCard weather={msg.weather} />}

                {msg.tourDraft && (
                  <ProposalCard 
                    draft={msg.tourDraft} 
                    onSendToTeam={handleSendToTeam}
                    onModify={() => setUserInput("I want to modify some parts of this tour.")}
                    onChange={() => setUserInput("Can you make some changes to this itinerary?")}
                  />
                )}
              </div>
              
              <span className="message-timestamp">
                {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          ))}

          {isTyping && (
            <div className="message-frame assistant">
              <div className="typing-indicator">
                <div className="dot"></div>
                <div className="dot"></div>
                <div className="dot"></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-footer">
          {messages.length <= 1 && (
            <div className="quick-prompts-row">
              <QuickPrompt text="10-day luxury honeymoon" icon={Heart} />
              <QuickPrompt text="Family wildlife safari for 7 days" icon={Users} />
              <QuickPrompt text="Budget backpacking tour" icon={MapPin} />
              <QuickPrompt text="Weather in Ella right now" icon={CloudRain} />
            </div>
          )}

          <div className="input-bar">
            <textarea
              value={userInput}
              onChange={(e) => {
                setUserInput(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = e.target.scrollHeight + 'px';
              }}
              onKeyDown={handleKeyPress}
              placeholder="Describe your dream Sri Lanka journey..."
              rows={1}
            />
            <button
              className="send-action-btn"
              onClick={() => handleSend()}
              disabled={!userInput.trim() || isTyping}
            >
              <Send size={20} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ChatAgentPage;
