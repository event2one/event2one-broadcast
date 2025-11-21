import type { NextApiRequest, NextApiResponse } from 'next';
import { connection } from '@/lib/db';

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
        const updatePromises = order.map(item => {
            return new Promise((resolve, reject) => {
                const sql = "UPDATE conferenciers SET ordre = ? WHERE id_conferencier = ?";
                connection.query(sql, [item.order, item.id_conferencier], (err: any, result: any) => {
                    if (err) reject(err);
                    else resolve(result);
                });
            });
        });

        await Promise.all(updatePromises);

        res.status(200).json({ success: true, message: "Order updated successfully." });
    } catch (error) {
        console.error("Failed to update conferencier order:", error);
        res.status(500).json({ success: false, message: "Error updating order." });
    }
}
