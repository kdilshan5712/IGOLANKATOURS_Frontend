import { useMemo, useState } from "react";
import { Sparkles, Compass, Clock, Wallet, Users, MapPin, Send, Plane, MessageCircle } from "lucide-react";
import "./ChatAgentPage.css";

const ChatAgentPage = () => {
  const [chatMessages, setChatMessages] = useState([
    {
      sender: "assistant",
      text: "Hi! I'm your trip design copilot. Share dates, group size, budget, and vibe — I'll draft a Sri Lanka plan for you."
    }
  ]);
  const [userInput, setUserInput] = useState("");
  const [assistantThinking, setAssistantThinking] = useState(false);
  const [tripContext, setTripContext] = useState({
    travelers: "",
    budget: "",
    interests: [],
    pace: "",
    accommodation: "",
    dates: ""
  });

  const quickPrompts = useMemo(
    () => [
      "7 days | couple | $2k | beaches + culture",
      "Family trip with kids | 10 days | wildlife + trains",
      "Honeymoon | boutique stays | south coast",
      "Heritage loop | Sigiriya + Kandy + tea country",
      "Adventure | hikes + safari + surf"
    ],
    []
  );

  const addMessage = (sender, text) => setChatMessages((prev) => [...prev, { sender, text }]);

  const upsertContext = (userText) => {
    const lower = userText.toLowerCase();
    setTripContext((prev) => {
      const next = { ...prev };
      const budgetMatch = lower.match(/\$(\d+[kK]?)/) || lower.match(/budget\s*(\d+\s*k?)/);
      if (budgetMatch) next.budget = budgetMatch[1].replace(/k/i, "k");
      const peopleMatch = lower.match(/(\d+)\s*(people|persons|pax|travelers|guests)/);
      if (peopleMatch) next.travelers = peopleMatch[1];
      const dateMatch = lower.match(/(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s*\d{0,2}/);
      if (dateMatch) next.dates = dateMatch[0];
      const paceMatch = lower.match(/(slow|relaxed|leisure|chill|fast|packed|tight)/);
      if (paceMatch) next.pace = paceMatch[1];
      const stayMatch = lower.match(/(villa|hotel|boutique|hostel|resort)/);
      if (stayMatch) next.accommodation = stayMatch[1];
      if (lower.includes("wildlife")) next.interests = Array.from(new Set([...next.interests, "wildlife"]));
      if (lower.includes("culture") || lower.includes("heritage")) next.interests = Array.from(new Set([...next.interests, "culture"]));
      if (lower.includes("beach")) next.interests = Array.from(new Set([...next.interests, "beaches"]));
      if (lower.includes("train") || lower.includes("tea")) next.interests = Array.from(new Set([...next.interests, "hill country"]));
      if (lower.includes("hike") || lower.includes("trek")) next.interests = Array.from(new Set([...next.interests, "hiking"]));
      return next;
    });
  };

  const buildSuggestion = (ctx) => {
    const interestsText = ctx.interests.length ? ctx.interests.join(", ") : "beaches, culture, and hill country";
    const pace = ctx.pace || "balanced pace";
    const stay = ctx.accommodation || "comfort hotels";
    const travelers = ctx.travelers ? `${ctx.travelers} travelers` : "your group";
    const budget = ctx.budget ? `$${ctx.budget} budget target` : "flexible budget";
    const dates = ctx.dates || "your preferred dates";
    return `Great — for ${travelers} on ${dates} with ${budget}, I'll weave ${interestsText} at a ${pace} and book ${stay}. Draft: Day 1-2 Colombo/Negombo arrival + lagoon dinner. Day 3-4 Sigiriya/Dambulla for heritage + sunrise hike. Day 5-6 Kandy to Ella by scenic train. Day 7-8 Yala for safari. Day 9-12 South Coast (Mirissa/Weligama) for beaches + whales. Want me to shorten, upgrade stays, or swap a stop?`;
  };

  const handleSend = (textOverride) => {
    const text = (textOverride ?? userInput).trim();
    if (!text) return;
    addMessage("user", text);
    upsertContext(text);
    setUserInput("");
    setAssistantThinking(true);

    setTimeout(() => {
      setAssistantThinking(false);
      setTripContext((ctx) => {
        const next = { ...ctx };
        addMessage("assistant", buildSuggestion(next));
        return next;
      });
    }, 400);
  };

  const handleQuickPrompt = (prompt) => handleSend(prompt);

  return (
    <>
      {/* Hero Section */}
      <section className="chat-hero">
        <div>
          <p className="chat-eyebrow">Custom Tour Assistant</p>
          <h1>Design your Sri Lanka trip in chat</h1>
          <p className="chat-subtitle">
            Tell us dates, group size, budget, and vibe. We'll draft a tailored itinerary instantly and note your preferences.
          </p>
          <div className="chat-hero-pills">
            <span><Sparkles size={16} /> Human-reviewed itineraries</span>
            <span><Compass size={16} /> Local-first routing</span>
            <span><Clock size={16} /> Replies under a minute</span>
          </div>
        </div>
      </section>

      {/* Main Chat Content */}
      <main className="chat-page">
        <div className="chat-container">\n          <div className="chat-grid">
          <div className="chat-card">
            <div className="chat-card-header">
              <div className="chat-title">
                <MessageCircle size={20} />
                <div>
                  <h2>Chat with the trip designer</h2>
                  <p>Share what matters: dates, budget, interests, pace.</p>
                </div>
              </div>
              <div className="chat-badges">
                <span><Users size={14} /> Travelers: {tripContext.travelers || "-"}</span>
                <span><Wallet size={14} /> Budget: {tripContext.budget || "-"}</span>
                <span><Compass size={14} /> Interests: {tripContext.interests.length ? tripContext.interests.join(", ") : "-"}</span>
                <span><Clock size={14} /> Pace: {tripContext.pace || "-"}</span>
                <span><MapPin size={14} /> Stay: {tripContext.accommodation || "-"}</span>
              </div>
            </div>

            <div className="chat-window">
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`chat-bubble ${msg.sender === "assistant" ? "assistant" : "user"}`}>
                  {msg.text}
                </div>
              ))}
              {assistantThinking && <div className="chat-bubble assistant typing">Typing...</div>}
            </div>

            <div className="chat-quick-prompts">
              {quickPrompts.map((prompt) => (
                <button key={prompt} type="button" onClick={() => handleQuickPrompt(prompt)}>
                  {prompt}
                </button>
              ))}
            </div>

            <div className="chat-input-row">
              <textarea
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Example: 8 days in August, 2 adults, $2.5k, beaches + wildlife, relaxed pace"
                rows="2"
              />
              <button type="button" onClick={() => handleSend()}>
                <Send size={18} />
                Send
              </button>
            </div>
          </div>

          <aside className="chat-side">
            <div className="side-card">
              <h3><Sparkles size={16} /> What to tell me</h3>
              <ul>
                <li>Dates or month window</li>
                <li>Travelers & room setup</li>
                <li>Budget target</li>
                <li>Must-see interests</li>
                <li>Pace & accommodation style</li>
              </ul>
            </div>
            <div className="side-card">
              <h3><Plane size={16} /> How it works</h3>
              <ol>
                <li>Chat your wishlist and constraints.</li>
                <li>Get a draft itinerary instantly.</li>
                <li>We refine, price, and confirm.</li>
              </ol>
            </div>
          </aside>
        </div>
      </div>
    </main>
    </>
  );
};

export default ChatAgentPage;
