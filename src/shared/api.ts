export interface ApiError {
  code: string
  message: string
  retryable: boolean
}

export class ApiFailure extends Error {
  constructor(
    public error: ApiError,
    public status: number,
  ) {
    super(error.message)
  }
}
export async function request<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const response = await fetch(`/v1${path}`, {
    ...init,
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json', ...init.headers },
  })
  if (!response.ok) {
    let error: ApiError = {
      code: 'requestFailed',
      message: `Request failed (${response.status})`,
      retryable: response.status >= 500,
    }
    try {
      error = ((await response.json()) as { error: ApiError }).error
    } catch {
      /* proxy/network error */
    }
    throw new ApiFailure(error, response.status)
  }
  return response.json() as Promise<T>
}
