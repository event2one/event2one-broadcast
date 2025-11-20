const test = () => {
    console.log('test');
};

/**
 * Affiche un indicateur d'état visuel (point vert ou rouge).
 * @param {any} state - La valeur à vérifier. Si "truthy", l'indicateur est vert, sinon rouge.
 * @returns {string} Le code HTML de l'indicateur.
 */
const IsState = (state) => {
    const color = state ? 'emerald' : 'red';
    return `<div class="relative flex h-6 w-6 flex-none items-center justify-center"><div class="h-1.5 w-1.5 rounded-full bg-${color}-500 ring-1 ring-${color}-400 group-hover:ring-${color}-800"></div></div>`;
};

/**
 * Copie une chaîne de caractères dans le presse-papiers.
 * @param {string} data - La donnée à copier.
 */
const copyData = (data) => {
    navigator.clipboard.writeText(data)
        .then(() => {
            console.log('Data copied to clipboard');
        })
        .catch(err => {
            console.error('Error copying data: ', err);
        });
};

/**
 * Génère une icône de copie cliquable.
 * @param {string} data - La donnée à associer à l'icône pour la copie.
 * @returns {string} Le code HTML de l'icône.
 */
const copyIcon = (data) => {
    if (!data) return '';
    const escapedData = data.replace(/'/g, "\\'");
    return `<span class="cursor-pointer text-gray-500 hover:text-white ml-2" onclick="copyData('${escapedData}')" title="Copier">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="inline-block align-middle">
                    <rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect>
                    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path>
                </svg>
            </span>`;
};

/**
 * Télécharge un fichier depuis une URL.
 * @param {Event} event - L'événement du clic.
 * @param {string} url - L'URL du fichier à télécharger.
 */
const downloadFile = async (event, url) => {
    event.preventDefault();
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Network response was not ok.');
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        const filename = url.substring(url.lastIndexOf('/') + 1);
        link.setAttribute('download', filename || 'download');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
        console.error('Download failed:', error);
        window.open(url, '_blank');
    }
};

/**
 * Publie tous les contenus associés à un contact et une prestation sur les différents écrans.
 * @param {string} contactId - L'ID du contact.
 * @param {string} idEvent - L'ID de l'événement.
 * @param {string} prestaId - L'ID de la prestation.
 */
const publishAllContent = (contactId, idEvent, prestaId, id_event_contact_type) => {
    alert('publishAllContent called');


    const baseURL = 'https://www.event2one.com/screen_manager/content/';
    const demoBaseURL = 'https://www.event2one.com/screen_manager/content/demo_video_presentation/?ie=' + idEvent + '&id_contact=' + contactId + '&id_presta=' + prestaId + '&';

    const urls = [
        // Contact
        { screen: 13, url: `${baseURL}contact_video_presentation/?id_contact=${contactId}` },
        { screen: 14, url: `${baseURL}organisme_video_presentation/?id_contact=${contactId}` },
        { screen: 15, url: `${baseURL}contact_website/?id_contact=${contactId}` },
        { screen: 16, url: `${baseURL}contact/?id_contact=${contactId}&content=logo` },
        { screen: 18, url: `${baseURL}contact/?id_contact=${contactId}&content=photo` },
        { screen: 20, url: `${baseURL}contact/?id_contact=${contactId}&content=cycle_lang_presentation` },
        { screen: 23, url: `${baseURL}contact/?id_contact=${contactId}&content=leviers` },
        { screen: 22, url: `${baseURL}contact/?id_contact=${contactId}&content=raison_sociale` },
        { screen: 8, url: `${baseURL}contact_qrcode/?id_contact=${contactId}` },
        // Événement & Contact
        { screen: 9, url: `${baseURL}titrage_participant/?id_contact=${contactId}&ie=${idEvent}` },
        { screen: 23, url: `${baseURL}expectation/?ie=${idEvent}&id_contact=${contactId}&content=invest` },
        { screen: 27, url: `${baseURL}expectation/?ie=${idEvent}&id_contact=${contactId}&content=landing_services` },
        { screen: 28, url: `${baseURL}expectation/?ie=${idEvent}&id_contact=${contactId}&content=landing_chanels` },
        { screen: 29, url: `${baseURL}expectation/?ie=${idEvent}&id_contact=${contactId}&content=pays` },
        // Prestation (si disponible)
        { screen: 4, url: `${baseURL}demo_video_presentation/?ie=${idEvent}&id_contact=${contactId}&id_event_contact_type=${id_event_contact_type}&id_presta=${prestaId}` },
        { screen: 26, url: `${demoBaseURL}content=visuel` },
        { screen: 30, url: `${demoBaseURL}content=fond-generique` },
        { screen: 31, url: `${demoBaseURL}content=titrage-intervenant&target=obs` },
        { screen: 32, url: `${demoBaseURL}content=incrustation-video&target=obs` },
        { screen: 33, url: `${demoBaseURL}content=incrustation-titre&target=obs` },
        { screen: 34, url: `${demoBaseURL}content=incrustation-visuel&target=obs` },
        { screen: 35, url: `${demoBaseURL}content=presta-visuel-full&target=obs` },
    ];

    urls.forEach(item => {
        // Ne publie que si l'URL est valide (évite les 'undefined' pour prestaId)
        // if (item.url && !item.url.includes('undefined')) {
        display('', item.url, item.screen);
        //}
    });
};

/**
 * Efface le contenu de tous les écrans.
 */
const clearAllScreens = () => {
    for (let i = 1; i <= 35; i++) {
        display('', 'https://www.event2one.com/screen_manager/content/blank.php', i);
    }
};

/**
 * Efface le contenu des écrans spécifiques au jury.
 * @param {string} idJuryEventEnc - L'ID encodé de l'événement jury.
 */
const clearJuryScreens = (idJuryEventEnc) => {
    const screensToClear = [9, 10, 14];
    screensToClear.forEach(screenNum => {
        display(idJuryEventEnc, 'https://www.event2one.com/screen_manager/content/blank.php', screenNum);
    });
};


/**
 * Initialise le drag-and-drop sur la table des candidats.
 * @param {HTMLElement} tableBody - L'élément tbody à rendre triable.
 */
const initSortableCandidats = (tableBody) => {
    if (!tableBody) return;

    new Sortable(tableBody, {
        animation: 150,
        handle: '.drag-handle', // Poignée pour le drag
        filter: '.no-sort',
        onEnd: async (evt) => {
            const rows = Array.from(evt.target.children);
            const orderUpdates = rows.map((row, index) => ({
                id_jury_demo: row.dataset.id,
                order: index + 1 // Nouvel ordre basé sur l'index
            }));

            try {
                const response = await fetch('/api/update-jury-demo', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ order: orderUpdates }),
                });

                if (!response.ok) throw new Error('Server responded with an error.');

                const result = await response.json();
                console.log('Update result:', result.message);

                // Mettre à jour visuellement les numéros d'ordre
                rows.forEach((row, index) => {
                    const orderCell = row.querySelector('.order-display');
                    if (orderCell) orderCell.textContent = `#${index + 1}`;
                });

            } catch (error) {
                console.error('Failed to save new order:', error);
            }
        }
    });
};



/**
 * Initialise le drag-and-drop sur la table des partenaires d'un jury.
 * @param {string} tableBodyId - L'ID du corps du tableau (tbody) à rendre triable.
 */
const initSortablePartenaires = (tableBodyId) => {
    const tableBody = document.getElementById(tableBodyId);
    if (!tableBody) {
        console.error(`Sortable table body with id #${tableBodyId} not found.`);
        return;
    }

    new Sortable(tableBody, {
        animation: 150,
        handle: '.drag-handle', // Classe pour la poignée de drag
        filter: '.no-sort',
        onEnd: async (evt) => {
            const rows = Array.from(evt.target.children).filter(row => !row.classList.contains('no-sort'));

            const orderUpdates = rows.map((row, index) => ({
                id: row.dataset.id,
                order: index + 1
            }));

            try {
                const response = await fetch('/api/update-conferencier-order', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ order: orderUpdates }),
                });

                if (!response.ok) {
                    throw new Error('Server responded with an error.');
                }

                const result = await response.json();
                console.log('Update result:', result.message);

                // Mettre à jour visuellement les numéros d'ordre
                rows.forEach((row, index) => {
                    const orderCell = row.querySelector('.order-display');
                    if (orderCell) orderCell.textContent = index + 1;
                });

            } catch (error) {
                console.error('Failed to save new order:', error);
                // Optionnel: Annuler le changement visuel si la sauvegarde échoue
            }
        }
    });
};



const getAllPartenaires = ({ partenaireList, idEvent, prestaList }) => {

    console.log('partenaireList', partenaireList);
    return partenaireList
        .filter((partenaires, index, self) => self.findIndex(t => t.contact.id_contact === partenaires.contact.id_contact) === index)
        .filter(partenaires => !["208", "partcipant", "143"].includes(partenaires.statut))
        .sort((a, b) => a.contact.prenom.localeCompare(b.contact.prenom))
        .map(partenaires => {
            const presta = prestaList.find(p => p.id_contact === partenaires.contact.id_contact);

            const auteur = partenaires.contact.auteur;
            const auteurName = partenaires.contact.auteur ? `${partenaires.contact.auteur.prenom} ${partenaires.contact.auteur.nom}` : '';

            return `
            <tr class="group hover:bg-neutral-800 py-1 text-gray-400 text-sm">
                <td><img src="${partenaires.contact.photos.small}" alt="" class="w-4 h-4 rounded-full"></td>
                <td>${partenaires.contact.prenom}</td>
                <td>${partenaires.contact.nom}${copyIcon(`${partenaires.contact.prenom} ${partenaires.contact.nom}`)}</td>
                <td>${partenaires.contact.societe}${copyIcon(partenaires.contact.societe)}</td>
                <td class="hidden">${partenaires.contact.fonction}</td>
                <td>${auteurName}</td>
                <td>${(presta?.presta_nom || '').substring(0, 20)}${presta?.presta_nom && presta.presta_nom.length > 20 ? '...' : ''}${copyIcon(presta?.presta_nom)}</td>
                <td><img src="${partenaires.contact.logos.small}" alt="" class="w-4 h-4 rounded-full"></td>
                <td>${IsState(partenaires.contact.organisme_video_url || partenaires.contact.organisme_video_hosted)}</td>
                <td></td>
                <td>
                    ${IsState(presta?.video_url || presta?.video_hosted)}
                    ${presta?.video_url ? `<a target="_blank" href="${presta.video_url}" class="text-xs text-blue-400 hover:text-blue-300">Vidéo Youtube</a>` : ''}
                    ${presta?.video_hosted ? `<a target="_blank" href="https://www.mlg-consulting.com/manager_cc/docs/archives/${presta.video_hosted}" class="text-xs text-blue-400 hover:text-blue-300">Vidéo (Hébergée)</a>` : ''}
                </td>
                <td class="flex">
                    ${IsState(presta?.presta_visuel)}
                    ${presta?.presta_visuel ? `
                        <img src="${presta.presta_visuel}" class="w-8 h-8 object-contain" alt="Visuel" />
                        <a href="${presta.presta_visuel_thumbs.source}" onclick="downloadFile(event, '${presta.presta_visuel_thumbs.source}')" class="cursor-pointer text-xs whitespace-nowrap px-2 py-1 text-white rounded bg-neutral-800 hover:bg-neutral-700">Télécharger</a>
                    ` : ''}
                </td>
                <td class="py-1">
                    <div class="flex space-x-2">
                        <a class="text-xs whitespace-nowrap flex items-center px-2 py-1 group-hover:bg-zinc-600 text-white rounded-full bg-emerald-900 mx-2 cursor-pointer" title="Publier ${partenaires.contact.nom} ${partenaires.contact.prenom}" onClick="publishAllContent('${partenaires.contact.id_contact}', '${idEvent}', '${presta?.id_presta}')">Publier</a>
                        <a class="text-xs whitespace-nowrap flex items-center px-2 py-1 group-hover:bg-zinc-600 text-white rounded-full bg-neutral-900 mx-2 cursor-pointer" title="Effacer tout" onClick="clearAllScreens()">Clear All</a>
                    </div>
                </td>
            </tr>`;
        }).join('');
};

const getPartenaires2 = ({ confEvent, partenaireList, idEvent, prestaList }) => {

    return partenaireList
        .filter(partenaire => partenaire.id_conf_event.id_conf_event === confEvent.id_conf_event)
        //  .filter((partenaires, index, self) => self.findIndex(t => t.contact.id_contact === partenaires.contact.id_contact) === index)
        //.filter(partenaires => !["208", "partcipant", "143", "offreur_de_solution"].includes(partenaires.statut))
        .sort((a, b) => a.ordre_affichage - b.ordre_affichage) // Tri initial par ordre_affichage
        .map(partenaires => {

            const presta = prestaList.find(p => p.id_contact === partenaires.contact.id_contact);

            const auteurName = partenaires.contact.auteur ? `${partenaires.contact.auteur.prenom.substring(0, 1)}. ${partenaires.contact.auteur.nom}` : '';

            // Utiliser id_contact_statut comme identifiant unique pour la ligne
            return `
        <tr class="divide-x group hover:bg-neutral-900 py-1 text-gray-200 text-sm" data-id="${partenaires.id_conferencier}">
           
            <td class="flex items-center px-1">
                <span class="drag-handle cursor-move pr-2 text-gray-500">☰</span>
                <span class="order-display">${partenaires.ordre_affichage}</span>
            </td>
            <td class="px-1"><img src="${partenaires.contact.photos?.small}" alt="" class="w-4 h-4 rounded-full"> </td>
           
            <td class="px-1">
            <a class="text-blue-400 hover:text-blue-300 underline   " 
           target="_blank"
            href="https://manager.event2one.com/filesmanager/employe.php?id_personne=${partenaires.contact.id_contact}&personne_type=contact"
            >
            ${partenaires.contact.prenom} 
            <span class="uppercase font-bold">${partenaires.contact.nom}</span>
            </a>

            </td>
           
            <td class="px-1">${partenaires.contact.societe}</td>
            <td class="text-xs px-1"><span class="px-2 py-1 rounded-full text-xs" style="background-color: ${partenaires.conferencier_statut?.event_contact_type_color}">${partenaires.conferencier_statut?.libelle}</span></td>
            <td class="px-1"><img src="${partenaires.contact.flag}" alt="" class="w-4 h-4 rounded-full"></td>
            <td class="px-1">${auteurName}</td>
            <td class="px-1"><img src="${partenaires.contact.logos?.small}" alt="" class="w-4 h-4 rounded-full"></td>
           
           <td class="px-1">
             <span class="text-xs italic">
               <a 
               class="text-blue-400 hover:text-blue-300 underline" 
               target="_blank" 
               href="https://www.mlg-consulting.com/manager_cc/prestations/content_action.php?id_presta=${presta ? presta.id_presta : ''}">
                 ${presta && presta.punchline ? presta?.punchline : presta?.presta_nom}
              </a>
               </span>
           </td>
            <td class="px-1">
            ${IsState(partenaires.contact.organisme_video_url && partenaires.contact.organisme_video_url != 0 || partenaires.contact.organisme_video_hosted && partenaires.contact.organisme_video_hosted != 0)}</td>
            <td class="py-1 px-1">
                <div class="flex space-x-2 justify-end"> 
                    <a class="text-xs whitespace-nowrap flex items-center px-2 py-1 group-hover:bg-zinc-600 text-white rounded bg-emerald-900 mx-2 cursor-pointer" title="Publier ${partenaires.contact.nom} ${partenaires.contact.prenom}" onClick="publishAllContent('${partenaires.contact.id_contact}', '${idEvent}', '${presta?.id_presta}', ${partenaires.conferencier_statut.id_event_contact_type})">Publier</a>
                    <a class="hidden text-xs whitespace-nowrap flex items-center px-2 py-1 group-hover:bg-zinc-600 text-white rounded bg-neutral-900 mx-2 cursor-pointer" title="Titrage" onClick="display('${confEvent.jury_event.id_jury_event_enc}','https://www.event2one.com/screen_manager/content/titrage_participant/?id_contact=${partenaires.contact.id_contact}&id_conf_event=${confEvent.id_conf_event}',9)">Titrage</a>
                    <a class="text-xs whitespace-nowrap flex items-center px-2 py-1 group-hover:bg-zinc-600 text-white rounded bg-neutral-900 mx-2 cursor-pointer" title="Effacer" onClick="clearJuryScreens('${confEvent.jury_event.id_jury_event_enc}')">Clear All</a>

                 <button 
                 class="text-xs whitespace-nowrap flex items-center px-2 py-1 group-hover:bg-zinc-600 text-white rounded bg-red-900 mx-2 cursor-pointer" title="Masquer ${partenaires.contact.nom} ${partenaires.contact.prenom}"   
                 onClick="hideParticipant('${partenaires.id_conferencier}')">Masquer</button>   
              </div>
            </td>
        </tr>`}).join('');
};


const getConfEventContribution = async ({ confEvent, confEventContributionList }) => {
    const element = document.getElementById(`contributions_container_${confEvent.id_conf_event}`);
    if (element) {
        const contributionsHtml = confEventContributionList.map((contribution, index) => `
            <li class="group hover:bg-zinc-700">
                <a class="dropdown-item hover:bg-zinc-700 text-white cursor-pointer" onClick="display('', 'https://www.event2one.com/screen_manager/content/contribution/?id_conf_event=${confEvent.id_conf_event}&id_cec=${contribution.id_conf_event_contribution}',7), display('', 'https://www.event2one.com/screen_manager/content/contribution/?id_conf_event=${confEvent.id_conf_event}&id_cec=${contribution.id_conf_event_contribution}&content=name',11)">
                    #${index + 1} - ${contribution.name} - ${contribution.contact?.nom || ''} ${contribution.contact?.prenom || ''}
                </a>
            </li>`).join('');
        element.innerHTML = contributionsHtml;
    } else {
        console.error(`Element with ID contributions_container_${confEvent.id_conf_event} not found`);
    }
};

const displayConfEventContributionList = ({ confEventContributionList, confEvent, prestaList, contactStatutList, idEvent }) => {
    return confEventContributionList
        .filter(contribution => contribution.conf_event.id_conf_event === confEvent.id_conf_event)
        .map((contribution, index) => {
            const presta = prestaList?.find(p => p.id_contact === contribution.contact?.id_contact);
            return `
            <tr 
          
            class="divide-x divide-y group hover:bg-neutral-900 py-1 text-gray-200 text-sm">
                <td class="font-bold px-1">#${index + 1}</td>
                <td class="px-1">${contribution.name}</td>
                <td class="px-1">
                    <div class="flex space-x-3 items-center ${contribution.contact ? "" : "hidden"}">
                        <img src="${contribution.contact?.flag}" alt="" class="w-4 h-4 rounded-full">
                        <span>${contribution.contact?.pays}</span>
                    </div>
                </td>
                <td>
                    ${contactStatutList?.filter(cs => cs.id_contact.id_contact === contribution.contact?.id_contact)
                    .map(contactStatut => {
                        const attachedFile = contactStatut.statut.attachedFileCollection?.find(af => af.id_attached_file_type.id_attached_file_type == "103");
                        return attachedFile ? `<div><img src=${attachedFile.file_name} alt="" class="bg-white w-6 rounded-full" title=${contactStatut.statut.statut_nom} /></div>` : '';
                    }).join('') || ''}
                </td>
                <td class="px-1">
                    <div class="flex space-x-3 items-center ${contribution.contact ? "" : "hidden"}">
                        <img src="${contribution.contact?.photos?.small}" alt="" class="w-4 h-4 rounded-full">
                        <span>${contribution.contact?.prenom} ${contribution.contact?.nom}</span>
                    </div>
                </td>
                <td class="px-1">${contribution.contact?.societe}</td>
                <td class="px-1">${contribution.conf_event_contribution_type.name}</td>
                <td class="px-1">${IsState(contribution.contact?.organisme_video_url || contribution.contact?.organisme_video_hosted)}</td>
                <td class="px-1"></td>
                <td class="px-1">${IsState(presta?.video_url || presta?.video_hosted)}</td>
                <td class="px-1">${IsState(presta?.presta_visuel)}</td>
                <td class="px-1 py-1">
                    <div class="flex space-x-3">
                        <button onClick="
                            display('', 'https://www.event2one.com/screen_manager/content/contribution/?id_conf_event=${confEvent.id_conf_event}&id_cec=${contribution.id_conf_event_contribution}',7);
                            display('', 'https://www.event2one.com/screen_manager/content/contribution/?id_conf_event=${confEvent.id_conf_event}&id_cec=${contribution.id_conf_event_contribution}&content=name',11);
                            publishAllContent('${contribution.contact?.id_contact}', '${idEvent}', '${presta?.id_presta}');
                            display('', 'https://www.event2one.com/screen_manager/content/titrage_participant/?id_contact=${contribution.contact?.id_contact}',9);"
                            class="text-xs whitespace-nowrap flex items-center px-2 py-1 group-hover:bg-zinc-600 text-white rounded-full bg-emerald-900 mx-2 cursor-pointer">Publier</button>
                    </div>
                </td>
            </tr>`;
        }).join('');
};

const getQuestions = ({ confEvent, confEventContributionList }) => {
    getConfEventContribution({ confEvent, confEventContributionList });
    return "";
};


const hideParticipant = async (id_conferencier) => {


    //afficher un prompt de confirmation
    const confirmation = confirm("Êtes-vous sûr de vouloir masquer ce participant ?");
    if (!confirmation) return;

    try {
        const response = await fetch('/api/hide-participant', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_conferencier, afficher: 0 }),
        });
        if (!response.ok) throw new Error('Network response was not ok.');
        const result = await response.json();
        console.log('Participant hidden:', result.message);

        const rowToHide = document.querySelector(`tr[data-id="${id_conferencier}"]`);
        if (rowToHide) {
            const tableBody = rowToHide.parentElement;
            rowToHide.remove(); // Supprimer la ligne du DOM

            // Recalculer et sauvegarder le nouvel ordre
            const rows = Array.from(tableBody.children).filter(row => !row.classList.contains('no-sort'));
            const orderUpdates = rows.map((row, index) => ({
                id: row.dataset.id,
                order: index + 1
            }));

            await fetch('/api/update-conferencier-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ order: orderUpdates }),
            });

            // Mettre à jour visuellement les numéros d'ordre
            rows.forEach((row, index) => {
                const orderCell = row.querySelector('.order-display');
                if (orderCell) orderCell.textContent = index + 1;
            });
        }

    }
    catch (error) {
        console.error('Error hiding participant:', error);
    }
};


/**
 * Trie un tableau d'objets par plusieurs attributs.
 * @param {Array} array - Le tableau à trier.
 * @param {...string} attrs - Les attributs à utiliser pour le tri. Préfixez avec '-' pour un tri descendant.
 * @returns {Array} Le tableau trié.
 */

const sortByAttribute = (array, ...attrs) => {
    let predicates = attrs.map(pred => {
        let descending = pred.charAt(0) === '-' ? -1 : 1;
        pred = pred.replace(/^-/, '');
        return {
            getter: o => o[pred],
            descend: descending
        };
    });
    return array.map(item => ({
        src: item,
        compareValues: predicates.map(predicate => predicate.getter(item))
    }))
        .sort((o1, o2) => {
            let i = -1, result = 0;
            while (++i < predicates.length) {
                if (o1.compareValues[i] < o2.compareValues[i]) result = -1;
                if (o1.compareValues[i] > o2.compareValues[i]) result = 1;
                if (result *= predicates[i].descend) break;
            }
            return result;
        })
        .map(item => item.src);
};