import { defineConfig } from 'vite'
import { stat } from 'node:fs/promises'
import { execFile } from 'node:child_process'

export default defineConfig({
  plugins: [{
    name: 'refresh-local-github-calendar',
    configureServer(server) {
      let nextCheck = 0
      server.middlewares.use('/github-calendar.png', async (_req, _res, next) => {
        const now = Date.now()
        if (now >= nextCheck) {
          nextCheck = now + 600000
          const previous = await stat('public/github-calendar.png').catch(() => null)
          if (!previous || now - previous.mtimeMs > 21600000) {
            execFile(process.execPath, ['scripts/capture-calendar.mjs'], error => {
              if (error) server.config.logger.warn('Could not refresh GitHub calendar: ' + error.message)
            })
          }
        }
        next()
      })
    },
  }],
})
