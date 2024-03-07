/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
     remotePatterns: [
        {
            hostname: "grateful-vulture-321.convex.cloud",
        }
     ]
    }
};

export default nextConfig;
