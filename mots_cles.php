<?php

header('Content-Type: application/json; charset=utf-8');

// Connexion à la base de données
$host = 'localhost';
$db   = 'ouketi';
$user = 'root';
$pass = 'root';

$dsn = "mysql:host=$host;dbname=$db;charset=utf8mb4";

try {
    $pdo = new PDO($dsn, $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    echo json_encode(['error' => 'Connexion échouée : ' . $e->getMessage()], JSON_UNESCAPED_UNICODE);
    exit();
}

if (isset($_GET['search_ids'])) {
    $ids = array_filter(array_map('intval', explode(',', $_GET['search_ids'])));

    if (empty($ids)) {
        echo json_encode([], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $placeholders = implode(',', array_fill(0, count($ids), '?'));
    $count = count($ids);

    $sql = "
        SELECT o.id, o.nom, o.quantite, o.estConteneur, o.estContenuDans
        FROM objet o
        JOIN correspond c ON o.id = c.idObjet
        WHERE c.idMotCle IN ($placeholders)
        GROUP BY o.id
        HAVING COUNT(DISTINCT c.idMotCle) = ?
    ";

    $stmt = $pdo->prepare($sql);
    $params = $ids;
    $params[] = $count;
    $stmt->execute($params);
    $objets = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($objets as &$row) {
        $row['id'] = (int)$row['id'];
        $row['quantite'] = (int)$row['quantite'];
        $row['estConteneur'] = (bool)$row['estConteneur'];
        $row['estContenuDans'] = $row['estContenuDans'] !== null ? (int)$row['estContenuDans'] : null;
    }

    echo json_encode($objets, JSON_UNESCAPED_UNICODE);
    exit;
}

// Requête pour récupérer les mots-clés ainsi que les objets associés
$sql = "
    SELECT
        m.id AS mot_cle_id,
        m.libelle,
        o.id AS objet_id,
        o.nom,
        o.quantite,
        o.estConteneur,
        o.estContenuDans
    FROM motscles m
    LEFT JOIN correspond c ON c.idMotCle = m.id
    LEFT JOIN objet o ON o.id = c.idObjet
    ORDER BY m.libelle ASC, o.nom ASC
";

$stmt = $pdo->prepare($sql);
$stmt->execute();

$mots_cles = [];

while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    $motCleId = (int) $row['mot_cle_id'];

    if (!isset($mots_cles[$motCleId])) {
        $mots_cles[$motCleId] = [
            'id' => $motCleId,
            'libelle' => $row['libelle'],
            'objets' => []
        ];
    }

    if (!empty($row['objet_id'])) {
        $mots_cles[$motCleId]['objets'][] = [
            'id' => (int) $row['objet_id'],
            'nom' => $row['nom'],
            'quantite' => isset($row['quantite']) ? (int) $row['quantite'] : null,
            'estConteneur' => (bool) $row['estConteneur'],
            'estContenuDans' => $row['estContenuDans'] !== null ? (int) $row['estContenuDans'] : null
        ];
    }
}

echo json_encode(array_values($mots_cles), JSON_UNESCAPED_UNICODE);
