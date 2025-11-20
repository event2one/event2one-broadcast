import { GetServerSidePropsContext } from 'next';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import AdminLayout from '../../../../components/AdminLayout';
import { io, Socket } from 'socket.io-client';
import { motion } from 'framer-motion';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';
import { Avatar } from '../../../../components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../../../components/ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../../../components/ui/dialog';
import { Input } from '../../../../components/ui/input';
import { Play, Eraser, EyeOff, UserPlus, GripVertical, Search } from 'lucide-react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { fetchInitialData } from '../../../../utils/api';

interface Presta {
    id_presta: string;
    presta_nom: string;
    punchline?: string;
    id_contact: string; // Added to fix type error
}

interface EventContactType {
    id_event_contact_type: string;
    libelle: string;
    event_contact_type_color: string;
}

interface Contact {
    id_contact: string;
    nom: string;
    prenom: string;
    societe: string;
    flag: string;
    logos: { tiny: string };
    photos: { tiny: string };
    prestas_list: Presta[];
}

interface Partner {
    id_conferencier: string;
    contact: Contact;
    conferencier_statut?: {
        id_event_contact_type: string;
        event_contact_type_color: string;
        libelle: string;
    };
}

interface AdminPageProps {
    idEvent: number;
    idConfEvent: number;
    confEventList: any[]; // You can define a more specific type if you know the shape
    confEventContributionList: any[]; // You can define a more specific type if you know the shape
    partenaireList: Partner[];
    prestaList: Presta[];
    contactStatutList: any[]; // You can define a more specific type if you know the shape
    eventContactTypeList: EventContactType[];
}

interface SortableContactRowProps {
    partenaire: Partner;
    presta: Presta | undefined;
    index: number;
    idEvent: number;
    onPublish: (contactId: string, idEvent: number, prestaId: string | undefined, id_event_contact_type: string | undefined) => void;
    onClear: (id: string) => void;
    onHide: (id: string) => void;
}

// Compact Sortable Row Component
function SortableContactRow({ partenaire, presta, index, idEvent, onPublish, onClear, onHide }: SortableContactRowProps) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: partenaire.id_conferencier });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="group flex items-center gap-2 bg-neutral-900/30 border border-neutral-800/50 rounded-lg px-2 py-1.5 hover:bg-neutral-800/40 hover:border-neutral-700 transition-all text-xs"
        >
            <div {...attributes} {...listeners} className="cursor-move text-neutral-600 hover:text-neutral-400">
                <GripVertical className="w-3 h-3" />
            </div>
            <span className="text-neutral-500 font-mono w-4 text-center text-[10px]">{index + 1}</span>
            <Avatar className="w-6 h-6 border border-neutral-700">
                <Image src={partenaire.contact.photos?.tiny} alt="Contact photo" width={24} height={24} className="object-cover" />
            </Avatar>
            <div className="flex-1 min-w-0 flex items-center gap-2">
                <a
                    href={`https://manager.event2one.com/filesmanager/employe.php?id_personne=${partenaire.contact.id_contact}&personne_type=contact`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white font-medium hover:text-emerald-400 transition-colors truncate text-xs"
                >
                    {partenaire.contact.prenom} <span className="uppercase">{partenaire.contact.nom}</span>
                </a>


                {partenaire.conferencier_statut && (
                    <Badge
                        style={{ backgroundColor: partenaire.conferencier_statut.event_contact_type_color }}
                        className="text-[10px] px-1 py-0 h-4"
                    >
                        {partenaire.conferencier_statut.libelle}
                    </Badge>
                )}
                {partenaire.contact.flag && (
                    <Image src={partenaire.contact.flag} alt="Flag" width={16} height={12} className="w-4 h-3 rounded-sm object-cover" />
                )}
            </div>
            <div className="hidden md:flex flex-col min-w-0 max-w-[150px]">
                <span className="text-neutral-400 truncate text-[11px]">{partenaire.contact.societe}</span>
                {presta?.punchline && (
                    <span className="text-neutral-500 italic truncate text-[10px]">&quot;{presta.punchline}&quot;</span>
                )}
            </div>
            {partenaire.contact.logos?.tiny && (
                <Image src={partenaire.contact.logos.tiny} alt="Logo" width={20} height={20} className="hidden lg:block w-5 h-5 object-contain rounded" />
            )}
            <div className="flex items-center gap-1">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                size="sm"
                                onClick={() => onPublish(
                                    partenaire.contact?.id_contact,
                                    idEvent,
                                    presta?.id_presta,
                                    partenaire.conferencier_statut?.id_event_contact_type
                                )}
                                className="h-6 w-6 p-0 bg-emerald-600 hover:bg-emerald-700"
                            >
                                <Play className="w-3 h-3" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>Publier</p></TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => onClear('bJVjZw==')}
                                className="h-6 w-6 p-0 border-neutral-700 hover:bg-neutral-800"
                            >
                                <Eraser className="w-3 h-3" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>Effacer</p></TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => onHide(partenaire.id_conferencier)}
                                className="h-6 w-6 p-0 bg-red-900 hover:bg-red-800"
                            >
                                <EyeOff className="w-3 h-3" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>Masquer</p></TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
        </div>
    );
}

const AdminPage: React.FC<AdminPageProps> = (props) => {
    const { idEvent, idConfEvent, eventContactTypeList: initialEventContactTypeList, partenaireList: initialPartenaireList, prestaList: initialPrestaList } = props;
    const socketRef = React.useRef<Socket | null>(null);

    // Merge initial data
    const mergedInitialPartenaireList = initialPartenaireList.map((partenaire: any) => {
        const contactId = partenaire.contact?.id_contact || partenaire.id_contact;
        return {
            ...partenaire,
            contact: {
                ...(partenaire.contact || {}),
                prestas_list: initialPrestaList ? initialPrestaList.filter((p: Presta) => p.id_contact == contactId) : []
            }
        };
    });

    const [partenaireList2, setPartenaireList2] = useState<Partner[]>(mergedInitialPartenaireList);
    const [searchContactList, setSearchContactList] = useState<Contact[]>([]);
    const [eventContactTypeList,] = useState<EventContactType[]>(initialEventContactTypeList);
    const [selectedContactType, setSelectedContactType] = useState<string>('');
    const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isPositioning, setIsPositioning] = useState(false);

    // Confirmation Dialog States
    const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
    const [conferencierToHide, setConferencierToHide] = useState<string | null>(null);
    const [isHiding, setIsHiding] = useState(false);

    const sensors = useSensors(useSensor(PointerSensor));

    const display = (id_jury_event_enc: string, src: string, screenIdOverride?: number) => {
        const currentScreenId = screenIdOverride ? screenIdOverride.toString() : (document.getElementById("screenSelector") as HTMLSelectElement)?.value;
        if (socketRef.current) {
            socketRef.current.emit('updateMediaContainer', { screenId: currentScreenId, name: "ddddddddddddddddd", iframeSrc: src });
        }
    };

    const clearJuryScreens = (id: string) => console.log("clearJuryScreens", id);

    const publishAllContent = (contactId: string, idEvent: number, prestaId: string | undefined, id_event_contact_type: string | undefined) => {
        alert(contactId + " " + idEvent + " " + prestaId + " " + id_event_contact_type);
        const baseURL = 'https://www.event2one.com/screen_manager/content/';
        const demoBaseURL = `${baseURL}demo_video_presentation/?ie=${idEvent}&id_contact=${contactId}&id_presta=${prestaId}&`;
        const urls = [
            { screen: 13, url: `${baseURL}contact_video_presentation/?id_contact=${contactId}` },
            { screen: 14, url: `${baseURL}organisme_video_presentation/?id_contact=${contactId}` },
            { screen: 15, url: `${baseURL}contact_website/?id_contact=${contactId}` },
            { screen: 16, url: `${baseURL}contact/?id_contact=${contactId}&content=logo` },
            { screen: 18, url: `${baseURL}contact/?id_contact=${contactId}&content=photo` },
            { screen: 20, url: `${baseURL}contact/?id_contact=${contactId}&content=cycle_lang_presentation` },
            { screen: 23, url: `${baseURL}contact/?id_contact=${contactId}&content=leviers` },
            { screen: 22, url: `${baseURL}contact/?id_contact=${contactId}&content=raison_sociale` },
            { screen: 8, url: `${baseURL}contact_qrcode/?id_contact=${contactId}` },
            { screen: 9, url: `${baseURL}titrage_participant/?id_contact=${contactId}&ie=${idEvent}` },
            { screen: 4, url: `${baseURL}demo_video_presentation/?ie=${idEvent}&id_contact=${contactId}&id_event_contact_type=${id_event_contact_type}&id_presta=${prestaId}` },
            { screen: 26, url: `${demoBaseURL}content=visuel` },
            { screen: 30, url: `${demoBaseURL}content=fond-generique` },
            { screen: 31, url: `${demoBaseURL}content=titrage-intervenant&target=obs` },
            { screen: 32, url: `${demoBaseURL}content=incrustation-video&target=obs` },
            { screen: 33, url: `${demoBaseURL}content=incrustation-titre&target=obs` },
            { screen: 34, url: `${demoBaseURL}content=incrustation-visuel&target=obs` },
            { screen: 35, url: `${demoBaseURL}content=presta-visuel-full&target=obs` },
        ];
        urls.forEach(item => display('', item.url, item.screen));
    };

    const getPrestaList = async ({ idEvent, idConfEvent }: { idEvent: number, idConfEvent: number }) => {
        const params = `WHERE (id_contact IN(SELECT id_contact FROM conferenciers WHERE id_event=${idEvent} AND id_contact NOT IN("",0) AND id_conf_event IN(${idConfEvent}))) OR (id_contact IN (SELECT id_contact FROM conf_event_contribution WHERE id_conf_event IN (SELECT id_conf_event FROM conf_event WHERE id_event=${idEvent} AND id_conf_event IN(${idConfEvent})) AND id_contact NOT IN("",0)))`;
        try {
            const response = await fetch(`https://www.mlg-consulting.com/smart_territory/form/api.php?action=getPrestaList&params=${params}`);
            return await response.json();
        } catch (error) {
            console.error(error);
            return [];
        }
    };

    const getContactList = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;

        if (!query) {
            setSearchContactList([]);
            return;
        }

        try {
            // S'assure que nous travaillons toujours avec un tableau de termes.
            // Si query est une chaîne "John Doe", queryTerms devient ["John", "Doe"].
            const queryTerms = query.split(' ').filter(term => term.length > 0);

            // Construit une condition de recherche pour chaque terme.
            const searchConditions = queryTerms.map(term => {
                const cleanTerm = term.replace(/'/g, "''"); // Échappement simple pour les apostrophes
                return `(
                prenom LIKE '%${cleanTerm}%' 
                OR nom LIKE '%${cleanTerm}%' 
                OR societe LIKE '%${cleanTerm}%'
                OR id_contact LIKE '%${cleanTerm}%'
                OR CONCAT(prenom, ' ', nom) LIKE '%${cleanTerm}%'
            )`;
            });

            // Combine toutes les conditions avec 'AND' pour une recherche stricte.
            const params = `WHERE ${searchConditions.join(' AND ')} AND id_contact NOT IN(0, '') LIMIT 20`;

            const encodedParams = encodeURIComponent(params);

            // Construit l'URL de l'API PHP
            const apiUrl = `https://www.mlg-consulting.com/smart_territory/form/api.php?action=getContactList&params=${encodedParams}&get_presta_list=1`;

            const response = await fetch(apiUrl);
            const data = await response.json();

            setSearchContactList(data);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    const handleUpdateConferencier = (id_conferencier: string) => {
        setConferencierToHide(id_conferencier);
        setIsConfirmDialogOpen(true);
    }

    const confirmHideConferencier = async () => {
        if (!conferencierToHide) return;

        setIsHiding(true);
        const params = new URLSearchParams();
        params.append('id_conferencier', conferencierToHide);
        params.append('afficher', '0');

        try {
            await fetch('https://www.mlg-consulting.com/smart_territory/form/api.php?action=updateConferencier', {
                method: 'POST',
                body: params
            });

            await getPartenaires({ idEvent, idConfEvent });
        } catch (error) {
            console.error("Error hiding conferencier:", error);
        } finally {
            setIsHiding(false);
            setIsConfirmDialogOpen(false);
            setConferencierToHide(null);
        }
    }


    const getPartenaires = async ({ idEvent, idConfEvent }: { idEvent: number, idConfEvent: number }) => {
        try {
            const req = idConfEvent == 0
                ? `https://www.mlg-consulting.com/smart_territory/form/api.php?action=getPartenairesLight&params= AND id_event=${idEvent} and afficher !='0'&exclude_fields=event,conf_event`
                : `https://www.mlg-consulting.com/smart_territory/form/api.php?action=getPartenairesLight&params= AND id_event=${idEvent} AND id_conf_event IN(${idConfEvent}) and afficher !='0'&exclude_fields=event,conf_event`;

            const [partenaires, prestas] = await Promise.all([
                fetch(req).then(res => res.json()),
                getPrestaList({ idEvent, idConfEvent })
            ]);

            console.log('Debug Partenaires[0]:', partenaires[0]);
            console.log('Debug Prestas[0]:', prestas[0]);

            const mergedPartenaires = partenaires.map((partenaire: any) => {
                const contactId = partenaire.contact?.id_contact || partenaire.id_contact;
                return {
                    ...partenaire,
                    contact: {
                        ...(partenaire.contact || {}),
                        prestas_list: prestas.filter((p: Presta) => p.id_contact == contactId)
                    }
                };
            });

            setPartenaireList2(mergedPartenaires);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };


    const deleteConferencier = async (idConferencier: string) => {
        const params = new URLSearchParams();
        params.append('id_conferencier', idConferencier);
        try {
            const response = await fetch('https://www.mlg-consulting.com/smart_territory/form/api.php?action=deleteConferencier', {
                method: 'POST',
                body: params
            });
            const data = await response.json();
            await getPartenaires({ idEvent, idConfEvent });
            console.log('Conferencier deleted:', data);
        } catch (error) {
            console.error('Error deleting conferencier:', error);
        }
    };

    const handleCreateConferencier = async (contact: Contact, contactTypeId: string, idConfEvent: string) => {
        const params = new URLSearchParams();
        params.append('id_event', idEvent.toString());
        params.append('id_contact', contact.id_contact);
        params.append('id_event_contact_type', contactTypeId);
        params.append('id_conf_event', idConfEvent);
        try {

            const response = await fetch('https://www.mlg-consulting.com/smart_territory/form/api.php?action=createConferencier', {
                method: 'POST',
                body: params
            });
            const data = await response.json();

            await getPartenaires({ idEvent, idConfEvent: Number(idConfEvent) });

            console.log('Conferencier created:', data);
        } catch (error) {
            console.error('Error creating conferencier:', error);
        }
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            setPartenaireList2((items) => {
                const oldIndex = items.findIndex(item => item.id_conferencier === active.id);
                const newIndex = items.findIndex(item => item.id_conferencier === over.id);
                const newItems = arrayMove(items, oldIndex, newIndex);

                const orderUpdates = newItems.map((item, index) => ({
                    id: item.id_conferencier,
                    order: index + 1
                }));

                const params = new URLSearchParams();
                params.append('order', JSON.stringify(orderUpdates));

                fetch('https://www.mlg-consulting.com/smart_territory/form/api.php?action=updateConferencierOrder', {
                    method: 'POST',
                    body: params
                })
                    .then(response => response.json())
                    .then(data => console.log('Order updated:', data))
                    .catch(error => console.error('Error updating order:', error));

                return newItems;
            });
        }
    };

    useEffect(() => {
        // Data is now coming from getServerSideProps, so initial fetch is not needed here.
        socketRef.current = io('http://localhost:3000');
        const socket = socketRef.current;
        socket.emit('dire_bonjour', { my: 'Bonjour server, je suis admin' });
        socket.on('connect', () => socket.emit('check_connexion', { name: 'admin' }));
        socket.on('updateMediaContainer', (data: { screenId: string, name: string, iframeSrc: string }) => console.log('updateMediaContainer', data));

        return () => {
            socket.disconnect();
        };
    }, [idEvent, idConfEvent]);

    return (
        <AdminLayout>
            <div className="min-h-screen bg-linear-to-br from-neutral-950 via-neutral-900 to-neutral-950">
                <div className="sticky top-0 z-10 backdrop-blur-xl bg-neutral-900/90 border-b border-neutral-800">
                    <div className="container mx-auto px-4 py-2">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-lg font-bold text-white">Gestion des Intervenants</h1>
                                <p className="text-[10px] text-neutral-400">Event {idEvent} • Session {idConfEvent}</p>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={() => display('177820', 'https://www.event2one.com/screen_manager/content/blank.php', 9)} className="h-7 text-xs border-neutral-700 hover:bg-neutral-800">
                                    <EyeOff className="w-3 h-3 mr-1" />Masquer titrage
                                </Button>
                                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button size="sm" className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700">
                                            <UserPlus className="w-3 h-3 mr-1" />Ajouter
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-[600px] bg-neutral-900 border-neutral-800">
                                        <DialogHeader>
                                            <DialogTitle className="text-white">Ajouter un intervenant</DialogTitle>
                                        </DialogHeader>
                                        <div className="space-y-4">
                                            {/* Contact Type Selector */}
                                            <div>
                                                <label className="text-sm font-medium text-neutral-300 mb-2 block">
                                                    Type de contact
                                                </label>
                                                <select
                                                    value={selectedContactType}
                                                    onChange={(e) => setSelectedContactType(e.target.value)}
                                                    className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                                                >
                                                    <option value="">Sélectionner un type...</option>
                                                    {eventContactTypeList.map((type) => (
                                                        <option key={type.id_event_contact_type} value={type.id_event_contact_type}>
                                                            {type.libelle}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            {/* Search Input */}
                                            <div className="relative">
                                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
                                                <Input
                                                    type="text"
                                                    placeholder="Rechercher par nom, prénom, société..."
                                                    onChange={getContactList}
                                                    className="pl-10 bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500"
                                                />
                                            </div>
                                            <div className="max-h-[300px] overflow-y-auto space-y-2">
                                                {searchContactList.length > 0 ? (
                                                    searchContactList.map((contact) => (
                                                        <div
                                                            key={contact.id_contact}
                                                            className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors border ${selectedContact?.id_contact === contact.id_contact
                                                                ? 'bg-emerald-900/30 border-emerald-600'
                                                                : 'bg-neutral-800/50 hover:bg-neutral-800 border-neutral-700/50'
                                                                }`}
                                                            onClick={() => setSelectedContact(contact)}
                                                        >
                                                            <Avatar className="w-10 h-10 border border-neutral-700">
                                                                <Image src={contact.photos?.tiny} alt="Contact search result photo" width={40} height={40} className="object-cover" />
                                                            </Avatar>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-white font-medium text-sm">
                                                                    {contact.prenom} <span className="uppercase">{contact.nom}</span>
                                                                </p>
                                                                <p className="text-neutral-400 text-xs truncate">{contact.societe}</p>
                                                            </div>
                                                            {contact.flag && (
                                                                <Image src={contact.flag} alt="Flag" width={20} height={16} className="w-5 h-4 rounded-sm object-cover" />
                                                            )}
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="text-center py-8 text-neutral-500 text-sm">
                                                        <Search className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                                        <p>Commencez à taper pour rechercher un contact</p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Position Button */}
                                            <div className="pt-4 border-t border-neutral-800">
                                                <Button
                                                    onClick={async () => {
                                                        if (selectedContact && selectedContactType) {
                                                            setIsPositioning(true);
                                                            await handleCreateConferencier(selectedContact, selectedContactType, idConfEvent.toString());
                                                            setIsPositioning(false);
                                                            setIsDialogOpen(false);
                                                            setSelectedContact(null);
                                                            setSelectedContactType('');
                                                            setSearchContactList([]);
                                                        }
                                                    }}
                                                    disabled={!selectedContact || !selectedContactType || isPositioning}
                                                    className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-neutral-700 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                                >
                                                    {isPositioning ? (
                                                        <>
                                                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                            </svg>
                                                            <span>Positionnement...</span>
                                                        </>
                                                    ) : (
                                                        'Positionner le contact'
                                                    )}
                                                </Button>
                                            </div>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                                <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
                                    <DialogContent className="sm:max-w-[425px] bg-neutral-900 border-neutral-800">
                                        <DialogHeader>
                                            <DialogTitle className="text-white">Confirmer la suppression</DialogTitle>
                                        </DialogHeader>
                                        <div className="py-4">
                                            <p className="text-neutral-300 text-sm">
                                                Êtes-vous sûr de vouloir masquer cet intervenant ?
                                            </p>
                                        </div>
                                        <div className="flex justify-end gap-3">
                                            <Button
                                                variant="outline"
                                                onClick={() => setIsConfirmDialogOpen(false)}
                                                className="border-neutral-700 text-neutral-300 hover:bg-neutral-800 hover:text-white"
                                                disabled={isHiding}
                                            >
                                                Annuler
                                            </Button>
                                            <Button
                                                onClick={confirmHideConferencier}
                                                className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
                                                disabled={isHiding}
                                            >
                                                {isHiding ? (
                                                    <>
                                                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                        </svg>
                                                        <span>Traitement...</span>
                                                    </>
                                                ) : (
                                                    'Confirmer'
                                                )}
                                            </Button>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="container mx-auto px-4 py-2">
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={partenaireList2.map(p => p.id_conferencier)} strategy={verticalListSortingStrategy}>
                            <div className="space-y-0.5">
                                {partenaireList2 && partenaireList2.map((partenaire, index) => {
                                    // Get the first prestation from the list
                                    const presta = partenaire.contact.prestas_list?.[0];
                                    console.log('Presta for', partenaire.contact.nom, ':', presta);
                                    if (!partenaire.contact) return null;
                                    return (
                                        <SortableContactRow
                                            key={partenaire.id_conferencier}
                                            partenaire={partenaire}
                                            presta={presta}
                                            index={index}
                                            idEvent={idEvent}
                                            onPublish={publishAllContent}
                                            onClear={clearJuryScreens}
                                            onHide={handleUpdateConferencier}
                                        />
                                    );
                                })}


                                {(!partenaireList2 || partenaireList2.length === 0) && (
                                    <div className="flex items-center justify-center py-12">
                                        <motion.svg width="60" height="60" viewBox="0 0 100 100" className="text-white">
                                            <motion.path
                                                d="M 50 10 L 90 35 L 75 80 L 25 80 L 10 35 Z"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="3"
                                                initial={{ pathLength: 0 }}
                                                animate={{ pathLength: [0, 1, 1, 0], rotate: [0, 0, 360, 360] }}
                                                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                                            />
                                        </motion.svg>
                                    </div>
                                )}
                            </div>
                        </SortableContext>
                    </DndContext>
                </div>
            </div>
        </AdminLayout >
    );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
    const { eventId, adminId } = context.params as { eventId: string, adminId: string };
    const data = await fetchInitialData({ idEvent: Number(eventId), idConfEvent: Number(adminId) });
    return { props: data };
}

export default AdminPage;
