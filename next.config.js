/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'img.clerk.com',
            },
            {
                protocol: 'https',
                hostname: 'raw.githubusercontent.com',
            },
            {
                protocol: 'https',
                hostname: 'res.cloudinary.com',
            },
            {
                protocol: 'https',
                hostname: 'i.imgur.com',
            },
            {
                protocol: 'https',
                hostname: 'imgur.com',
            },
            {
                protocol: 'https',
                hostname: 'ui-avatars.com',
            },
            {
                protocol: 'https'
                ,
                hostname: 'api.dicebear.com',
            }
        ],
    },
    async rewrites() {
        return [
          {
            source: '/__/:path*',
            destination: `https://login-and-sign-up-e39e4.firebaseapp.com/__/:path*`,
          },
        ];
    },
};

module.exports = nextConfig;
