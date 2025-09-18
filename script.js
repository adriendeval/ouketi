// Tableaux des boutons de l'application
var tousLesMotsCles = ["Plastique", "Métal", "Carton", "Verre", "Outil", "Rangement", "Jaune", "Rouge", "Bleu", "Vert"];
var motsClesRestants = [];
var motsClesSelectionnes = [];
var cptClics = 0;
var ordreSelection = {}; // Objet pour stocker l'ordre de sélection

// Éléments de l'interface
var debug;
var divMotsClesRestants;
var divMotsClesSelectionnes;

// Code de la fonction writeln
function writeln(message) {
    if (debug) {
        debug.innerHTML += message + "<br>";
    }
}

// Déclenchée une seule fois au chargement de la page
function bodyOnLoad() {

    // Réifier les éléments de l'interface
    debug = document.getElementById("debug");
    divMotsClesRestants = document.getElementById("motsClesRestants");
    divMotsClesSelectionnes = document.getElementById("motsClesSelectionnes");

    // Initialiser le mécanisme spécifique de l'application
    init();
    afficherMotsClesRestants();
    afficherMotsClesSelectionnes();
}

// Initialisation les tableaux des boutons
function init() {
    for (var i = 0; i < tousLesMotsCles.length; i++) {
        motsClesRestants[i] = tousLesMotsCles[i];
    }
}

function afficherMotsClesRestants() {
    // Ne vider que si nécessaire
    let boutonsExistants = divMotsClesRestants.querySelectorAll('.motCle');
    if (boutonsExistants.length !== motsClesRestants.length) {
        // Supprimer seulement les boutons, pas le titre
        boutonsExistants.forEach(btn => btn.remove());

        // Créer le titre s'il n'existe pas
        if (!divMotsClesRestants.querySelector('span')) {
            let titre = document.createElement("span");
            titre.innerText = "Mots-clés restants : ";
            divMotsClesRestants.appendChild(titre);
        }

        // Ajouter les nouveaux boutons
        for (let motCle of motsClesRestants) {
            let button = document.createElement("button");
            button.className = "motCle";
            button.innerText = motCle;
            button.style.cursor = "pointer";
            button.style.margin = "5px";
            button.onclick = function () {
                deplacerVersSelectionnes(motCle);
            };
            divMotsClesRestants.appendChild(button);
        }
    }
}

function afficherMotsClesSelectionnes() {
    divMotsClesSelectionnes.innerHTML = "";
    let titre = document.createElement("span");
    titre.innerText = "Mots-clés sélectionnés : ";
    divMotsClesSelectionnes.appendChild(titre);

    // Trier les mots-clés sélectionnés par ordre de sélection
    var motsClesTriés = motsClesSelectionnes.slice().sort(function (a, b) {
        return ordreSelection[a] - ordreSelection[b];
    });

    for (let motCle of motsClesTriés) {
        let button = document.createElement("button");
        button.className = "motCle";
        button.innerText = motCle;
        button.style.cursor = "pointer";
        button.style.margin = "5px";
        button.onclick = function () {
            deplacerVersRestants(motCle);
        };
        divMotsClesSelectionnes.appendChild(button);
    }
}

// Déplacer un mot-clé des restants vers les sélectionnés
function deplacerVersSelectionnes(motCle) {
    // Trouver l'index du mot-clé dans les restants
    var index = -1;
    for (var i = 0; i < motsClesRestants.length; i++) {
        if (motsClesRestants[i] === motCle) {
            index = i;
            break;
        }
    }

    // Si trouvé, le déplacer
    if (index !== -1) {
        cptClics++;
        ordreSelection[motCle] = cptClics;
        motsClesSelectionnes.push(motsClesRestants[index]);
        motsClesRestants.splice(index, 1);
        afficherMotsClesRestants();
        afficherMotsClesSelectionnes();
        debug.value += "Clic " + cptClics + "\n";
        debug.scrollTop = debug.scrollHeight;
    }
}

// Déplacer un mot-clé des sélectionnés vers les restants
function deplacerVersRestants(motCle) {
    // Trouver l'index du mot-clé dans les sélectionnés
    var index = -1;
    for (var i = 0; i < motsClesSelectionnes.length; i++) {
        if (motsClesSelectionnes[i] === motCle) {
            index = i;
            break;
        }
    }

    // Si trouvé, le déplacer
    if (index !== -1) {
        cptClics++;
        delete ordreSelection[motCle];
        motsClesRestants.push(motsClesSelectionnes[index]);
        motsClesSelectionnes.splice(index, 1);
        afficherMotsClesRestants();
        afficherMotsClesSelectionnes();
        debug.value += "Clic " + cptClics + "\n";
        debug.scrollTop = debug.scrollHeight;
    }
}