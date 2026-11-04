declare global {
  /**
   * Appwrite Function Context
   */
  interface Context {
    /**
     * The request object contains all data regarding the function execution request.
     */
    req: AppwriteRequest;

    /**
     * The response object allows you to return a response to the execution.
     */
    res: AppwriteResponse;

    /**
     * Log a message to the Appwrite Console.
     * @param message The message to log.
     */
    log: (message: any) => void;

    /**
     * Log an error to the Appwrite Console.
     * @param message The error message to log.
     */
    error: (message: any) => void;
  }

  interface AppwriteRequest {
    /**
     * Raw request body text.
     */
    bodyText: string;

    /**
     * Parsed JSON request body (if valid JSON).
     */
    bodyJson: Record<string, any>;

    /**
     * Binary request body.
     */
    bodyBinary: ArrayBuffer;

    /**
     * Request headers as a key-value object.
     */
    headers: Record<string, string>;

    /**
     * Request method (GET, POST, etc.).
     */
    method: string;

    /**
     * Request URL path (e.g., "/v1/hooks").
     */
    path: string;

    /**
     * Raw query string (e.g., "limit=10&offset=0").
     */
    queryString: string;

    /**
     * Parsed query parameters.
     */
    query: Record<string, string>;

    /**
     * Request scheme (http or https).
     */
    scheme: string;

    /**
     * Request host.
     */
    host: string;

    /**
     * Request port.
     */
    port: number;

    /**
     * Request URL.
     */
    url: string;
  }

  interface AppwriteResponse {
    /**
     * Returns a text response.
     * @param text Content to return.
     * @param statusCode HTTP status code (default 200).
     * @param headers HTTP headers.
     */
    text: (
      text: string,
      statusCode?: number,
      headers?: Record<string, string>
    ) => void;

    /**
     * Returns a JSON response.
     * @param obj Object to return as JSON.
     * @param statusCode HTTP status code (default 200).
     * @param headers HTTP headers.
     */
    json: (
      obj: any,
      statusCode?: number,
      headers?: Record<string, string>
    ) => void;

    /**
     * Returns an empty response (204 No Content).
     */
    empty: () => void;

    /**
     * Redirects the client.
     * @param url URL to redirect to.
     * @param statusCode HTTP status code (default 301).
     * @param headers HTTP headers.
     */
    redirect: (
      url: string,
      statusCode?: number,
      headers?: Record<string, string>
    ) => void;

    /**
     * Returns a binary response.
     * @param bytes Binary content.
     * @param statusCode HTTP status code (default 200).
     * @param headers HTTP headers.
     */
    binary: (
      bytes: ArrayBuffer | Buffer,
      statusCode?: number,
      headers?: Record<string, string>
    ) => void;
  }
}

export {};
