import { VercelRequest, VercelResponse } from '@vercel/node';

const BACKEND_URL = 'http://20.200.128.45:3000';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET,OPTIONS,PATCH,DELETE,POST,PUT'
  );
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // Extract the path from the request
    const path = Array.isArray(req.query.path)
      ? req.query.path.join('/')
      : req.query.path || '';
    const targetUrl = `${BACKEND_URL}/${path}`;

    // Prepare headers for the backend request
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Forward authorization header if present
    if (req.headers.authorization) {
      headers.Authorization = req.headers.authorization;
    }

    // Forward other relevant headers
    const headersToForward = [
      'x-api-key',
      'x-api-key-id',
      'x-client-id',
      'x-client-secret',
    ];
    headersToForward.forEach((header) => {
      if (req.headers[header]) {
        headers[header] = req.headers[header] as string;
      }
    });

    // Make the request to the backend
    const response = await fetch(targetUrl, {
      method: req.method,
      headers,
      body:
        req.method !== 'GET' && req.method !== 'HEAD'
          ? JSON.stringify(req.body)
          : undefined,
    });

    // Get response data
    const data = await response.text();
    let jsonData;

    try {
      jsonData = JSON.parse(data);
    } catch {
      jsonData = data;
    }

    // Set response status and headers
    res.status(response.status);

    // Forward response headers
    response.headers.forEach((value, key) => {
      if (key.toLowerCase() !== 'content-encoding') {
        res.setHeader(key, value);
      }
    });

    // Send the response
    res.json(jsonData);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({
      error: 'Proxy request failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
