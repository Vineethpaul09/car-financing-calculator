import { useEffect, useRef } from "react";
import "./AdBanner.css";

// Ad slot types for different placements
export type AdSlotType =
  | "header-banner" // 728x90 leaderboard
  | "sidebar" // 300x250 medium rectangle
  | "in-content" // 336x280 large rectangle
  | "footer-banner" // 728x90 leaderboard
  | "mobile-banner"; // 320x50 mobile banner

interface AdBannerProps {
  slot: AdSlotType;
  className?: string;
}

// Ad dimensions by slot type
const AD_DIMENSIONS: Record<AdSlotType, { width: number; height: number }> = {
  "header-banner": { width: 728, height: 90 },
  sidebar: { width: 300, height: 250 },
  "in-content": { width: 336, height: 280 },
  "footer-banner": { width: 728, height: 90 },
  "mobile-banner": { width: 320, height: 50 },
};

/**
 * AdBanner Component
 *
 * Displays Google AdSense ads or affiliate banners.
 *
 * SETUP INSTRUCTIONS:
 * 1. Get approved for Google AdSense
 * 2. Create ad units in AdSense dashboard
 * 3. Replace the placeholder with your ad unit code
 * 4. Uncomment the AdSense script in index.html
 */
export function AdBanner({ slot, className = "" }: AdBannerProps) {
  const adRef = useRef<HTMLDivElement>(null);
  const dimensions = AD_DIMENSIONS[slot];

  useEffect(() => {
    // Initialize Google AdSense ad
    // This runs after the component mounts
    try {
      // @ts-expect-error - adsbygoogle is added by Google's script
      if (window.adsbygoogle && adRef.current) {
        // @ts-expect-error
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (error) {
      console.log("AdSense not loaded");
    }
  }, []);

  return (
    <div
      className={`ad-banner ad-banner--${slot} ${className}`}
      style={{
        minWidth: dimensions.width,
        minHeight: dimensions.height,
      }}
    >
      <div ref={adRef} className="ad-container">
        {/* 
          GOOGLE ADSENSE AD UNIT
          Replace this comment with your AdSense ad unit code:
          
          <ins className="adsbygoogle"
            style={{ display: 'block', width: dimensions.width, height: dimensions.height }}
            data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
            data-ad-slot="XXXXXXXXXX"
            data-ad-format="auto"
            data-full-width-responsive="true">
          </ins>
        */}

        {/* Placeholder for development - Remove in production */}
        <div className="ad-placeholder">
          <span className="ad-placeholder-label">Advertisement</span>
          <span className="ad-placeholder-size">
            {dimensions.width}x{dimensions.height}
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * Affiliate Link Component
 *
 * For affiliate marketing links (car dealers, insurance, etc.)
 */
interface AffiliateLinkProps {
  href: string;
  children: React.ReactNode;
  campaign?: string;
  className?: string;
}

export function AffiliateLink({
  href,
  children,
  campaign = "default",
  className = "",
}: AffiliateLinkProps) {
  const handleClick = () => {
    // Track affiliate click with Google Analytics
    try {
      // @ts-expect-error - gtag is added by Google's script
      if (window.gtag) {
        // @ts-expect-error
        window.gtag("event", "affiliate_click", {
          event_category: "affiliate",
          event_label: campaign,
          transport_type: "beacon",
        });
      }
    } catch (error) {
      console.log("Analytics not loaded");
    }
  };

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className={`affiliate-link ${className}`}
      onClick={handleClick}
    >
      {children}
    </a>
  );
}

/**
 * Sponsored Content Card
 *
 * For native advertising / sponsored content
 */
interface SponsoredCardProps {
  title: string;
  description: string;
  image?: string;
  href: string;
  sponsor: string;
  className?: string;
}

export function SponsoredCard({
  title,
  description,
  image,
  href,
  sponsor,
  className = "",
}: SponsoredCardProps) {
  return (
    <div className={`sponsored-card ${className}`}>
      <div className="sponsored-badge">Sponsored by {sponsor}</div>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className="sponsored-link"
      >
        {image && <img src={image} alt={title} className="sponsored-image" />}
        <div className="sponsored-content">
          <h4 className="sponsored-title">{title}</h4>
          <p className="sponsored-description">{description}</p>
        </div>
      </a>
    </div>
  );
}

export default AdBanner;
