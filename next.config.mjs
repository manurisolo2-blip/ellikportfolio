/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "dopamine-three-omega.vercel.app",
      },
      {
        protocol: "https",
        hostname: "deportistasrio3.vercel.app",
      },
      {
        protocol: "https",
        hostname: "mojo-grille-demo.vercel.app",
      },
      {
        protocol: "https",
        hostname: "lungyai.vercel.app",
      },
    ],
  },
};

export default nextConfig;
