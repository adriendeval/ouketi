<?php

require_once __DIR__ . '/db.php';

$message = '';
$error = '';

try {
    $pdo = getPdo();
} catch (Throwable $e) {
    $pdo = null;
    $error = 'Connexion BD impossible : ' . $e->getMessage();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && $pdo) {
    $id = (int) ($_POST['id'] ?? 0);

    if ($id <= 0) {
        $error = 'ID invalide.';
    } else {
        try {
            $pdo->beginTransaction();

            $check = $pdo->prepare('SELECT id, nom FROM objet WHERE id = ?');
            $check->execute([$id]);
            $objet = $check->fetch();

            if (!$objet) {
                throw new RuntimeException('Objet introuvable.');
            }

            $stmtDetach = $pdo->prepare('UPDATE objet SET estContenuDans = NULL WHERE estContenuDans = ?');
            $stmtDetach->execute([$id]);

            $stmtDeleteLinks = $pdo->prepare('DELETE FROM correspond WHERE idObjet = ?');
            $stmtDeleteLinks->execute([$id]);

            $stmtDelete = $pdo->prepare('DELETE FROM objet WHERE id = ?');
            $stmtDelete->execute([$id]);

            $pdo->commit();
            $message = 'Objet supprimé : #' . (int)$id . ' - ' . $objet['nom'];
        } catch (Throwable $e) {
            if ($pdo->inTransaction()) {
                $pdo->rollBack();
            }
            $error = 'Erreur lors de la suppression : ' . $e->getMessage();
        }
    }
}

$objets = [];
if ($pdo) {
    $sql = 'SELECT o.id, o.nom, o.quantite, o.estConteneur, p.nom AS parentNom
            FROM objet o
            LEFT JOIN objet p ON p.id = o.estContenuDans
            ORDER BY o.id ASC';
    $objets = $pdo->query($sql)->fetchAll();
}
?>
<!DOCTYPE html>
<html lang="fr">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Supprimer un objet</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
</head>

<body class="bg-light">
    <main class="container py-4" style="max-width: 980px;">
        <div class="d-flex justify-content-between align-items-center mb-3">
            <h1 class="h3 mb-0">Supprimer un objet</h1>
            <a href="index.php" class="btn btn-outline-secondary btn-sm">Retour recherche</a>
        </div>

        <div class="mb-3 d-flex gap-2 flex-wrap">
            <a href="objet_ajout.php" class="btn btn-outline-success btn-sm">Ajouter</a>
            <a href="objet_modif.php" class="btn btn-outline-primary btn-sm">Modifier</a>
        </div>

        <?php if ($message !== ''): ?>
            <div class="alert alert-success"><?= htmlspecialchars($message, ENT_QUOTES, 'UTF-8') ?></div>
        <?php endif; ?>

        <?php if ($error !== ''): ?>
            <div class="alert alert-danger"><?= htmlspecialchars($error, ENT_QUOTES, 'UTF-8') ?></div>
        <?php endif; ?>

        <div class="card border-0 shadow-sm">
            <div class="card-body p-0">
                <div class="table-responsive">
                    <table class="table table-hover align-middle mb-0">
                        <thead class="table-light">
                            <tr>
                                <th>ID</th>
                                <th>Nom</th>
                                <th>Quantité</th>
                                <th>Type</th>
                                <th>Conteneur parent</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php if (count($objets) === 0): ?>
                                <tr>
                                    <td colspan="6" class="text-center text-muted py-4">Aucun objet à supprimer.</td>
                                </tr>
                            <?php else: ?>
                                <?php foreach ($objets as $objet): ?>
                                    <tr>
                                        <td>#<?= (int)$objet['id'] ?></td>
                                        <td><?= htmlspecialchars($objet['nom'], ENT_QUOTES, 'UTF-8') ?></td>
                                        <td><?= (int)$objet['quantite'] ?></td>
                                        <td><?= ((int)$objet['estConteneur'] === 1) ? 'Conteneur' : 'Objet' ?></td>
                                        <td><?= $objet['parentNom'] ? htmlspecialchars($objet['parentNom'], ENT_QUOTES, 'UTF-8') : '-' ?></td>
                                        <td>
                                            <form method="post" action="objet_suppression.php" onsubmit="return confirm('Confirmer la suppression de cet objet ?');">
                                                <input type="hidden" name="id" value="<?= (int)$objet['id'] ?>">
                                                <button type="submit" class="btn btn-danger btn-sm">Supprimer</button>
                                            </form>
                                        </td>
                                    </tr>
                                <?php endforeach; ?>
                            <?php endif; ?>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </main>
</body>

</html>
