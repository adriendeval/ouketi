// var tousLesMotsCles = [null, "Plastique", "Métal", "Carton", "Verre", "Outil", "Rangement", "Jaune", "Rouge", "Bleu", "Vert"];
var tousLesMotsCles = [];
var motsClesRestants = [];
var motsClesSelectionnes = [];

var debug;
var divMotsClesRestants;
var divMotsClesSelectionnes;

function writeln(message) {
    if (debug) {
        // Utilise insertAdjacentHTML pour éviter de supprimer les écouteurs d'événements
        debug.insertAdjacentHTML('beforeend', message + "\n");
    }
}

function bodyOnLoad() {
    debug = document.getElementById("debug");
    divMotsClesRestants = document.getElementById("motsClesRestants");
    divMotsClesSelectionnes = document.getElementById("motsClesSelectionnes");

    // L'initialisation se fait après le chargement des données
    chargerTousLesMotsCles();
}

function init() {
    motsClesRestants = [...tousLesMotsCles]; // Copie complète des objets
    motsClesSelectionnes = [];
}

function render() {
    divMotsClesRestants.innerHTML = '';

    const controlsRow = document.createElement('div');
    controlsRow.className = 'd-flex align-items-center justify-content-between flex-wrap gap-2 mb-3';

    const availableLabel = document.createElement('span');
    availableLabel.className = 'text-uppercase text-muted small fw-semibold';
    availableLabel.textContent = 'Filtres disponibles';
    controlsRow.appendChild(availableLabel);

    const resetBtn = document.createElement('button');
    resetBtn.type = 'button';
    resetBtn.className = 'btn btn-sm btn-outline-secondary';
    resetBtn.textContent = 'Réinitialiser';
    resetBtn.onclick = () => {
        writeln('Mots-clés réinitialisés');
        init();
        render();
    };
    controlsRow.appendChild(resetBtn);

    divMotsClesRestants.appendChild(controlsRow);

    if (!motsClesRestants.length) {
        const emptyState = document.createElement('div');
        emptyState.className = 'alert alert-warning mb-0';
        emptyState.textContent = 'Tous les mots-clés ont été sélectionnés.';
        divMotsClesRestants.appendChild(emptyState);
    } else {
        const buttonWrapper = document.createElement('div');
        buttonWrapper.className = 'd-flex flex-wrap gap-2';

        motsClesRestants.forEach(motCle => {
            if (!motCle) {
                return;
            }

            const bouton = document.createElement('button');
            bouton.type = 'button';
            bouton.className = 'btn btn-outline-secondary btn-sm';
            bouton.textContent = '(' + motCle.id + ') ' + motCle.libelle;
            bouton.dataset.id = motCle.id;
            bouton.onclick = buttonOnClick;
            bouton.title = buildMotCleTooltip(motCle);
            buttonWrapper.appendChild(bouton);
        });

        divMotsClesRestants.appendChild(buttonWrapper);
    }

    divMotsClesSelectionnes.innerHTML = '';

    if (!motsClesSelectionnes.length) {
        const placeholder = document.createElement('div');
        placeholder.className = 'alert alert-info mb-0';
        placeholder.textContent = 'Aucun mot-clé sélectionné pour le moment.';
        divMotsClesSelectionnes.appendChild(placeholder);
        return;
    }

    motsClesSelectionnes.forEach(motCle => {
        if (!motCle) {
            return;
        }

        const card = document.createElement('div');
        card.className = 'card border-0 shadow-sm mb-3';

        const cardBody = document.createElement('div');
        cardBody.className = 'card-body';

        const headerRow = document.createElement('div');
        headerRow.className = 'd-flex align-items-center flex-wrap gap-2 mb-3';

        const title = document.createElement('h5');
        title.className = 'mb-0 me-auto';
        title.textContent = '(' + motCle.id + ') ' + motCle.libelle;
        headerRow.appendChild(title);

        const metaWrapper = document.createElement('div');
        metaWrapper.className = 'd-flex align-items-center gap-2';

        const badge = document.createElement('span');
        badge.className = 'badge bg-primary-subtle text-primary-emphasis';
        const count = Array.isArray(motCle.objets) ? motCle.objets.length : 0;
        badge.textContent = count + (count > 1 ? ' objets' : ' objet');
        metaWrapper.appendChild(badge);

        const actionBtn = document.createElement('button');
        actionBtn.type = 'button';
        actionBtn.className = 'btn btn-sm btn-outline-primary';
        actionBtn.textContent = 'Retirer';
        actionBtn.dataset.id = String(motCle.id);
        actionBtn.onclick = buttonOnClick;
        actionBtn.title = 'Retirer ce mot-clé de la sélection';
        metaWrapper.appendChild(actionBtn);

        headerRow.appendChild(metaWrapper);

        cardBody.appendChild(headerRow);
        cardBody.appendChild(createMotCleDetailsElement(motCle));

        card.appendChild(cardBody);
        divMotsClesSelectionnes.appendChild(card);
    });
}

function buttonOnClick() {
    const id = parseInt(this.dataset.id);

    const indexRestant = motsClesRestants.findIndex(mc => mc.id === id);
    const indexSelectionne = motsClesSelectionnes.findIndex(mc => mc.id === id);

    writeln("Clic : " + this.textContent);

    if (indexRestant !== -1) {
        // Déplacer de restants vers sélectionnés
        const [motCle] = motsClesRestants.splice(indexRestant, 1);
        motsClesSelectionnes.push(motCle);
    } else if (indexSelectionne !== -1) {
        // Déplacer de sélectionnés vers restants
        const [motCle] = motsClesSelectionnes.splice(indexSelectionne, 1);
        motsClesRestants.push(motCle);
        motsClesRestants.sort((a, b) => a.id - b.id);
    }

    render();
}

function buttonSendOnClick() {
    const motsClesSelectionnesIds = motsClesSelectionnes.map(motCle => motCle.id);
    writeln("Envoi des mots-clés sélectionnés (IDs) : " + motsClesSelectionnesIds.join(', '));
    return motsClesSelectionnesIds;
}

function buildMotCleTooltip(motCle) {
    if (!motCle || !motCle.objets || motCle.objets.length === 0) {
        return "Aucun objet associé";
    }

    return motCle.objets
        .map(objet => formatObjetDetails(objet))
        .join('\n');
}

function formatObjetDetails(objet) {
    if (!objet) {
        return '';
    }

    const quantite = typeof objet.quantite === 'number' && !Number.isNaN(objet.quantite) ? objet.quantite : 1;
    const typeLibelle = objet.estConteneur ? 'conteneur' : 'objet';
    const localisation = objet.estContenuDans ? 'dans #' + objet.estContenuDans : 'non contenu';

    return objet.nom + ' (x' + quantite + ', ' + typeLibelle + ', ' + localisation + ')';
}

function createMotCleDetailsElement(motCle) {
    const detailsContainer = document.createElement('div');
    detailsContainer.className = 'table-responsive';

    if (!motCle || !motCle.objets || motCle.objets.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'alert alert-light border mb-0';
        empty.textContent = 'Aucun objet associé';
        detailsContainer.appendChild(empty);
        return detailsContainer;
    }

    const table = document.createElement('table');
    table.className = 'table table-striped table-bordered table-sm align-middle mb-0';

    const thead = document.createElement('thead');
    thead.innerHTML = `
        <tr>
            <th scope="col">ID</th>
            <th scope="col">Nom</th>
            <th scope="col">Quantité</th>
            <th scope="col">Type</th>
            <th scope="col">Contenu</th>
        </tr>
    `;
    table.appendChild(thead);

    const tbody = document.createElement('tbody');

    motCle.objets.forEach(objet => {
        const quantite = typeof objet.quantite === 'number' && !Number.isNaN(objet.quantite) ? objet.quantite : 1;
        const typeLibelle = objet.estConteneur ? 'Conteneur' : 'Objet';
        const localisation = objet.estContenuDans ? 'Dans #' + objet.estContenuDans : 'Non contenu';

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${objet.id}</td>
            <td>${objet.nom}</td>
            <td>${quantite}</td>
            <td>${typeLibelle}</td>
            <td>${localisation}</td>
        `;
        tbody.appendChild(row);
    });

    table.appendChild(tbody);
    detailsContainer.appendChild(table);

    return detailsContainer;
}

// Charger tous les mots-clés depuis le fichier mots_cles.php
async function chargerTousLesMotsCles() {
    try {
        const response = await fetch("mots_cles.php");
        if (!response.ok) {
            throw new Error("Erreur de chargement des mots-clés. Statut: " + response.status);
        }
        tousLesMotsCles = await response.json();
        init();
        render();
    } catch (error) {
        writeln("Erreur : " + error.message);
    }
}

// Appeler bodyOnLoad lorsque le DOM est prêt
window.onload = bodyOnLoad;