// Tableaux des boutons de l'application
var tousLesMotsCles = ["Plastique", "Métal", "Carton", "Verre", "Outil", "Rangement", "Jaune", "Rouge", "Bleu", "Vert"];
var motsClesRestants = [];
var motsClesSelectionnes = [];

// Éléments de l'interface
var debug;
var divMotsClesRestants;
var divMotsClesSelectionnes;

// Code de la fonction writeln
function writeln(message) {
    if (debug) {
        debug.innerHTML += message + "\n";
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
    // Initialiser les tableaux des boutons
    motsClesRestants = [];
    motsClesSelectionnes = [];

    for (var i = 0; i < tousLesMotsCles.length; i++) {
        motsClesRestants[i] = tousLesMotsCles[i];
    }

    // // Test (à supprimer plus tard)
    // motsClesSelectionnes.push(motsClesRestants[1]);
    // motsClesRestants.splice(1, 1);
}

function afficherMotsClesRestants() {
    // En fonction du contenu de motsClesRestants
    // Réafficher le contenu du div pour les mots clés restants
    // Générer un bouton pour chaque mot clé
    divMotsClesRestants.innerHTML = 'Mots Clés : ';
    for (var i = 0; i < motsClesRestants.length; i++) {
        var motCle = motsClesRestants[i];
        if (motCle != null) {
            const bouton = document.createElement("button");
            bouton.textContent = motCle;
            bouton.dataset.idx = i;
            bouton.onclick = buttonOnClick;
            divMotsClesRestants.appendChild(bouton);
        }
    }
}

function afficherMotsClesSelectionnes() {
    // En fonction du contenu de motsClesSelectionnes
    // Réafficher le contenu du div pour les mots clés sélectionnés
    // Générer un bouton pour chaque mot clé
    divMotsClesSelectionnes.innerHTML = 'Mots Choisis : ';
    for (var i = 0; i < motsClesSelectionnes.length; i++) {
        var motCle = motsClesSelectionnes[i];
        if (motCle != null) {
            const bouton = document.createElement("button");
            bouton.textContent = motCle;
            bouton.dataset.idx = i;
            bouton.onclick = buttonOnClick;
            divMotsClesSelectionnes.appendChild(bouton);
        }
    }
}

function buttonOnClick() {
    var idx = parseInt(this.dataset.idx);
    var motCle = this.textContent;

    writeln("Clic : " + motCle + " (index: " + idx + ")");

    if (motsClesRestants.indexOf(motCle) !== -1) {
        // Déplacer de "restants" vers "sélectionnés"
        writeln(motsClesRestants.indexOf(motCle));
        motsClesSelectionnes.push(motCle);
        motsClesRestants.splice(idx, 1);
    } else if (motsClesSelectionnes.indexOf(motCle) !== -1) {
        // Déplacer de "sélectionnés" vers "restants"
        writeln(motsClesSelectionnes.indexOf(motCle));
        motsClesRestants.push(motCle);
        motsClesSelectionnes.splice(idx, 1);
        
    }

    // Mettre à jour les deux DIVs
    afficherMotsClesRestants();
    afficherMotsClesSelectionnes();
}