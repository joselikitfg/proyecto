const { defineConfig } = require('cypress')

module.exports = defineConfig({
  e2e: {
    supportFile: false,
    video: true,
    videoCompression: true,
    videoCompression: 8,
    baseUrl: 'https://feature-frontend-gh-deploy.dpfhq9pfczcez.amplifyapp.com',
  },
  
})