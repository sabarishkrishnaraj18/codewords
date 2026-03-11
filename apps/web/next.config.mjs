import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '../..')

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  webpack: (config) => {
    // Force socket.io packages to use CJS builds to avoid esm-debug broken deps
    config.resolve.alias = {
      ...config.resolve.alias,
      'socket.io-client': path.join(root, 'node_modules/socket.io-client/build/cjs/index.js'),
      'socket.io-parser': path.join(root, 'node_modules/socket.io-parser/build/cjs/index.js'),
    }
    return config
  },
}

export default nextConfig
