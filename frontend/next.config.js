/** @type {import('next').NextConfig} */
const nextConfig = {
// this threading issue for building on host servers
// https://docs.uniform.dev/sitecore/deploy/how-tos/how-to-control-nextjs-threads/
experimental: {
	workerThreads:false,
	cpus: 4,
},
webpack: (config, { isServer }) => {
    config.module.rules.push({
      test: /\.(glb|gltf)$/,
      use: [
        {
          loader: 'file-loader',
          options: {
            publicPath: '/_next',
            name: 'static/media/[name].[hash].[ext]',
          },
        },
      ],
    });

    return config;
  },

}

module.exports = nextConfig


