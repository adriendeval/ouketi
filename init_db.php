<?php
$db = new PDO('sqlite:' . __DIR__ . '/ouketi.db');
$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
$db->exec('PRAGMA journal_mode=WAL');
$db->exec('PRAGMA foreign_keys=ON');

$db->exec('DROP TABLE IF EXISTS correspond');
$db->exec('DROP TABLE IF EXISTS objet');
$db->exec('DROP TABLE IF EXISTS motscles');

$db->exec('CREATE TABLE motscles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    libelle VARCHAR(20) NOT NULL
)');

$db->exec('CREATE TABLE objet (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nom VARCHAR(20) NOT NULL,
    quantite INTEGER NOT NULL DEFAULT 1,
    estConteneur INTEGER NOT NULL DEFAULT 0,
    estContenuDans INTEGER,
    FOREIGN KEY (estContenuDans) REFERENCES objet(id)
)');

$db->exec('CREATE TABLE correspond (
    idObjet INTEGER NOT NULL,
    idMotCle INTEGER NOT NULL,
    PRIMARY KEY (idObjet, idMotCle),
    FOREIGN KEY (idObjet) REFERENCES objet(id),
    FOREIGN KEY (idMotCle) REFERENCES motscles(id)
)');

$mots = ['Plastique','Métal','Carton','Verre','Outil','Rangement','Jaune','Rouge','Bleu','Vert'];
$s = $db->prepare('INSERT INTO motscles (libelle) VALUES (?)');
foreach ($mots as $m) { $s->execute([$m]); }

$db->exec("INSERT INTO objet (nom, estConteneur, estContenuDans) VALUES ('Boîte-1', 1, NULL)");
$db->exec("INSERT INTO objet (nom, estConteneur, estContenuDans) VALUES ('Tournevis', 0, 1)");
$db->exec("INSERT INTO objet (nom, estConteneur, estContenuDans) VALUES ('Scie', 0, 1)");

$db->exec('INSERT INTO correspond (idObjet, idMotCle) VALUES (3,2),(3,9),(2,2),(2,8),(1,1)');

echo "SQLite OK\n";
$r = $db->query('SELECT COUNT(*) as c FROM motscles')->fetch();
echo "motscles: {$r['c']}\n";
$r = $db->query('SELECT COUNT(*) as c FROM objet')->fetch();
echo "objet: {$r['c']}\n";
$r = $db->query('SELECT COUNT(*) as c FROM correspond')->fetch();
echo "correspond: {$r['c']}\n";
