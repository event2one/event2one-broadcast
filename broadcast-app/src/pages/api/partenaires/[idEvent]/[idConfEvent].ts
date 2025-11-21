import type { NextApiRequest, NextApiResponse } from 'next';
import { getPartenaires2 } from '@/lib/db';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { idEvent, idConfEvent } = req.query;

    if (!idEvent || !idConfEvent) {
        return res.status(400).json({ error: 'Missing required parameters' });
    }

    try {
        const partenaires = await getPartenaires2({
            idEvent: idEvent as string,
            idConfEvent: idConfEvent as string
        });
        res.status(200).json(partenaires);
    } catch (error) {
        console.error('Error fetching partenaires:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
