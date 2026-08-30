import { ImageResponse } from "next/og";

export const alt = "Pak Multilinks Hygiene — wholesale tissue and hygiene supplies in Lahore";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "72px 78px", background: "#edf5ef", color: "#153d2a" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}><div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 72, height: 72, borderRadius: 14, background: "#174f31", color: "white", fontSize: 28, fontWeight: 800 }}>PM</div><div style={{ display: "flex", flexDirection: "column" }}><span style={{ fontSize: 30, fontWeight: 800 }}>Pak Multilinks Hygiene</span><span style={{ marginTop: 5, fontSize: 20, color: "#587064" }}>Corporate Supplies · Lahore</span></div></div>
      <div style={{ display: "flex", flexDirection: "column", maxWidth: 940 }}><span style={{ fontSize: 66, lineHeight: 1.05, letterSpacing: "-3px", fontWeight: 800 }}>Wholesale tissue and hygiene supplies by carton.</span><span style={{ marginTop: 28, fontSize: 25, color: "#4e6858" }}>For offices, institutions and commercial customers.</span></div>
      <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 20, fontWeight: 700, color: "#174f31" }}><span>Products</span><span style={{ color: "#8ea598" }}>•</span><span>Bulk quotations</span><span style={{ color: "#8ea598" }}>•</span><span>Direct support</span></div>
    </div>,
    size,
  );
}
