export interface LeadData {
  phone?: string | null;
  customerName?: string | null;
  city?: string | null;
  state?: string | null;
  rtcDepotCode?: string | null;
  rtcLandmark?: string | null;
  eventType: string; // 'CHECKOUT_STARTED' | 'PAYMENT_INTENT' | 'PAYMENT_SUBMITTED'
}

export interface LeadScoreResult {
  score: number;
  badge: string;
  color: string; // Hex color code
}

export function calculateLeadScore(data: LeadData): LeadScoreResult {
  let score = 0;

  // 1. Phone number entered (+20)
  if (data.phone && data.phone.trim().length >= 10) {
    score += 20;
  }

  // 2. Address/Depot entered (+30)
  // Check if they entered city, state, and at least some RTC cargo info
  const hasCity = !!(data.city && data.city.trim());
  const hasState = !!(data.state && data.state.trim());
  const hasDepot = !!(data.rtcDepotCode && data.rtcDepotCode.trim());
  const hasLandmark = !!(data.rtcLandmark && data.rtcLandmark.trim().length >= 3);

  if (hasCity && hasState && hasDepot && hasLandmark) {
    score += 30;
  } else if (hasCity || hasDepot) {
    // Partial address
    score += 15;
  }

  // 3. Reached payment step (+50)
  if (data.eventType === "PAYMENT_INTENT") {
    score += 50;
  } else if (data.eventType === "PAYMENT_SUBMITTED") {
    // Reached payment step AND submitted
    score += 50;
  }

  // 4. Submitted UTR (+80)
  if (data.eventType === "PAYMENT_SUBMITTED") {
    score += 80;
  }

  // Determine badge and color
  let badge = "🟡 LOW INTENT";
  let color = "#E65100"; // Amber/warning for low/medium

  if (score >= 100) {
    badge = "🟢 PAYMENT SENT";
    color = "#2E7D32"; // Green success
  } else if (score >= 50) {
    badge = "🟠 HIGH INTENT";
    color = "#DE8A24"; // Deep Orange/accent
  }

  return {
    score: Math.min(score, 180), // Cap at maximum possible (20 + 30 + 50 + 80 = 180)
    badge,
    color,
  };
}
