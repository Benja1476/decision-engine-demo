/** @type {import('next').NextConfig} */
const isGithubPages = process.env.BUILD_TARGET === "github-pages";
const repoName = "decision-engine-demo";

const nextConfig = {
  images: {
    unoptimized: true,
  },
  ...(isGithubPages
    ? {
        output: "export",
        basePath: `/${repoName}`,
        assetPrefix: `/${repoName}/`,
      }
    : {}),
};

module.exports = nextConfig;
