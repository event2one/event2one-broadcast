'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { io, Socket } from 'socket.io-client';

export default function Screen() {
    const router = useRouter();
    const { id } = router.query;
    const screenId = id as string;

    const [iframeSrc, setIframeSrc] = useState('');

    console.log(`Screen ${screenId} connected and joined ${room}`);

    // Listen for media container updates
    socket.on('updateMediaContainer', (data: { screenId: string, iframeSrc: string }) => {
        console.log('Received updateMediaContainer:', data);
        if (data.screenId === screenId) {
            setIframeSrc(data.iframeSrc);
        }
    });

    // Cleanup on unmount
    return () => {
        socket.disconnect();
    };
}, [screenId]);

return (
    <div className="w-screen h-screen bg-black overflow-hidden">
        {iframeSrc ? (
            <iframe
                src={iframeSrc}
                className="w-full h-full border-0"
                title={`Screen ${screenId}`}
                allow="autoplay; fullscreen"
            />
        ) : (
            <div className="flex items-center justify-center w-full h-full text-white text-2xl">
                Screen {screenId} - Waiting for content...
            </div>
        )}
    </div>
);
}
