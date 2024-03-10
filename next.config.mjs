/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
     remotePatterns: [
        {
            hostname: "opulent-finch-45.convex.cloud",
        }
     ]
    }
};

export default nextConfig;
