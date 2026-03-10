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
    $nom = trim($_POST['nom'] ?? '');
    $quantite = (int) ($_POST['quantite'] ?? 1);
    $estConteneur = isset($_POST['estConteneur']) ? 1 : 0;
    $estContenuDans = $_POST['estContenuDans'] ?? '';
    $estContenuDans = $estContenuDans === '' ? null : (int) $estContenuDans;

    if ($nom === '') {
        $error = 'Le nom est obligatoire.';
    } elseif ($quantite < 1) {
        $error = 'La quantité doit être supérieure ou égale à 1.';
    } elseif ($estContenuDans !== null) {
        $stmtParent = $pdo->prepare('SELECT id FROM objet WHERE id = ?');
        $stmtParent->execute([$estContenuDans]);
        if (!$stmtParent->fetch()) {
            $error = 'Le conteneur parent sélectionné n\'existe pas.';
        }
    }

    if ($error === '') {
        try {
            $pdo->beginTransaction();

            $stmt = $pdo->prepare('INSERT INTO objet (nom, quantite, estConteneur, estContenuDans) VALUES (?, ?, ?, ?)');
            $stmt->execute([$nom, $quantite, $estConteneur, $estContenuDans]);
            $newId = (int) $pdo->lastInsertId();

            // Enregistrer les mots-clés
            $motsClesPost = $_POST['motsCles'] ?? [];
            if (!empty($motsClesPost)) {
                $stmtMc = $pdo->prepare('INSERT INTO correspond (idObjet, idMotCle) VALUES (?, ?)');
                foreach ($motsClesPost as $mcId) {
                    $stmtMc->execute([$newId, (int)$mcId]);
                }
            }

            $pdo->commit();
            $message = 'Objet ajouté avec succès.';
            $_POST = [];
        } catch (Throwable $e) {
            if ($pdo->inTransaction()) {
                $pdo->rollBack();
            }
            $error = 'Erreur lors de l\'ajout : ' . $e->getMessage();
        }
    }
}

$conteneurs = [];
$tousMotsCles = [];
if ($pdo) {
    $conteneurs = $pdo->query('SELECT id, nom FROM objet WHERE estConteneur = 1 ORDER BY nom ASC')->fetchAll();
    $tousMotsCles = $pdo->query('SELECT id, libelle FROM motscles ORDER BY libelle ASC')->fetchAll();
}
?>
<!DOCTYPE html>
<html lang="fr">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ajouter un objet</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
</head>

<body class="bg-light">
    <main class="container py-4" style="max-width: 760px;">
        <div class="d-flex justify-content-between align-items-center mb-3">
            <h1 class="h3 mb-0">Ajouter un objet</h1>
            <a href="index.php" class="btn btn-outline-secondary btn-sm">Retour recherche</a>
        </div>

        <div class="mb-3 d-flex gap-2 flex-wrap">
            <a href="objet_modif.php" class="btn btn-outline-primary btn-sm">Modifier</a>
            <a href="objet_suppression.php" class="btn btn-outline-danger btn-sm">Supprimer</a>
        </div>

        <?php if ($message !== ''): ?>
            <div class="alert alert-success"><?= htmlspecialchars($message, ENT_QUOTES, 'UTF-8') ?></div>
        <?php endif; ?>

        <?php if ($error !== ''): ?>
            <div class="alert alert-danger"><?= htmlspecialchars($error, ENT_QUOTES, 'UTF-8') ?></div>
        <?php endif; ?>

        <div class="card border-0 shadow-sm">
            <div class="card-body">
                <form method="post" action="objet_ajout.php" class="row g-3">
                    <div class="col-12">
                        <label for="nom" class="form-label">Nom</label>
                        <input type="text" class="form-control" id="nom" name="nom" required maxlength="20"
                            value="<?= htmlspecialchars($_POST['nom'] ?? '', ENT_QUOTES, 'UTF-8') ?>">
                    </div>

                    <div class="col-md-4">
                        <label for="quantite" class="form-label">Quantité</label>
                        <input type="number" class="form-control" id="quantite" name="quantite" min="1" required
                            value="<?= htmlspecialchars($_POST['quantite'] ?? '1', ENT_QUOTES, 'UTF-8') ?>">
                    </div>

                    <div class="col-md-8">
                        <label for="estContenuDans" class="form-label">Contenu dans</label>
                        <select class="form-select" id="estContenuDans" name="estContenuDans">
                            <option value="">Aucun conteneur</option>
                            <?php foreach ($conteneurs as $conteneur): ?>
                                <?php $selected = ((string)($conteneur['id']) === (string)($_POST['estContenuDans'] ?? '')) ? 'selected' : ''; ?>
                                <option value="<?= (int)$conteneur['id'] ?>" <?= $selected ?>>
                                    #<?= (int)$conteneur['id'] ?> - <?= htmlspecialchars($conteneur['nom'], ENT_QUOTES, 'UTF-8') ?>
                                </option>
                            <?php endforeach; ?>
                        </select>
                    </div>

                    <div class="col-12 form-check ms-2">
                        <input class="form-check-input" type="checkbox" id="estConteneur" name="estConteneur"
                            <?= isset($_POST['estConteneur']) ? 'checked' : '' ?>>
                        <label class="form-check-label" for="estConteneur">Cet objet est un conteneur</label>
                    </div>

                    <div class="col-12">
                        <label class="form-label">Mots-clés</label>
                        <div class="d-flex flex-wrap gap-2">
                            <?php
                            $mcPostIds = isset($_POST['motsCles']) ? array_map('intval', $_POST['motsCles']) : [];
                            foreach ($tousMotsCles as $mc):
                                $checked = in_array((int)$mc['id'], $mcPostIds) ? 'checked' : '';
                            ?>
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" name="motsCles[]" value="<?= (int)$mc['id'] ?>" id="mc_<?= (int)$mc['id'] ?>" <?= $checked ?>>
                                    <label class="form-check-label" for="mc_<?= (int)$mc['id'] ?>"><?= htmlspecialchars($mc['libelle'], ENT_QUOTES, 'UTF-8') ?></label>
                                </div>
                            <?php endforeach; ?>
                        </div>
                    </div>

                    <div class="col-12">
                        <button type="submit" class="btn btn-primary">Enregistrer l'ajout</button>
                    </div>
                </form>
            </div>
        </div>
    </main>
</body>

</html>
