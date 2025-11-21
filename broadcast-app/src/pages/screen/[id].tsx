'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { io, Socket } from 'socket.io-client';

export default function Screen() {
    const router = useRouter();
    const { id } = router.query;
    const screenId = id as string;

    const [iframeSrc, setIframeSrc] = useState('');
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        if (!screenId) return;

        // Connect to Socket.IO server
        // DEBUG: Version check
        console.log('Socket.IO Client [Screen] - v3 - Hostname:', window.location.hostname);

        // Connect to Socket.IO server using relative path (works for both dev and prod)
        socketRef.current = io({ path: '/broadcast/socket.io' });
        const socket = socketRef.current;

        // Join the room for this screen
        const room = `room${screenId}`;
        socket.emit('room', room);

        console.log(`Screen ${screenId} connected and joined ${room}`);

        // Listen for media container updates
        socket.on('updateMediaContainer', (data: { screenId: string, iframeSrc: string }) => {
            console.log('Received updateMediaContainer:', data);
            if (data.screenId === screenId) {
                let src = data.iframeSrc;

                // In development, proxy event2one.com URLs to bypass X-Frame-Options
                const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
                if (isDev && src.includes('event2one.com')) {
                    src = `/broadcast/api/proxy?url=${encodeURIComponent(src)}`;
                    console.log('Using proxy for:', src);
                }

                setIframeSrc(src);
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
