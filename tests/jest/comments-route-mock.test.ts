jest.mock('@/dbConnection/dbConnection', () => ({
  connect: jest.fn(),
}))

jest.mock('@/models/createTravelPost', () => ({
  __esModule: true,
  default: {
    findById: jest.fn(),
  },
}))

jest.mock('jsonwebtoken', () => ({
  __esModule: true,
  default: {
    verify: jest.fn(),
  },
}))

import jwt from 'jsonwebtoken'
import { POST as commentPOST } from '@/app/api/Posts/[postId]/comments/route'

const jwtMock = jwt as any

function makeJsonRequest(body: unknown, token?: string) {
  return {
    cookies: {
      get: jest.fn().mockReturnValue(token ? { value: token } : undefined),
    },
    json: jest.fn().mockResolvedValue(body),
  } as any
}

describe('comments mock tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    process.env.TOKEN_SECRET = 'test-secret'
  })

  test('comment route rejects blank text', async () => {
    jwtMock.verify.mockReturnValue({ id: 'user-1' })

    const request = makeJsonRequest({ text: '   ' }, 'valid-token')

    const response = await commentPOST(request, {
      params: Promise.resolve({ postId: 'post-1' }),
    })
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body.error).toBe('Comment text is required')
  })
})