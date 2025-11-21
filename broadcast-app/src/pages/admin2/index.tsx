// src/pages/admin2/index.tsx
import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { fetchInitialData } from '../../utils/api';
import { io } from 'socket.io-client';

// Types for the data you used in the EJS template
interface Partner { /* define fields you need */ }
interface Presta { /* define fields you need */ }
interface EventContactType { /* define fields you need */ }
interface ConfEvent { id_conf_event: number; jury_event: { id_jury_event_enc: string }; conf_event_date: string; heure_debut: string; conf_event_lang: { cel_titre: string }; }

interface AdminPageProps {
    idEvent: number;
    idConfEvent: number;
    confEventList: ConfEvent[];
    confEventContributionList: any[];
    partenaireList: Partner[];
    prestaList: Presta[];
    contactStatutList: any[];
    eventContactTypeList: EventContactType[];
}

const AdminPage: React.FC<AdminPageProps> = (props) => {
    const {
        idEvent,
        idConfEvent,
        confEventList,
        confEventContributionList,
        partenaireList,
        prestaList,
        contactStatutList,
        eventContactTypeList,
    } = props;

    // Example of moving the original JS logic to React hooks
    const [screenId, setScreenId] = useState<string>('');

    useEffect(() => {
        // socket.io client – you can use the official client library
        const socket = io();
        socket.emit('dire_bonjour', { my: 'Bonjour server, je suis admin' });
        socket.on('connect', () => {
            socket.emit('check_connexion', { name: 'admin' });
        });
        // keep socket reference if you need it elsewhere
        return () => {
            socket.disconnect();
        };
    }, []);

    // The rest of the UI (selects, buttons, etc.) can be copied from the EJS file
    // and adapted to use React state instead of direct DOM manipulation.

    return (
        <AdminLayout>
            {/* Header is inside AdminLayout */}
            <div className="container mx-auto p-4">
                {/* Example of a select that used to be rendered by EJS */}
                <select
                    id="screenSelector"
                    className="hidden mt-3 mx-5 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                    onChange={(e) => setScreenId(e.target.value)}
                >
                    <option value="0">Sélectionner un canal</option>
                    {/* Add your options here – you can map over a static array or fetch them */}
                </select>
                {/* Add the rest of the markup that was in admin2/index.ejs */}
            </div>
        </AdminLayout>
    );
};

// Next.js data fetching – you can replace this with your own API calls
export async function getServerSideProps(context: any) {
    // Here you would call your existing PHP API or any other backend to get the data.
    const { idEvent = 0, idConfEvent = 0 } = context.query;
    const data = await fetchInitialData({ idEvent: Number(idEvent), idConfEvent: Number(idConfEvent) });
    return { props: data };
}

export default AdminPage;
