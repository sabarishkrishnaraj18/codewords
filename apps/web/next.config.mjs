import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '../..')

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  webpack: (config) => {
    // exFAT drive workaround: force CJS builds when running from monorepo root
    const socketClientPath = path.join(root, 'node_modules/socket.io-client/build/cjs/index.js')
    if (fs.existsSync(socketClientPath)) {
      config.resolve.alias = {
        ...config.resolve.alias,
        'socket.io-client': socketClientPath,
        'socket.io-parser': path.join(root, 'node_modules/socket.io-parser/build/cjs/index.js'),
      }
    }
    return config
  },
}

export default nextConfig
