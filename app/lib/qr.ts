import "server-only";
import QRCode from "qrcode";

// Generate an inline-renderable SVG data URL for any payload.
// Used to encode UPI deep links so customers scan and pay with the amount pre-filled.
export async function generateQrSvgDataUrl(payload: string): Promise<string> {
  const svg = await QRCode.toString(payload, {
    type: "svg",
    errorCorrectionLevel: "M",
    margin: 1,
    width: 320,
    color: {
      dark: "#1B330F",   // brand-primary-green
      light: "#FDF6E3",  // brand-cream
    },
  });
  // Inline SVG — small, sharp at any size, no extra HTTP round-trip.
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
