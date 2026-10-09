import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" }
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [{ protocol: "https", hostname: "erpmedia.biz-os.com", pathname: "/**" }]
  },
  experimental: { optimizePackageImports: ["lucide-react"] },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  async redirects() {
    return [
      { source: "/account/:path*", destination: "/dashboard", permanent: true },
      { source: "/account", destination: "/dashboard", permanent: true },
      { source: "/reviews", destination: "/", permanent: true },
      { source: "/checkout/review", destination: "/checkout", permanent: true }
    ];
  }
};

export default nextConfig;
