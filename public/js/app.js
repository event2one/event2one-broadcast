const socket = io();

socket.emit('dire_bonjour', { my: 'Bonjour server,je suis admin' });

socket.on("connection", (socket) => {
    socket.broadcast.emit('check_connexion', { name: "ddddddddddddddddd" });
});

const sortByAttribute = (array, ...attrs) => {
    // generate an array of predicate-objects contains
    // property getter, and descending indicator
    let predicates = attrs.map(pred => {
        let descending = pred.charAt(0) === '-' ? -1 : 1;
        pred = pred.replace(/^-/, '');
        return {
            getter: o => o[pred],
            descend: descending
        };
    });
    // schwartzian transform idiom implementation. aka: "decorate-sort-undecorate"
    return array.map(item => {
        return {
            src: item,
            compareValues: predicates.map(predicate => predicate.getter(item))
        };
    })
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
}


const send = function () {

    const ije = 'ap1kZw';

    console.log("done")
    socket.emit('message', { my: 'Bonjour server,je suis message' });
    socket.emit('check_connexion', { name: "ddddddddddddddddd", iframeSrc: `https://www.event2one.com/screen_manager/content/session_qrcode/?ije=${ije}` });
}

socket.on('message', function (data) {

    console.log('Incoming message:', data);
})

const getPartenaires = async (confEvent) => {

    const response = await fetch(`https://www.mlg-consulting.com/smart_territory/form/api.php?action=getPartenaires&params= AND id_conf_event=${confEvent.id_conf_event}`)
        .then(response => response.json())
        .then(response => {

            document.getElementById(`participants_${confEvent.id_conf_event}`).innerHTML = response
                .map(partenaires => ` 
		<li class="group  hover:bg-zinc-700">
		<a class="dropdown-item hover:bg-zinc-700" title="${partenaires.contact.prenom} ${partenaires.contact.nom}"  
		style="cursor:pointer"
		onClick="display('${confEvent.jury_event.id_jury_event_enc}','https://www.event2one.com/screen_manager/content/titrage_participant/?id_contact=${partenaires.contact.id_contact}')">
			<div class="flex justify-between"> 
				<div class="flex justify-start">	
					<div class="group-hover:text-sky-700">
						<i class="bi bi-cast text-2xl"></i>
					</div>
					<img src="${partenaires.contact.photos.small}" alt="" class="w-6 h-6 rounded-full mx-2">
					<div class="text-white">${partenaires.contact.prenom} ${partenaires.contact.nom}, ${partenaires.contact.societe} ${partenaires.contact.fonction}</div>
				</div>
				<img src="${partenaires.contact.logos.small}" alt="" class="w-6 h-6 rounded-full">
			</div> 
		</a>
	</li>
		`).join('')
        })
        .catch(error => console.error(error))
}

const getJuryDemoList = async (confEvent) => {

    const response = await fetch(`https://www.mlg-consulting.com/smart_territory/form/api.php?action=getJuryDemoList&params= WHERE id_jury=${confEvent.jury_event.id_jury.id_jury}`)
        .then(response => response.json())
        .then(response => {

            document.getElementById(`candidats_${confEvent.jury_event.id_jury_event}`).innerHTML = response
                .sort(function (a, b) { return a.ordre_passage - b.ordre_passage })
                .filter(juryDemo => juryDemo.is_nomine == "1" && juryDemo.is_visible == "1")
                .map(juryDemo => ` 
    <li class="group  hover:bg-zinc-700">
		<a class="dropdown-item hover:bg-zinc-700" title="${juryDemo.id_jury_demo}"  
		style="cursor:pointer"
		onClick="display('${confEvent.jury_event.id_jury_event_enc}','https://www.event2one.com/screen_manager/content/candidat/?ie=1727&iclList=1261,3039,2294,2304,951,1272&rapport=n&id_jury_demo=${juryDemo.id_jury_demo}')">
			<div class="flex justify-between"> 
				
				<div class="flex justify-start">	
					<div class="group-hover:text-sky-700">
						<i class="bi bi-cast text-2xl"></i>
					</div>
					<div class="rounded-full bg-gray-700 text-white  w-8 h-8 flex justify-center items-center mx-2">${juryDemo.ordre_passage}</div>
					<div class="text-white">${juryDemo.presta.presta_nom}</div>
				</div>
				<img src="${juryDemo.presta.visuels.small}" alt="" class="w-6 h-6 rounded-full">
			</div> 
		</a>
	</li>
`).join('')
        })
}

const getJuryEventList = async () => {
    const response = await fetch(`https://www.mlg-consulting.com/smart_territory/form/api.php?action=getConfEvent&id_event=1727&filter= AND type IN(67, 96) AND publier!='n'`)
        .then(response => response.json())
        .then(data => {
            console.log(data);
            data.map(confEvent => document.getElementById("juryEventSelect").innerHTML += `<option value="${confEvent.jury_event.id_jury_event_enc}">${confEvent.conf_event_date} - ${confEvent.heure_debut} - ${confEvent.conf_event_lang.cel_titre}</option>`)
            data.map(confEvent => document.getElementById("programme").innerHTML += `<tr class=" bg-neutral-900 hover:bg-neutral-800 hover:rounded text-white ">
			<td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-500 sm:pl-6"> ${confEvent.conf_event_date}  - ${confEvent.heure_debut}</td> 
			<td> ${confEvent.conf_event_lang.cel_titre}</td>
			<td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
				<button class="sessionQrcode border-4 border-gray-700 text-white p-2 rounded text-sm" value="${confEvent.jury_event.id_jury_event_enc}" onClick="
                display('${confEvent.jury_event.id_jury_event_enc}', 'https://www.event2one.com/screen_manager/content/blank.php'),
                display('${confEvent.jury_event.id_jury_event_enc}', 'https://www.event2one.com/screen_manager/content/blank.php',6)"> <i class="fa-solid fa-screencast"></i> Transparent</button>
				<button class="sessionQrcode border-4 border-gray-700 text-white p-2 rounded text-sm" value="${confEvent.jury_event.id_jury_event_enc}" onClick="display('${confEvent.jury_event.id_jury_event_enc}', 'https://www.event2one.com/screen_manager/content/session_qrcode/?ije=${confEvent.jury_event.id_jury_event_enc}')"> <i class="fa-solid fa-screencast"></i> Qrcode app+</button>
				<button class="sessionQrcode border-4 border-gray-700 text-white p-2 rounded text-sm"  value="${confEvent.jury_event.id_jury_event_enc}" onClick="display('${confEvent.jury_event.id_jury_event_enc}','https://www.event2one.com/screen_manager/content/candidat/?ie=1727&iclList=1261,3039,2294,2304,951,1272&rapport=y')">Rapport Tech'xplo.</button>
				<button class="sessionQrcode border-4 border-gray-700 text-white p-2 rounded text-sm" value="${confEvent.jury_event.id_jury_event_enc}" onClick="display('${confEvent.jury_event.id_jury_event_enc}','https://www.event2one.com/screen_manager/content/contacts/?ije=${confEvent.jury_event.id_jury_event}&id_event=1727&statut=jury,jure,coordinateur_jury')">Jury members</button>
				<button class="sessionQrcode border-4 border-gray-700 text-white p-2 rounded text-sm" value="${confEvent.jury_event.id_jury_event_enc}" onClick="display('${confEvent.jury_event.id_jury_event_enc}','https://www.event2one.com/parcours/vote/classement_slide.php?id_event=${confEvent.id_event.id_event}&scroll=n&ij=${confEvent.jury_event.id_jury?.id_jury}&ije=${confEvent.jury_event.id_jury_event}')">Classement</button>
				<button class="sessionQrcode border-4 border-gray-700 text-white p-2 rounded text-sm" value="${confEvent.jury_event.id_jury_event_enc}" onClick="display('${confEvent.jury_event.id_jury_event_enc}', 'https://www.event2one.com/screen_manager/content/titrage_conf_event_fixed/?id_conf_event=${confEvent.id_conf_event}')"> <i class="fa-solid fa-screencast"></i> Titre de la session ---</button>
	
				<div class="btn-group bg-zinc-800 ">
					<button type="button" class="btn btn-secondary dropdown-toggle bg-gray-700 b-none p-2 text-sm" data-bs-toggle="dropdown" aria-expanded="false">Candidats</button>
					<ul id="candidats_${confEvent.jury_event.id_jury_event}" class="dropdown-menu bg-zinc-800 divide-y divide-zinc-600 p-1 shadow-lg"></ul>
				</div>

				<div class="btn-group bg-zinc-800 ">
					<button type="button" class="btn btn-secondary dropdown-toggle bg-gray-700 b-none p-2 text-sm" data-bs-toggle="dropdown" aria-expanded="false">Autres participants</button>
					<ul id="participants_${confEvent.id_conf_event}" class="dropdown-menu bg-zinc-800 divide-y divide-zinc-600 p-1 shadow-lg"></ul>
				</div>

			</td>
		</tr>` );

            return data;
        })
        .then(data => {
            data.map(confEvent => getJuryDemoList(confEvent));
            data.map(confEvent => getPartenaires(confEvent));
        }
        )
}

getJuryEventList();

document.getElementById("juryEventSelect")
    .addEventListener("change", function () {
        console.log(this.value);
        screenId = document.getElementById("screenSelector").value;
        socket.emit('updateMediaContainer', { screenId: screenId, name: "ddddddddddddddddd", iframeSrc: `https://www.event2one.com/screen_manager/content/session_qrcode/?ije=${this.value}` });
    });

const btnList = document.querySelectorAll(".sessionQrcode");

//console.log('btnList', btnList);

const display = (id_jury_event_enc, src) => {
    screenId = document.getElementById("screenSelector").value;
    socket.emit('updateMediaContainer', { screenId: screenId, name: "ddddddddddddddddd", iframeSrc: src });
}

document.getElementById("screenSelector").addEventListener("change", function () {
    console.log('v', this.value);
    //privateMessage
    socket.emit('privateMessage', { screenId: this.value, message: `Direct messenger ${this.value} WTF!!!` });

});