import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { url } = req.query;

    if (!url || typeof url !== 'string') {
        return res.status(400).json({ error: 'Missing or invalid url parameter' });
    }

    try {
        const response = await fetch(url);
        const contentType = response.headers.get('content-type') || 'text/html';

        // Forward the content type
        res.setHeader('Content-Type', contentType);

        // Remove X-Frame-Options to allow iframe embedding
        res.removeHeader('X-Frame-Options');

        const body = await response.text();
        res.status(response.status).send(body);
    } catch (error) {
        console.error('Proxy error:', error);
        res.status(500).json({ error: 'Failed to fetch content' });
    }
}
