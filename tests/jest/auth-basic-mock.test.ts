jest.mock('@/dbConnection/dbConnection', () => ({
  connect: jest.fn(),
}))

jest.mock('@/models/userModel', () => ({
  __esModule: true,
  default: {
    findOne: jest.fn(),
  },
}))

import { POST as loginPOST } from '@/app/api/users/login/route'

function makeJsonRequest(body: unknown) {
  return {
    json: jest.fn().mockResolvedValue(body),
  } as any
}
describe('basic auth mock tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('login without email', async () => {
    const request = makeJsonRequest({
      email: '',
      password: 'somepass',
    })

    const response = await loginPOST(request)
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body.message).toBe('Email and password are required')
  })
})