jest.mock('@/dbConnection/dbConnection', () => ({
  connect: jest.fn(),
}))

jest.mock('@/models/userModel', () => ({
  __esModule: true,
  default: {
    findOne: jest.fn(),
  },
}))

jest.mock('@/helpers/mailHelper', () => ({
  sendEmail: jest.fn(),
}))

import User from '@/models/userModel'
import { POST as signupPOST } from '@/app/api/users/signup/route'

const UserMock = User as any

function makeJsonRequest(body: unknown) {
  return {
    json: jest.fn().mockResolvedValue(body),
  } as any
}

describe('extra auth mock tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('signup rejects duplicate email', async () => {
    UserMock.findOne.mockResolvedValueOnce({
      email: 'test@example.com',
    })

    const request = makeJsonRequest({
      username: 'testuser',
      email: 'test@example.com',
      password: 'Strong@123',
      confirmpassword: 'Strong@123',
    })

    const response = await signupPOST(request)
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body.message).toBe('Email already exists')
  })
})

jest.mock('bcryptjs', () => ({
  __esModule: true,
  default: {
    compare: jest.fn(),
  },
}))

import bcryptjs from 'bcryptjs'
import { POST as loginPOST } from '@/app/api/users/login/route'

const bcryptMock = bcryptjs as any

test('login rejects invalid password', async () => {
  UserMock.findOne.mockResolvedValue({
    _id: 'user-1',
    username: 'demo',
    email: 'demo@example.com',
    password: 'hashed-password',
    isAdmin: false,
    isVerified: true,
  })

  bcryptMock.compare.mockResolvedValue(false)

  const request = makeJsonRequest({
    email: 'demo@example.com',
    password: 'wrong-password',
  })

  const response = await loginPOST(request)
  const body = await response.json()

  expect(response.status).toBe(400)
  expect(body.message).toBe('Invalid email or password')
})