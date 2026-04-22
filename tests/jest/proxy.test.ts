import jwt from 'jsonwebtoken'
import { proxy } from '@/proxy'

jest.mock('jsonwebtoken', () => ({
  __esModule: true,
  default: {
    verify: jest.fn(),
  },
}))

const mockedJwt = jwt as any

function makeRequest(pathname: string, token?: string) {
  return {
    cookies: {
      get: jest.fn().mockReturnValue(token ? { value: token } : undefined),
    },
    nextUrl: new URL(`http://localhost${pathname}`),
    url: `http://localhost${pathname}`,
  } as any
}

describe('proxy auth automation tests', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  test('redirects /home to /login when token is missing', () => {
    const response = proxy(makeRequest('/home'))

    expect(response.headers.get('location')).toContain('/login')
  })

  test('redirects non-admin user away from /admin', () => {
    mockedJwt.verify.mockReturnValue({ isAdmin: false })

    const response = proxy(makeRequest('/admin', 'valid-token'))

    expect(response.headers.get('location')).toContain('/home')
  })

  test('allows authenticated user to access /home', () => {
    const response = proxy(makeRequest('/home', 'valid-token'))

    expect(response.headers.get('location')).toBeNull()
    expect(response.headers.get('Cache-Control')).toContain('no-store')
  })
})