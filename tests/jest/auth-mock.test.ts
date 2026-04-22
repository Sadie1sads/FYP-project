jest.mock('@/dbConnection/dbConnection', () => ({
  connect: jest.fn(),
}))

jest.mock('@/models/userModel', () => ({
  __esModule: true,
  default: {
    findOne: jest.fn(),
  },
}))

import User from '@/models/userModel'
import { POST as loginPOST } from '@/app/api/users/login/route'

const UserMock = User as any

function makeJsonRequest(body: unknown) {
  return {
    json: jest.fn().mockResolvedValue(body),
  } as any
}

describe('basic auth mock tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('login with unregistered email', async () => {
    UserMock.findOne.mockResolvedValue(null)

    const request = makeJsonRequest({
      email: 'unknown@example.com',
      password: 'Strong@123',
    })

    const response = await loginPOST(request)
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body.message).toBe('User does not exist')
  })
})