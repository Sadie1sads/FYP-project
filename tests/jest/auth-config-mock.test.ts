jest.mock('@/dbConnection/dbConnection', () => ({
  connect: jest.fn(),
}))

jest.mock('@/models/userModel', () => ({
  __esModule: true,
  default: {
    findOne: jest.fn(),
  },
}))

jest.mock('bcryptjs', () => ({
  __esModule: true,
  default: {
    compare: jest.fn(),
  },
}))

import User from '@/models/userModel'
import bcryptjs from 'bcryptjs'
import { POST as loginPOST } from '@/app/api/users/login/route'

const UserMock = User as any
const bcryptMock = bcryptjs as any

function makeJsonRequest(body: unknown) {
  return {
    json: jest.fn().mockResolvedValue(body),
  } as any
}

describe('auth configuration mock tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('login fails when TOKEN_SECRET is missing', async () => {
    const originalSecret = process.env.TOKEN_SECRET
    delete process.env.TOKEN_SECRET

    UserMock.findOne.mockResolvedValue({
      _id: 'user-1',
      username: 'demo',
      email: 'demo@example.com',
      password: 'hashed-password',
      isAdmin: false,
      isVerified: true,
    })

    bcryptMock.compare.mockResolvedValue(true)

    const request = makeJsonRequest({
      email: 'demo@example.com',
      password: 'correct-password',
    })

    const response = await loginPOST(request)
    const body = await response.json()

    expect(response.status).toBe(500)
    expect(body.message).toBe('Server misconfigured: TOKEN_SECRET is missing')

    process.env.TOKEN_SECRET = originalSecret
  })
})