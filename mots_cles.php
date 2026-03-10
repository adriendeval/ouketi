<?php

header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/db.php';

try {
    $pdo = getPdo();
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

    $count = count($ids);
    $idPlaceholders = [];
    foreach (array_values($ids) as $index => $idValue) {
        $idPlaceholders[] = ':id' . $index;
    }
    $placeholders = implode(',', $idPlaceholders);

    $sql = "
        SELECT o.id, o.nom, o.quantite, o.estConteneur, o.estContenuDans, p.nom AS parentNom
        FROM objet o
        LEFT JOIN objet p ON o.estContenuDans = p.id
        JOIN correspond c ON o.id = c.idObjet
        WHERE c.idMotCle IN ($placeholders)
        GROUP BY o.id
        HAVING COUNT(c.idMotCle) = :match_count
    ";

    $stmt = $pdo->prepare($sql);
    foreach (array_values($ids) as $index => $idValue) {
        $stmt->bindValue(':id' . $index, (int)$idValue, PDO::PARAM_INT);
    }
    $stmt->bindValue(':match_count', (int)$count, PDO::PARAM_INT);
    $stmt->execute();
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

// Requête légère: récupérer uniquement les mots-clés
$sql = "
    SELECT
        m.id AS mot_cle_id,
        m.libelle
    FROM motscles m
    ORDER BY m.libelle ASC
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
}

echo json_encode(array_values($mots_cles), JSON_UNESCAPED_UNICODE);
