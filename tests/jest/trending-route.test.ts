jest.mock('@/dbConnection/dbConnection', () => ({
  connect: jest.fn(),
}))

jest.mock('@/models/createTravelPost', () => ({
  __esModule: true,
  default: {
    aggregate: jest.fn(),
    find: jest.fn(),
  },
}))

import TravelPost from '@/models/createTravelPost'
import { GET as trendingGET } from '@/app/api/Posts/trending/route'

const TravelPostMock = TravelPost as any

describe('trending route automation tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('trending route caps limit at 20', async () => {
    TravelPostMock.aggregate.mockResolvedValue([])

    const lean = jest.fn().mockResolvedValue([])
    const populateSecond = jest.fn().mockReturnValue({ lean })
    const populateFirst = jest.fn().mockReturnValue({ populate: populateSecond })
    const sort = jest.fn().mockReturnValue({ populate: populateFirst })

    TravelPostMock.find.mockReturnValue({ sort })

    const request = {
      nextUrl: new URL('http://localhost/api/Posts/trending?limit=999'),
    } as any

    const response = await trendingGET(request)
    const body = await response.json()

    const pipeline = TravelPostMock.aggregate.mock.calls[0][0]

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(pipeline[pipeline.length - 1]).toEqual({ $limit: 20 })
  })
})