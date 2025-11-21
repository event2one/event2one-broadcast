/** @type {import('next').NextConfig} */
const nextConfig = {
    basePath: '/broadcast',
    assetPrefix: '/broadcast',
    reactStrictMode: true,
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'www.mlg-consulting.com',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'www.iplocate.com',
                port: '',
                pathname: '/**',
            },
        ],
    },
}

module.exports = nextConfig
