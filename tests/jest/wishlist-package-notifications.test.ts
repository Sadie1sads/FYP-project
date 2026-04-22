jest.mock('@/dbConnection/dbConnection', () => ({
  connect: jest.fn(),
}))

jest.mock('@/models/wishlistModel', () => ({
  __esModule: true,
  default: {
    findOne: jest.fn(),
    create: jest.fn(),
  },
}))

jest.mock('@/models/travelPackage', () => ({
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

import Wishlist from '@/models/wishlistModel'
import TravelPackage from '@/models/travelPackage'
import jwt from 'jsonwebtoken'
import { POST as wishlistLocationPOST } from '@/app/api/wishlist/location/route'
import { POST as joinPackagePOST } from '@/app/api/packages/[packageId]/join/route'
import { GET as notificationsGET } from '@/app/api/notifications/route'

const WishlistMock = Wishlist as any
const TravelPackageMock = TravelPackage as any
const jwtMock = jwt as any

function makeJsonRequest(body: unknown, token?: string) {
  return {
    cookies: {
      get: jest.fn().mockReturnValue(token ? { value: token } : undefined),
    },
    json: jest.fn().mockResolvedValue(body),
  } as any
}

describe('wishlist, package, and notification automation tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    process.env.TOKEN_SECRET = 'test-secret'
  })
  test('wishlist location route normalizes input', async () => {
    jwtMock.verify.mockReturnValue({ id: 'user-1' })

    const save = jest.fn().mockResolvedValue(undefined)
    const wishlistDoc = {
      locations: [],
      posts: [],
      save,
    }

    WishlistMock.findOne.mockResolvedValue(wishlistDoc)

    const request = makeJsonRequest({ name: '  PoKhArA  ' }, 'valid-token')

    const response = await wishlistLocationPOST(request)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.wishlist.locations).toEqual(['pokhara'])
    expect(save).toHaveBeenCalled()
  })

  test('package join prevents duplicate join', async () => {
    jwtMock.verify.mockReturnValue({ id: 'user-1' })

    TravelPackageMock.findById.mockResolvedValue({
      joinedUsers: [
        {
          userId: {
            toString: () => 'user-1',
          },
        },
      ],
    })

    const request = makeJsonRequest(
      {
        fullName: 'Test User',
        address: 'Street 1',
        city: 'Pokhara',
        contactNumber: '9800000000',
      },
      'valid-token'
    )

    const response = await joinPackagePOST(request, {
      params: Promise.resolve({ packageId: 'package-1' }),
    })
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body.error).toBe('Already joined')
  })

  test('notifications route returns 401 without token', async () => {
    const request = {
      cookies: {
        get: jest.fn().mockReturnValue(undefined),
      },
    } as any

    const response = await notificationsGET(request)
    const body = await response.json()

    expect(response.status).toBe(401)
    expect(body.error).toBe('Unauthorized')
  })
})