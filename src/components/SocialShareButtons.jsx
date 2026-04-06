import { useState } from "react";
import { Facebook, Twitter, Link as LinkIcon, MessageCircle } from "lucide-react";
import "./SocialShareButtons.css";

const SocialShareButtons = ({ url, title }) => {
    const [copied, setCopied] = useState(false);

    const encodedUrl = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(title);

    const shareLinks = {
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
        twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
        whatsapp: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`
    };

    const openShareWindow = (url) => {
        window.open(url, '_blank', 'noopener,noreferrer,width=600,height=400');
    };

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    return (
        <div className="social-share-container">
            <p className="social-share-title">Share this tour:</p>
            <div className="social-share-buttons">
                <button
                    onClick={() => openShareWindow(shareLinks.facebook)}
                    className="share-btn share-facebook"
                    aria-label="Share on Facebook"
                    title="Share on Facebook"
                >
                    <Facebook size={18} />
                </button>
                <button
                    onClick={() => openShareWindow(shareLinks.twitter)}
                    className="share-btn share-twitter"
                    aria-label="Share on X (Twitter)"
                    title="Share on X"
                >
                    <Twitter size={18} />
                </button>
                <button
                    onClick={() => openShareWindow(shareLinks.whatsapp)}
                    className="share-btn share-whatsapp"
                    aria-label="Share on WhatsApp"
                    title="Share on WhatsApp"
                >
                    <MessageCircle size={18} />
                </button>
                <button
                    onClick={handleCopyLink}
                    className={`share-btn share-copy ${copied ? 'copied' : ''}`}
                    aria-label="Copy link"
                    title="Copy Link"
                >
                    <LinkIcon size={18} />
                    {copied && <span className="copy-tooltip">Copied!</span>}
                </button>
            </div>
        </div>
    );
};

export default SocialShareButtons;
