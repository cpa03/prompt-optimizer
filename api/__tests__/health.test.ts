/**
 * Unit tests for health.js API endpoint
 *
 * Tests cover:
 * - GET request handling
 * - Security headers
 * - Response format validation
 * - Method not allowed handling
 */

import { describe, it, expect, vi } from 'vitest'

const mockRes = () => {
  const headers: Record<string, string> = {}
  const json = vi.fn((data) => {
    headers['X-Response-Time'] = '0ms'
    return { status: 200, json: data }
  })
  const setHeader = vi.fn((key: string, value: string) => {
    headers[key] = value
  })
  const status = vi.fn((code: number) => ({
    json,
    end: vi.fn(),
  }))
  return {
    headers,
    setHeader,
    status,
    json,
    end: vi.fn(),
  } as any
}

describe('health API', () => {
  it('should export a handler function', async () => {
    const { default: handler } = await import('../health.js')
    expect(typeof handler).toBe('function')
  })

  it('should return 200 for GET requests', async () => {
    const { default: handler } = await import('../health.js')
    const req = { method: 'GET', headers: {} }
    const res = mockRes()

    handler(req, res)

    expect(res.status).toHaveBeenCalledWith(200)
  })

  it('should return health status data', async () => {
    const { default: handler } = await import('../health.js')
    const req = { method: 'GET', headers: {} }
    const res = mockRes()

    handler(req, res)

    const jsonCall = res.status(200).json.mock.calls[0]
    const healthData = jsonCall[0]

    expect(healthData.status).toBe('ok')
    expect(healthData.timestamp).toBeDefined()
    expect(healthData.requestId).toBeDefined()
    expect(typeof healthData.uptime).toBe('number')
    expect(typeof healthData.memory).toBe('object')
    expect(healthData.memory.heapUsed).toBeDefined()
    expect(healthData.memory.heapTotal).toBeDefined()
    expect(healthData.memory.rss).toBeDefined()
  })

  it('should set security headers', async () => {
    const { default: handler } = await import('../health.js')
    const req = { method: 'GET', headers: {} }
    const res = mockRes()

    handler(req, res)

    expect(res.setHeader).toHaveBeenCalledWith('X-Content-Type-Options', 'nosniff')
    expect(res.setHeader).toHaveBeenCalledWith('X-Frame-Options', 'DENY')
    expect(res.setHeader).toHaveBeenCalledWith('X-XSS-Protection', '1; mode=block')
    expect(res.setHeader).toHaveBeenCalledWith('Referrer-Policy', 'strict-origin-when-cross-origin')
    expect(res.setHeader).toHaveBeenCalledWith('Cache-Control', 'no-store, no-cache, must-revalidate')
  })

  it('should set X-Request-ID header', async () => {
    const { default: handler } = await import('../health.js')
    const req = { method: 'GET', headers: {} }
    const res = mockRes()

    handler(req, res)

    const requestIdCalls = res.setHeader.mock.calls.filter(
      (call: any[]) => call[0] === 'X-Request-ID'
    )
    expect(requestIdCalls.length).toBe(1)
    expect(requestIdCalls[0][1]).toMatch(/^health_\d+_[a-f0-9]+$/)
  })

  it('should return 405 for non-GET requests', async () => {
    const { default: handler } = await import('../health.js')
    const req = { method: 'POST', headers: {} }
    const res = mockRes()

    handler(req, res)

    expect(res.status).toHaveBeenCalledWith(405)
    expect(res.setHeader).toHaveBeenCalledWith('Allow', 'GET')
  })

  it('should return error response for non-GET requests', async () => {
    const { default: handler } = await import('../health.js')
    const req = { method: 'DELETE', headers: {} }
    const res = mockRes()

    handler(req, res)

    const jsonCall = res.status(405).json.mock.calls[0]
    const errorData = jsonCall[0]

    expect(errorData.status).toBe('error')
    expect(errorData.message).toBe('Method not allowed')
    expect(errorData.allowedMethods).toEqual(['GET'])
  })
})
