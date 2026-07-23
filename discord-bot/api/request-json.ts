const DEFAULT_TIMEOUT_MS = 10_000;
const RETRYABLE_STATUS_CODES = new Set([408, 413, 429, 500, 502, 503, 504, 521, 522, 524]);

class NonRetryableRequestError extends Error {}

type RequestJsonOptions = {
    headers?: Record<string, string>;
    method?: 'GET' | 'POST';
    retryLimit?: number;
    timeoutMs?: number;
};

export const requestJson = async <T>(
    url: string,
    {headers, method = 'GET', retryLimit, timeoutMs = DEFAULT_TIMEOUT_MS}: RequestJsonOptions = {},
): Promise<T> => {
    let lastError: unknown;
    const attempts = retryLimit ?? (method === 'GET' ? 10 : 0);

    for (let attempt = 0; attempt <= attempts; attempt += 1) {
        try {
            const response = await fetch(url, {
                headers,
                method,
                signal: AbortSignal.timeout(timeoutMs),
            });

            if (!response.ok) {
                const RequestError = RETRYABLE_STATUS_CODES.has(response.status) ? Error : NonRetryableRequestError;
                throw new RequestError(`Request failed with HTTP ${response.status}`);
            }

            try {
                return (await response.json()) as T;
            } catch (error) {
                throw new NonRetryableRequestError('Response body is not valid JSON', {cause: error});
            }
        } catch (error) {
            if (error instanceof NonRetryableRequestError) {
                throw error;
            }

            lastError = error;

            if (attempt < attempts) {
                const retryDelayMs = Math.min(250 * 2 ** attempt, 2_000);
                await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
            }
        }
    }

    throw lastError;
};
