jest.mock('@/dbConnection/dbConnection', () => ({
  connect: jest.fn(),
}))

jest.mock('@/models/userModel', () => ({
  __esModule: true,
  default: {
    findOne: jest.fn(),
    findById: jest.fn(),
  },
}))

jest.mock('bcryptjs', () => ({
  __esModule: true,
  default: {
    compare: jest.fn(),
    genSalt: jest.fn(),
    hash: jest.fn(),
  },
}))

jest.mock('jsonwebtoken', () => ({
  __esModule: true,
  default: {
    sign: jest.fn(),
    verify: jest.fn(),
  },
}))

jest.mock('@/helpers/mailHelper', () => ({
  sendEmail: jest.fn(),
}))

import User from '@/models/userModel'
import bcryptjs from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { POST as signupPOST } from '@/app/api/users/signup/route'
import { POST as loginPOST } from '@/app/api/users/login/route'
import { GET as meGET } from '@/app/api/users/me/route'
import { GET as logoutGET } from '@/app/api/users/logout/route'

const UserMock = User as any
const bcryptMock = bcryptjs as any
const jwtMock = jwt as any

function makeJsonRequest(body: unknown, token?: string) {
  return {
    cookies: {
      get: jest.fn().mockReturnValue(token ? { value: token } : undefined),
    },
    json: jest.fn().mockResolvedValue(body),
  } as any
}

function makeCookieOnlyRequest(token?: string) {
  return {
    cookies: {
      get: jest.fn().mockReturnValue(token ? { value: token } : undefined),
    },
  } as any
}

describe('auth route automation tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    process.env.TOKEN_SECRET = 'test-secret'
  })

  test('signup rejects missing fields', async () => {
    const request = makeJsonRequest({
      username: '',
      email: '',
      password: '',
      confirmpassword: '',
    })

    const response = await signupPOST(request)
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body.message).toBe('All fields are required')
  })

  test('signup rejects weak password', async () => {
    const request = makeJsonRequest({
      username: 'testuser',
      email: 'test@example.com',
      password: 'weakpass',
      confirmpassword: 'weakpass',
    })

    const response = await signupPOST(request)
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body.message).toContain('Password must be at least 8 characters')
  })

  test('login sets token cookie on success', async () => {
    UserMock.findOne.mockResolvedValue({
      _id: 'user-1',
      username: 'demo',
      email: 'demo@example.com',
      password: 'hashed-password',
      isAdmin: false,
      isVerified: true,
    })
    bcryptMock.compare.mockResolvedValue(true)
    jwtMock.sign.mockReturnValue('signed-token')

    const request = makeJsonRequest({
      email: 'demo@example.com',
      password: 'correct-password',
    })

    const response = await loginPOST(request)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(response.headers.get('set-cookie')).toContain('token=signed-token')
  })

  test('/api/users/me returns 401 without token', async () => {
    const request = makeCookieOnlyRequest()

    const response = await meGET(request)
    const body = await response.json()

    expect(response.status).toBe(401)
    expect(body.message).toBe('Not authenticated')
  })

  test('logout clears token cookie', async () => {
    const request = {} as any

    const response = await logoutGET(request)

    expect(response.status).toBe(200)
    expect(response.headers.get('set-cookie')).toContain('token=')
    expect(response.headers.get('set-cookie')).toContain('Expires=')
  })
})