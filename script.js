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
        placeholder.textContent = 'Aucun mot-clé sélectionné. Sélectionnez des mots-clés ci-dessus pour filtrer les objets.';
        divMotsClesSelectionnes.appendChild(placeholder);
    } else {
        const selectionWrapper = document.createElement('div');
        selectionWrapper.className = 'd-flex flex-wrap gap-2 align-items-center';

        const label = document.createElement('span');
        label.className = 'fw-bold me-2';
        label.textContent = 'Filtres actifs :';
        selectionWrapper.appendChild(label);

        motsClesSelectionnes.forEach(motCle => {
            if (!motCle) return;

            const btnGroup = document.createElement('div');
            btnGroup.className = 'btn-group';
            btnGroup.role = 'group';

            const btnLabel = document.createElement('button');
            btnLabel.type = 'button';
            btnLabel.className = 'btn btn-primary btn-sm disabled';
            btnLabel.style.opacity = '1';
            btnLabel.textContent = motCle.libelle;
            
            const btnClose = document.createElement('button');
            btnClose.type = 'button';
            btnClose.className = 'btn btn-primary btn-sm';
            btnClose.innerHTML = '&times;';
            btnClose.dataset.id = motCle.id;
            btnClose.onclick = buttonOnClick;
            btnClose.title = 'Retirer ce filtre';

            btnGroup.appendChild(btnLabel);
            btnGroup.appendChild(btnClose);
            selectionWrapper.appendChild(btnGroup);
        });

        divMotsClesSelectionnes.appendChild(selectionWrapper);
    }

    // Lancer la recherche automatiquement
    updateResults();
}

function buttonOnClick() {
    const id = parseInt(this.dataset.id);

    const indexRestant = motsClesRestants.findIndex(mc => mc.id === id);
    const indexSelectionne = motsClesSelectionnes.findIndex(mc => mc.id === id);

    writeln("Clic : " + (indexRestant !== -1 ? motsClesRestants[indexRestant].libelle : motsClesSelectionnes[indexSelectionne].libelle));

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

async function updateResults() {
    const container = document.getElementById('resultatsRecherche');
    const motsClesSelectionnesIds = motsClesSelectionnes.map(motCle => motCle.id);
    
    if (motsClesSelectionnesIds.length === 0) {
        container.innerHTML = '';
        return;
    }

    writeln("Recherche pour les IDs : " + motsClesSelectionnesIds.join(', '));
    
    try {
        const response = await fetch(`mots_cles.php?search_ids=${motsClesSelectionnesIds.join(',')}`);
        if (!response.ok) {
            throw new Error("Erreur lors de la recherche. Statut: " + response.status);
        }
        const objets = await response.json();
        renderResultats(objets);
    } catch (error) {
        writeln("Erreur recherche : " + error.message);
        container.innerHTML = `<div class="alert alert-danger">Erreur : ${error.message}</div>`;
    }
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

async function buttonSendOnClick() {
    const motsClesSelectionnesIds = motsClesSelectionnes.map(motCle => motCle.id);
    writeln("Envoi des mots-clés sélectionnés (IDs) : " + motsClesSelectionnesIds.join(', '));

    const container = document.getElementById('resultatsRecherche');
    container.innerHTML = '<div class="text-center"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Chargement...</span></div></div>';

    if (motsClesSelectionnesIds.length === 0) {
        container.innerHTML = '<div class="alert alert-warning">Veuillez sélectionner au moins un mot-clé pour lancer la recherche.</div>';
        return;
    }

    try {
        const response = await fetch(`mots_cles.php?search_ids=${motsClesSelectionnesIds.join(',')}`);
        if (!response.ok) {
            throw new Error("Erreur lors de la recherche. Statut: " + response.status);
        }
        const objets = await response.json();
        renderResultats(objets);
    } catch (error) {
        writeln("Erreur recherche : " + error.message);
        container.innerHTML = `<div class="alert alert-danger">Erreur : ${error.message}</div>`;
    }
}

function renderResultats(objets) {
    const container = document.getElementById('resultatsRecherche');
    container.innerHTML = '';

    const title = document.createElement('h3');
    title.className = 'mb-3';
    title.textContent = 'Résultats de la recherche (' + objets.length + ')';
    container.appendChild(title);

    if (objets.length === 0) {
        const alert = document.createElement('div');
        alert.className = 'alert alert-info';
        alert.textContent = 'Aucun objet ne correspond à tous les mots-clés sélectionnés.';
        container.appendChild(alert);
        return;
    }

    const table = document.createElement('table');
    table.className = 'table table-hover table-bordered align-middle shadow-sm';

    const thead = document.createElement('thead');
    thead.className = 'table-light';
    thead.innerHTML = `
        <tr>
            <th scope="col">ID</th>
            <th scope="col">Nom</th>
            <th scope="col">Quantité</th>
            <th scope="col">Type</th>
            <th scope="col">Localisation</th>
        </tr>
    `;
    table.appendChild(thead);

    const tbody = document.createElement('tbody');

    objets.forEach(objet => {
        const quantite = typeof objet.quantite === 'number' ? objet.quantite : 1;
        const typeLibelle = objet.estConteneur ? '<span class="badge bg-success">Conteneur</span>' : '<span class="badge bg-secondary">Objet</span>';
        const localisation = objet.estContenuDans ? 'Dans <span class="fw-bold">#' + objet.estContenuDans + '</span>' : '<span class="text-muted fst-italic">Non contenu</span>';

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${objet.id}</td>
            <td class="fw-bold">${objet.nom}</td>
            <td>${quantite}</td>
            <td>${typeLibelle}</td>
            <td>${localisation}</td>
        `;
        tbody.appendChild(row);
    });

    table.appendChild(tbody);
    container.appendChild(table);
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

window.onload = bodyOnLoad;