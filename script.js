var tousLesMotsCles = ["Plastique", "Métal", "Carton", "Verre", "Outil", "Rangement", "Jaune", "Rouge", "Bleu", "Vert"];
var motsClesRestants = [];
var motsClesSelectionnes = [];

var debug;
var divMotsClesRestants;
var divMotsClesSelectionnes;

function writeln(message) {
    if (debug) {
        debug.innerHTML += message + "\n";
    }
}

function bodyOnLoad() {
    debug = document.getElementById("debug");
    divMotsClesRestants = document.getElementById("motsClesRestants");
    divMotsClesSelectionnes = document.getElementById("motsClesSelectionnes");

    init();
    afficherMotsClesRestants();
    afficherMotsClesSelectionnes();
}

function init() {
    motsClesRestants = [];
    motsClesSelectionnes = [];

    for (var i = 0; i < tousLesMotsCles.length; i++) {
        motsClesRestants[i] = tousLesMotsCles[i];
    }
}

function afficherMotsClesRestants() {
    divMotsClesRestants.innerHTML = '<abbr title="Double-cliquez pour réinitialiser">Mots Clés</abbr> : ';

    var abbrElement = divMotsClesRestants.querySelector('abbr');
    abbrElement.ondblclick = function () {
        writeln("Mots-clés réinitialisés");
        init();
        afficherMotsClesRestants();
        afficherMotsClesSelectionnes();
    };

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
        writeln(motsClesRestants.indexOf(motCle));
        motsClesSelectionnes.push(motCle);
        motsClesRestants.splice(idx, 1);
    } else if (motsClesSelectionnes.indexOf(motCle) !== -1) {
        writeln(motsClesSelectionnes.indexOf(motCle));
        motsClesRestants.push(motCle);
        motsClesSelectionnes.splice(idx, 1);

    }

    afficherMotsClesRestants();
    afficherMotsClesSelectionnes();
}