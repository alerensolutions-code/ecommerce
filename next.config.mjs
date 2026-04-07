/** @type {import('next').Config} */
const nextConfig = {
  reactStrictMode: true,
  // Add any external domains for images if needed, or specific App router settings
experimental: {
    typedRoutes: false, // <-- Esto frena los errores falsos de compilación
  }
};

export default nextConfig;
