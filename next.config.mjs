/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
     remotePatterns: [
        {
            hostname: "sensible-bee-569.convex.cloud",
        }
     ]
    }
};

export default nextConfig;
