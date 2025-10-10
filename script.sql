-- Supprimer la base si elle existe déjà
DROP DATABASE IF EXISTS Ouketi;

-- Créer la base de données
CREATE DATABASE Ouketi;

-- Utiliser la base de données
USE Ouketi;

-- Créer la table MotsCles
CREATE TABLE MotsCles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    libelle VARCHAR(20) NOT NULL
);

-- Insérer des mots-clés dans la table MotsCles
INSERT INTO
    MotsCles (libelle)
VALUES
    ('Plastique'),
    ('Métal'),
    ('Carton'),
    ('Verre'),
    ('Outil'),
    ('Rangement'),
    ('Jaune'),
    ('Rouge'),
    ('Bleu'),
    ('Vert');


-- Créer la table Objet
CREATE TABLE Objet (
    id INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
    nom VARCHAR(20) NOT NULL,
    quantite INT NOT NULL DEFAULT 1,
    estConteneur BOOLEAN NOT NULL DEFAULT FALSE,
    estContenuDans INT,
    FOREIGN KEY (estContenuDans) REFERENCES Objet(id)
);

-- Insérer des objets dans la table Objet
INSERT INTO
    Objet (nom, estConteneur, estContenuDans)
VALUES
    ('Boîte-1', TRUE, NULL),
    ('Tournevis', FALSE, 1),
    ('Scie', FALSE, 1);

-- Créer la table Correspond
CREATE TABLE Correspond (
    idObjet INT NOT NULL,
    idMotCle INT NOT NULL,
    PRIMARY KEY (idObjet, idMotCle),
    FOREIGN KEY (idObjet) REFERENCES Objet(id),
    FOREIGN KEY (idMotCle) REFERENCES MotsCles(id)
);

-- Insérer des correspondances dans la table Correspond
INSERT INTO
    Correspond (idObjet, idMotCle)
VALUES
    (3, 2),
    (3, 9),
    (2, 2),
    (2, 8),
    (1, 1);

------------------------------------------------------------------------

-- Requêtes à garder pour la suite

-- Afficher toutes les correspondances
SELECT * FROM correspond, motscles, objet WHERE correspond.idObjet = objet.id AND correspond.idMotCle = motscles.id;

-- Afficher les objets avec les mots clés "Plastique" et "Rouge"
SELECT * FROM correspond WHERE correspond.idMotCle = 8 AND correspond.idObjet IN (SELECT idObjet FROM correspond WHERE correspond.idMotCle = 2);

-- Afficher les objets avec plusieurs mots clés, sans limite
SELECT o.id, o.nom
FROM objet o
JOIN correspond c ON o.id = c.idObjet
JOIN motscles m ON c.idMotCle = m.id
WHERE m.libelle IN ('Plastique', 'Rouge') -- Ajouter d'autres mots-clés si nécessaire (autant qu'on veut)
GROUP BY o.id
HAVING COUNT(DISTINCT m.id) = 2; -- Remplacer 2 par le nombre de mots-clés recherchés (défini dans WHERE en fonction du nombre de mots-clés entrés)