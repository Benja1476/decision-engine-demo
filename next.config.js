/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true, // Cloudflare Pages ยังไม่รองรับ next/image optimizer ในตัว
  },
};

module.exports = nextConfig;
