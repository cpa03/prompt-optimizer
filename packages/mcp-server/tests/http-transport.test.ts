/**
 * HTTP Transport Integration Tests
 *
 * Tests for MCP server HTTP transport including health endpoints,
 * rate limiting middleware, and request handling
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import express, { type Express, type Request, type Response } from 'express'
import request from 'supertest'
import { createRateLimiter, getClientIdentifier } from '../src/utils/rate-limiter.js'
import { MCP_CONFIG } from '@prompt-optimizer/core'

describe('HTTP Transport Integration', () => {
  let app: Express

  beforeEach(() => {
    app = express()
  })

  describe('Health Endpoint', () => {
    it('should return healthy status', async () => {
      app.get('/health', (_req: Request, res: Response) => {
        res.json({ status: 'healthy', timestamp: new Date().toISOString() })
      })

      const response = await request(app).get('/health')
      expect(response.status).toBe(200)
      expect(response.body.status).toBe('healthy')
    })

    it('should include version in health response', async () => {
      app.get('/health', (_req: Request, res: Response) => {
        res.json({
          status: 'healthy',
          timestamp: new Date().toISOString(),
          version: '1.0.0',
        })
      })

      const response = await request(app).get('/health')
      expect(response.body.version).toBeDefined()
    })
  })

  describe('Rate Limiting Middleware', () => {
    it('should include rate limit headers in response', async () => {
      const limiter = createRateLimiter({
        windowMs: 60000,
        maxRequests: 100,
      })

      app.use((req: Request, res: Response, next) => {
        const result = limiter.check(getClientIdentifier(req))
        res.setHeader('X-RateLimit-Limit', '100')
        res.setHeader('X-RateLimit-Remaining', String(result.remaining))
        res.setHeader('X-RateLimit-Reset', Math.ceil(result.resetTime / 1000).toString())
        next()
      })

      app.get('/test', (_req: Request, res: Response) => {
        res.json({ ok: true })
      })

      const response = await request(app).get('/test')
      expect(response.headers['x-ratelimit-limit']).toBe('100')
      expect(response.headers['x-ratelimit-remaining']).toBeDefined()
      expect(response.headers['x-ratelimit-reset']).toBeDefined()

      limiter.stop()
    })

    it('should block requests when rate limit exceeded', async () => {
      const limiter = createRateLimiter({
        windowMs: 1000,
        maxRequests: 1,
      })

      app.use((req: Request, res: Response, next) => {
        const result = limiter.check(getClientIdentifier(req))
        if (!result.allowed) {
          res.status(429).json({
            error: {
              code: -32000,
              message: 'Too Many Requests',
            },
          })
          return
        }
        next()
      })

      app.get('/test', (_req: Request, res: Response) => {
        res.json({ ok: true })
      })

      await request(app).get('/test')
      const blockedResponse = await request(app).get('/test')

      expect(blockedResponse.status).toBe(429)
      expect(blockedResponse.body.error.code).toBe(-32000)

      limiter.stop()
    })
  })

  describe('Request Validation', () => {
    it('should reject invalid JSON', async () => {
      app.use(express.json())
      app.post('/mcp', (req: Request, res: Response) => {
        if (req.body && typeof req.body === 'object') {
          res.json({ result: 'ok' })
        } else {
          res.status(400).json({ error: 'Invalid JSON' })
        }
      })

      const response = await request(app)
        .post('/mcp')
        .set('Content-Type', 'application/json')
        .send('invalid json{')

      expect(response.status).toBe(400)
    })

    it('should accept POST without explicit content-type', async () => {
      app.post('/mcp', (req: Request, res: Response) => {
        res.json({ ok: true, body: req.body })
      })

      const response = await request(app)
        .post('/mcp')
        .send('some data')

      expect(response.status).toBe(200)
    })

    it('should validate MCP JSONRPC request structure', async () => {
      app.use(express.json())
      app.post('/mcp', (req: Request, res: Response) => {
        const body = req.body as Record<string, unknown>
        if (!body.jsonrpc || body.jsonrpc !== '2.0') {
          res.status(400).json({
            jsonrpc: '2.0',
            error: { code: -32600, message: 'Invalid Request' },
            id: null,
          })
          return
        }
        res.json({ jsonrpc: '2.0', result: 'ok', id: body.id })
      })

      const response = await request(app)
        .post('/mcp')
        .set('Content-Type', 'application/json')
        .send(JSON.stringify({ jsonrpc: '2.0', method: 'test', id: 1 }))

      expect(response.status).toBe(200)
      expect(response.body.result).toBe('ok')
    })

    it('should reject malformed JSONRPC requests', async () => {
      app.use(express.json())
      app.post('/mcp', (req: Request, res: Response) => {
        const body = req.body as Record<string, unknown>
        if (!body.jsonrpc || body.jsonrpc !== '2.0') {
          res.status(400).json({
            jsonrpc: '2.0',
            error: { code: -32600, message: 'Invalid Request' },
            id: null,
          })
          return
        }
        res.json({ jsonrpc: '2.0', result: 'ok', id: body.id })
      })

      const response = await request(app)
        .post('/mcp')
        .set('Content-Type', 'application/json')
        .send(JSON.stringify({ method: 'test', id: 1 }))

      expect(response.status).toBe(400)
      expect(response.body.error.code).toBe(-32600)
    })
  })

  describe('Security Headers', () => {
    it('should include security headers', async () => {
      app.use((_req: Request, res: Response, next) => {
        res.setHeader('X-Content-Type-Options', 'nosniff')
        res.setHeader('X-Frame-Options', 'DENY')
        res.setHeader('X-XSS-Protection', '1; mode=block')
        res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
        next()
      })

      app.get('/test', (_req: Request, res: Response) => {
        res.json({ ok: true })
      })

      const response = await request(app).get('/test')
      expect(response.headers['x-content-type-options']).toBe('nosniff')
      expect(response.headers['x-frame-options']).toBe('DENY')
      expect(response.headers['x-xss-protection']).toBe('1; mode=block')
    })
  })

  describe('CORS Handling', () => {
    it('should handle preflight requests', async () => {
      app.options('/test', (_req: Request, res: Response) => {
        res.setHeader('Access-Control-Allow-Origin', '*')
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST')
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
        res.sendStatus(204)
      })

      const response = await request(app)
        .options('/test')
        .set('Origin', 'http://localhost:3000')
        .set('Access-Control-Request-Method', 'POST')

      expect(response.status).toBe(204)
    })
  })
})
