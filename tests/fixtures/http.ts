import { vi } from 'vitest'

/** Stub the fetch boundary with a minimal Response-like object. */
export function mockFetchResponse(body: unknown, status = 200) {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 404 ? 'Not Found' : 'Error',
    json:
      status === 204
        ? vi
            .fn()
            .mockRejectedValue(new Error('204 responses have no JSON body'))
        : vi.fn().mockResolvedValue(body),
  })

  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}
