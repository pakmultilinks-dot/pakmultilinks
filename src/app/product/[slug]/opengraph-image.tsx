import { ImageResponse } from "next/og";
import { getPrice } from "@/lib/catalog";
import { getPublicProduct } from "@/lib/catalog-server";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function ProductOpenGraphImage({ params }: Props) {
  const { slug } = await params;
  const product = await getPublicProduct(slug);

  if (!product) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            background: "#123b24",
            color: "#ffffff",
          }}
        >
          <span style={{ fontSize: 48, fontWeight: 800 }}>Pak Multilinks Hygiene</span>
          <span style={{ fontSize: 24, marginTop: 12, color: "#a5d6b8" }}>Wholesale Hygiene Supplies · Lahore</span>
        </div>
      ),
      size
    );
  }

  const price = getPrice(product);
  const formattedPrice = price > 0 ? `Rs. ${price.toLocaleString()}` : "Rate on Request";
  const cartonMode = (product.unitsPerCarton ?? 0) > 1;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background: "linear-gradient(135deg, #0d2818 0%, #174229 60%, #1e5434 100%)",
          color: "#ffffff",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        {/* Top Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 56,
                height: 56,
                borderRadius: 14,
                background: "#22c55e",
                color: "#0d2818",
                fontSize: 26,
                fontWeight: 900,
              }}
            >
              PM
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.5px" }}>
                Pak Multilinks Hygiene
              </span>
              <span style={{ fontSize: 16, color: "#a3e635", fontWeight: 600 }}>
                Wholesale Corporate Supplies · Lahore
              </span>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(255, 255, 255, 0.12)",
              padding: "10px 20px",
              borderRadius: 999,
              border: "1px solid rgba(255, 255, 255, 0.2)",
              fontSize: 16,
              fontWeight: 700,
              color: "#e2e8f0",
            }}
          >
            SKU: {product.sku}
          </div>
        </div>

        {/* Middle Product Details */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 1040 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span
              style={{
                background: "#22c55e",
                color: "#064e3b",
                padding: "6px 16px",
                borderRadius: 8,
                fontSize: 18,
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "1px",
              }}
            >
              {product.brand}
            </span>
            <span style={{ fontSize: 20, color: "#cbd5e1" }}>•</span>
            <span style={{ fontSize: 20, color: "#e2e8f0", fontWeight: 600 }}>
              {product.category}
            </span>
          </div>

          <div
            style={{
              fontSize: 54,
              lineHeight: 1.15,
              fontWeight: 900,
              letterSpacing: "-1.5px",
              color: "#ffffff",
              textShadow: "0 2px 10px rgba(0,0,0,0.3)",
            }}
          >
            {product.name}
          </div>
        </div>

        {/* Bottom Bar: Price & Assurance */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid rgba(255, 255, 255, 0.2)",
            paddingTop: 32,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 16, textTransform: "uppercase", letterSpacing: "1.5px", color: "#94a3b8", fontWeight: 700 }}>
              {cartonMode ? "Wholesale Carton Rate" : "Wholesale Piece Rate"}
            </span>
            <span style={{ fontSize: 42, fontWeight: 900, color: "#4ade80", letterSpacing: "-1px" }}>
              {formattedPrice}
              {price > 0 && <span style={{ fontSize: 22, color: "#94a3b8", fontWeight: 600, marginLeft: 8 }}>{cartonMode ? "/ carton" : "/ piece"}</span>}
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                background: "#22c55e",
                color: "#052e16",
                padding: "14px 28px",
                borderRadius: 14,
                fontSize: 20,
                fontWeight: 800,
              }}
            >
              Direct Delivery in Lahore · Order on WhatsApp
            </div>
          </div>
        </div>
      </div>
    ),
    size
  );
}
