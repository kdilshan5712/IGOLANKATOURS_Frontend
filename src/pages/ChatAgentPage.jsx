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
  ChevronDown, ChevronUp, Mail, Phone, User, X
} from "lucide-react";
import axios from "axios";
import { chatAPI } from "../services/api";
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

// ─── Signature Seal Component ──────────────────────────────────────────────────
const SignatureSeal = () => (
    <div className="signature-seal">
        <div className="seal-outer">
            <div className="seal-inner">
                <span className="seal-text">IGO LANKA</span>
                <Sparkles size={10} className="seal-sparkle" />
            </div>
        </div>
    </div>
);

const getHeroImage = (route = []) => {
  if (!route || route.length === 0) return HERO_IMAGES.default;
  const firstCity = route[0].toLowerCase();
  for (const key in HERO_IMAGES) {
    if (firstCity.includes(key)) return HERO_IMAGES[key];
  }
  return HERO_IMAGES.default;
};

/**
 * 🔒 AuthGatewayModal — Replaces Lead Capture with Signature Membership Requirement
 */
const AuthGatewayModal = ({ isOpen, onClose, draft, selectedTier }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleRedirect = (path) => {
    // Save current draft context to localStorage for auto-resume
    localStorage.setItem("pending_signature_submission", JSON.stringify({
      draft,
      selectedTier,
      timestamp: Date.now()
    }));
    navigate(path, { state: { from: "/custom-tour-chat" } });
  };

  return (
    <div className="modal-overlay-v3" onClick={onClose}>
      <div className="auth-gateway-card glass-panel-v3" onClick={e => e.stopPropagation()}>
        <div className="auth-header-v3">
          <div className="signature-medal">
            <Award size={32} color="#c5a059" />
          </div>
          <h2>Signature Membership Required</h2>
          <p>Join our elite travel community to finalize your custom itinerary and receive designer pricing.</p>
        </div>

        <div className="auth-options-v3">
          <div className="auth-option primary">
            <h3>New to IGO LANKA?</h3>
            <p>Create an account to track your Signature requests and chat directly with our travel designers.</p>
            <button className="auth-btn-v3 register" onClick={() => handleRedirect("/register")}>
              Become a Signature Member
            </button>
          </div>

          <div className="auth-divider-v3">
            <span>OR</span>
          </div>

          <div className="auth-option secondary">
            <h3>Already a Member?</h3>
            <button className="auth-btn-v3 login" onClick={() => handleRedirect("/login")}>
              Log In to Submit
            </button>
          </div>
        </div>

        <button className="modal-close-v3" onClick={onClose}>
          <X size={20} />
        </button>
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
  
  // Also remove the "and more exciting stops ahead" if it exists as a fallback
  cleaned = cleaned.replace(/\.\.\.and more exciting stops ahead!/gi, "").trim();

  if (hasDraft) {
    const sectionBreak = cleaned.search(/\n\s*(Tour Overview|Experience Highlights|Pricing Overview|Day-by-Day Plan)/i);
    if (sectionBreak > 0) cleaned = cleaned.slice(0, sectionBreak).trim();
  }
  return cleaned;
};

// ─── RenderText Component ──────────────
const RenderText = ({ text, sender }) => {
  if (!text) return null;
  const lines = text.split("\n");
  return (
    <div className={`message-text ${sender === 'assistant' ? 'luxury-font' : ''}`}>
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

// ─── Experience Icon Mapping ───────────────────────────────────────────────────
const EXPERIENCE_ICONS = {
  beach: Sun,
  wildlife: Activity,
  safari: Activity,
  culture: Landmark,
  nature: Palmtree,
  luxury: Sparkles,
  adventure: Zap,
  romance: Heart,
  surfing: Waves,
  hiking: Footprints,
  default: MapPin
};

import { 
  Landmark, Palmtree, Waves, Footprints, Share2, 
  Download, CreditCard, Settings2 
} from "lucide-react";

// ─── Proposal Card Component ──────────────
const ProposalCard = ({ draft, onSendToTeam, onModify, onChange }) => {
  const [isItineraryExpanded, setIsItineraryExpanded] = useState(false);
  const [selectedTier, setSelectedTier] = useState('standard');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const pricing = draft.pricing_estimate || { budget: 350, standard: 650, luxury: 1200 };
  const dailyPlan = draft.daily_plan || [];
  const days = draft.duration_days || dailyPlan.length || 7;

  const handleInitiateSend = () => {
    const token = localStorage.getItem("token");
    if (!token) {
        setShowAuthModal(true);
    } else {
        handleConfirmSend();
    }
  };

  const handleConfirmSend = async () => {
    setIsSubmitted(true);
    setShowAuthModal(false);
    await onSendToTeam(draft, selectedTier);
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

  const getExpIcon = (tag) => {
    const key = tag.toLowerCase().trim();
    const Icon = EXPERIENCE_ICONS[key] || EXPERIENCE_ICONS.default;
    return <Icon size={14} />;
  };

  return (
    <>
      <div className="proposal-card glass-premium">
        <div className="card-seal-wrapper">
          <SignatureSeal />
        </div>

        {/* 1. Cinematic Hero */}
        <div className="hero-section">
          <img src={getHeroImage(draft.route)} alt="Tour Hero" className="hero-image" />
          <div className="hero-overlay"></div>
          <div className="hero-content">
            <div className="hero-badge"><Sparkles size={12} /> SIGNATURE AI DESIGN</div>
            <h2 className="hero-title">{draft.title || `${days}-Day Sri Lanka Experience`}</h2>
            <div className="hero-meta">
              <span className="meta-item"><Clock size={16} /> {days} Days</span>
              <span className="meta-item"><Users size={16} /> {draft.group_type || "Couple"}</span>
            </div>
          </div>
        </div>

        {/* 2. Experience Tags & Route */}
        <div className="proposal-body-v3">
          <div className="experience-pills-v3">
            {draft.experience_tags?.slice(0, 4).map((tag, i) => (
              <span key={i} className="exp-pill-v3">
                {getExpIcon(tag)}
                {tag}
              </span>
            ))}
          </div>

          <div className="route-timeline-v3">
             {draft.route?.map((city, idx) => (
               <React.Fragment key={idx}>
                 <span className="route-city-v3">{city}</span>
                 {idx < draft.route.length - 1 && <ChevronRight size={10} className="route-arrow-v3" />}
               </React.Fragment>
             ))}
          </div>
        </div>

        {/* 3. Pricing Tabs */}
        <div className="pricing-tabs-container">
           <div className="pricing-tabs-header">
              {['budget', 'standard', 'luxury'].map((tier) => (
                <button 
                  key={tier}
                  className={`pricing-tab-btn ${selectedTier === tier ? 'active' : ''}`}
                  onClick={() => setSelectedTier(tier)}
                >
                  {tier.toUpperCase()}
                </button>
              ))}
           </div>
           
           <div className="tier-display-v3">
              <div className="tier-price-main">
                <span className="currency">$</span>
                <span className="amount">{pricing[selectedTier]}</span>
                <span className="per-pp">/ total per person</span>
              </div>
              <p className="tier-description">
                {selectedTier === 'luxury' 
                  ? "Hand-picked 5-star boutiques, private premier chauffeur, and exclusive VIP access."
                  : selectedTier === 'standard'
                  ? "Charming 3-4 star villas, private A/C transport, and iconic highlights."
                  : "Authentic guesthouses, local transport options, and essential Sri Lankan soul."
                }
              </p>
           </div>
        </div>

        {/* 4. Collapsible Itinerary */}
        <div className="itinerary-section-v3">
          <button 
            className="itinerary-toggle-v3"
            onClick={() => setIsItineraryExpanded(!isItineraryExpanded)}
          >
            <Calendar size={18} />
            {isItineraryExpanded ? "Hide Full Itinerary" : "Explore Day-by-Day Journey"}
            <div className={`toggle-icon ${isItineraryExpanded ? 'open' : ''}`}>
               <ChevronDown size={20} />
            </div>
          </button>
          
          {isItineraryExpanded && (
            <div className="itinerary-scroll-v3">
              {dailyPlan.map((day, idx) => (
                <div key={idx} className="day-card-v3">
                  <div className="day-label-v3">DAY {idx + 1}</div>
                  <div className="day-info-v3">
                    <h5>{day.location}</h5>
                    <div className="day-acts-v3">
                       {day.activities?.map((act, i) => (
                         <span key={i} className="act-dot">✦ {act}</span>
                       ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 5. Master Actions */}
         <div className="proposal-footer-v3">
            <div className="footer-top-v3 centered-actions">
               <button className="cta-btn primary-v3 full-width" onClick={handleInitiateSend}>
                 <Send size={18} />
                 Send to Admin for Approval
               </button>
            </div>
           
           <div className="footer-bottom-v3">
              <button className="mini-btn-v3" onClick={onModify}>
                 <Settings2 size={14} />
                 Customize This Tour
              </button>
              <div className="share-actions-v3">
                 <button className="icon-btn-v3" title="Save Itinerary"><Download size={16} /></button>
                 <button className="icon-btn-v3" title="Share Journey"><Share2 size={16} /></button>
              </div>
           </div>
        </div>
      </div>

      <AuthGatewayModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)}
        draft={draft}
        selectedTier={selectedTier}
      />
    </>
  );
};

// ─── Weather Card ─────────────────────────────────────────────────────────────

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
  const [resumeData, setResumeData] = useState(null);
  const messagesEndRef = useRef(null);
  const location = useLocation();

  // Check for auto-resume on mount
  useEffect(() => {
    const pending = localStorage.getItem("pending_signature_submission");
    const token = localStorage.getItem("token");
    
    if (pending && token) {
      try {
        const parsed = JSON.parse(pending);
        // Only resume if it's recent (within 2 hours)
        if (Date.now() - parsed.timestamp < 2 * 60 * 60 * 1000) {
          setResumeData(parsed);
          
          // Add a resume prompt to the chat
          setMessages(prev => [...prev, {
            id: Date.now(),
            sender: "assistant",
            text: `Welcome back, Signature Member! 🥂 I have preserved your custom itinerary. Would you like to submit it for final approval now?`,
            tourDraft: parsed.draft,
            timestamp: new Date()
          }]);
        }
        localStorage.removeItem("pending_signature_submission");
      } catch (e) {
        localStorage.removeItem("pending_signature_submission");
      }
    }
  }, []);

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
        history: updatedHistory.slice(-5) 
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

  const handleSendToTeam = async (draft, tier) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const pricing = draft.pricing_estimate || {};
      const selectedPrice = pricing[tier] || 0;

      // Extract user info from Signature account
      const userName = localStorage.getItem("userName") || "Signature Member";
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
        tourist_name: userName,
        tourist_email: userEmail,
        tourist_phone: localStorage.getItem("userPhone") || "N/A"
      };

      const res = await axios.post(`${API_BASE}/ai/submit-custom-tour`, payload, {
        headers: { ...(token && { Authorization: `Bearer ${token}` }) }
      });
      
      const sessionId = res.data?.session?.session_id || res.data?.session_id;

      if (sessionId) {
        // Prepare history for admin sync
        // Add a system notification as the final entry to clearly show the choice to the admin
        const systemFinalMsg = {
          id: Date.now(),
          sender: "assistant", 
          text: `[SYSTEM NOTIFICATION]: User has submitted this "${draft.title}" for approval. Selected Tier: ${tier.toUpperCase()} ($${selectedPrice}).`,
          timestamp: new Date()
        };

        const messagesToSync = [...messages, systemFinalMsg];
        
        await chatAPI.syncHistory(sessionId, messagesToSync, token);
        console.log("✅ Custom tour and history submitted successfully");
      }
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
          <div className="header-actions">
            {messages.length > 1 && (
              <button className="submit-consult-btn featured" onClick={() => handleSend("I want to submit this consultation to the team for review.")}>
                <Award size={18} /> Send to Admin for Approval
              </button>
            )}
            <button className="reset-btn" title="Restart Design Session" onClick={() => { setMessages([]); setHistory([]); sessionStorage.clear(); window.location.reload(); }}>
              <RefreshCw size={18} />
            </button>
          </div>
        </header>

        <div className="chat-scroll-area">
          {messages.map((msg) => (
            <div key={msg.id} className={`message-frame ${msg.sender}`}>
              
                {msg.sender === "assistant" && (
                    <div className="ai-mini-header" style={{ fontSize: '0.65rem', fontWeight: 900, color: '#c5a059', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Bot size={14} /> <span>SIGNATURE AI AGENT</span>
                    </div>
                )}

              <div className="message-content">
                {msg.text && (
                  <div className={`text-bubble ${msg.sender}`}>
                    <RenderText text={msg.text} sender={msg.sender} />
                  </div>
                )}

                {msg.weather && <WeatherCard weather={msg.weather} />}

                {msg.tourDraft && (
                  <div className="proposal-render-container">
                    <ProposalCard 
                        draft={msg.tourDraft} 
                        onSendToTeam={handleSendToTeam}
                        onModify={() => setUserInput("I want to modify some parts of this tour.")}
                        onChange={() => setUserInput("Can you make some changes to this itinerary?")}
                    />
                  </div>
                )}
              </div>
              
                {msg.sender === "assistant" && !msg.tourDraft && msg.text?.toLowerCase().includes("day") && (
                  <div className="ai-repair-hint">
                    <button className="btn-repair" onClick={() => handleSend("Please generate the full signature proposal card for this itinerary.")}>
                      <Zap size={14} /> Sync Itinerary to Card
                    </button>
                  </div>
                )}

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
