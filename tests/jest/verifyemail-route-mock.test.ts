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
import { POST as verifyPOST } from '@/app/api/users/verifyemail/route'

const UserMock = User as any

function makeJsonRequest(body: unknown) {
  return {
    json: jest.fn().mockResolvedValue(body),
  } as any
}

describe('verify email mock tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('verify email rejects invalid token', async () => {
    UserMock.findOne.mockResolvedValue(null)

    const request = makeJsonRequest({ token: 'bad-token' })

    const response = await verifyPOST(request)
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body.error).toBe('Invalid Token')
  })
})