// var tousLesMotsCles = [null, "Plastique", "Métal", "Carton", "Verre", "Outil", "Rangement", "Jaune", "Rouge", "Bleu", "Vert"];
var tousLesMotsCles = [];
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
    afficherTousLesMotsCles();
    afficherMotsClesSelectionnes();
}

function init() {
    motsClesRestants = [];
    motsClesSelectionnes = [];

    for (var i = 0; i < tousLesMotsCles.length; i++) {
        motsClesRestants[i] = tousLesMotsCles[i];
    }
}

function afficherTousLesMotsCles() {
    divMotsClesRestants.innerHTML = '<abbr title="Double-cliquez pour réinitialiser">Mots Clés</abbr> : ';

    var abbrElement = divMotsClesRestants.querySelector('abbr');
    abbrElement.ondblclick = function () {
        writeln("Mots-clés réinitialisés");
        init();
        afficherTousLesMotsCles();
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

    afficherTousLesMotsCles();
    afficherMotsClesSelectionnes();
}

function buttonSendOnClick() {
    writeln("Envoi des mots-clés sélectionnés : " + motsClesSelectionnes.join(", "));
}

// Charger tous les mots-clés depuis le fichier mots_cles.php
function chargerTousLesMotsCles() {
    const xhttp = new XMLHttpRequest();
    xhttp.open("GET", "mots_cles.php");
    xhttp.send();

    xhttp.onload = function () {
        const jsonObj = JSON.parse(xhttp.responseText);

        tousLesMotsCles = jsonObj.map(item => item.libelle);
 
        init();
        afficherTousLesMotsCles();
        afficherMotsClesSelectionnes();
    };
}

chargerTousLesMotsCles();