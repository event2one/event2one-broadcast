import type { NextApiRequest, NextApiResponse } from 'next';
import { connection } from '@/lib/db';
import axios from 'axios';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { order } = req.body;

    if (!order || !Array.isArray(order)) {
        return res.status(400).json({ success: false, message: "Invalid data format." });
    }

    try {
        // Create URLSearchParams for the external API
        const params = new URLSearchParams();
        params.append('order', JSON.stringify(order));

        // Call the external API
        const response = await axios.post(
            'https://www.mlg-consulting.com/smart_territory/form/api.php?action=updateConferencierOrder',
            params
        );

        if (!response.data) {
            throw new Error(`PHP API responded with empty data.`);
        }

        res.status(200).json({ success: true, message: "Order updated successfully." });
    } catch (error) {
        console.error("Failed to update conferencier order:", error);
        res.status(500).json({ success: false, message: "Error updating order." });
    }
}
