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
    $nom = trim($_POST['nom'] ?? '');
    $quantite = (int) ($_POST['quantite'] ?? 1);
    $estConteneur = isset($_POST['estConteneur']) ? 1 : 0;
    $estContenuDans = $_POST['estContenuDans'] ?? '';
    $estContenuDans = $estContenuDans === '' ? null : (int) $estContenuDans;

    if ($id <= 0) {
        $error = 'ID invalide.';
    } elseif ($nom === '') {
        $error = 'Le nom est obligatoire.';
    } elseif ($quantite < 1) {
        $error = 'La quantité doit être supérieure ou égale à 1.';
    } elseif ($estContenuDans !== null && $estContenuDans === $id) {
        $error = 'Un objet ne peut pas se contenir lui-même.';
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

            // Vérifier que l'objet existe
            $checkStmt = $pdo->prepare('SELECT id FROM objet WHERE id = ?');
            $checkStmt->execute([$id]);
            if (!$checkStmt->fetch()) {
                $pdo->rollBack();
                $error = 'Objet introuvable.';
            } else {
                $stmt = $pdo->prepare('UPDATE objet SET nom = ?, quantite = ?, estConteneur = ?, estContenuDans = ? WHERE id = ?');
                $stmt->execute([$nom, $quantite, $estConteneur, $estContenuDans, $id]);

                // Mise à jour des mots-clés
                $pdo->prepare('DELETE FROM correspond WHERE idObjet = ?')->execute([$id]);
                $motsClesPost = $_POST['motsCles'] ?? [];
                if (!empty($motsClesPost)) {
                    $stmtMc = $pdo->prepare('INSERT INTO correspond (idObjet, idMotCle) VALUES (?, ?)');
                    foreach ($motsClesPost as $mcId) {
                        $stmtMc->execute([$id, (int)$mcId]);
                    }
                }

                $pdo->commit();
                $message = 'Modification enregistrée.';
            }
        } catch (Throwable $e) {
            if ($pdo->inTransaction()) {
                $pdo->rollBack();
            }
            $error = 'Erreur lors de la modification : ' . $e->getMessage();
        }
    }
}

$selectedId = isset($_GET['id']) ? (int) $_GET['id'] : (int) ($_POST['id'] ?? 0);

$objets = [];
$objet = null;
$conteneurs = [];
$tousMotsCles = [];
$objetMotsCles = [];

if ($pdo) {
    $objets = $pdo->query('SELECT id, nom FROM objet ORDER BY nom ASC')->fetchAll();
    $conteneurs = $pdo->query('SELECT id, nom FROM objet WHERE estConteneur = 1 ORDER BY nom ASC')->fetchAll();
    $tousMotsCles = $pdo->query('SELECT id, libelle FROM motscles ORDER BY libelle ASC')->fetchAll();

    if ($selectedId > 0) {
        $stmt = $pdo->prepare('SELECT id, nom, quantite, estConteneur, estContenuDans FROM objet WHERE id = ?');
        $stmt->execute([$selectedId]);
        $objet = $stmt->fetch();

        if (!$objet && $error === '') {
            $error = 'Objet introuvable.';
        }

        // Charger les mots-clés actuellement associés
        if ($objet) {
            $stmtMc = $pdo->prepare('SELECT idMotCle FROM correspond WHERE idObjet = ?');
            $stmtMc->execute([$selectedId]);
            $objetMotsCles = array_column($stmtMc->fetchAll(), 'idMotCle');
        }
    }
}
?>
<!DOCTYPE html>
<html lang="fr">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Modifier un objet</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
</head>

<body class="bg-light">
    <main class="container py-4" style="max-width: 860px;">
        <div class="d-flex justify-content-between align-items-center mb-3">
            <h1 class="h3 mb-0">Modifier un objet</h1>
            <a href="index.php" class="btn btn-outline-secondary btn-sm">Retour recherche</a>
        </div>

        <div class="mb-3 d-flex gap-2 flex-wrap">
            <a href="objet_ajout.php" class="btn btn-outline-success btn-sm">Ajouter</a>
            <a href="objet_suppression.php" class="btn btn-outline-danger btn-sm">Supprimer</a>
        </div>

        <?php if ($message !== ''): ?>
            <div class="alert alert-success"><?= htmlspecialchars($message, ENT_QUOTES, 'UTF-8') ?></div>
        <?php endif; ?>

        <?php if ($error !== ''): ?>
            <div class="alert alert-danger"><?= htmlspecialchars($error, ENT_QUOTES, 'UTF-8') ?></div>
        <?php endif; ?>

        <div class="card border-0 shadow-sm mb-3">
            <div class="card-body">
                <form method="get" action="objet_modif.php" class="row g-3 align-items-end">
                    <div class="col-md-8">
                        <label for="id" class="form-label">Choisir l'objet à modifier</label>
                        <select class="form-select" id="id" name="id" required>
                            <option value="">Sélectionner...</option>
                            <?php foreach ($objets as $item): ?>
                                <option value="<?= (int)$item['id'] ?>" <?= ((int)$item['id'] === $selectedId) ? 'selected' : '' ?>>
                                    #<?= (int)$item['id'] ?> - <?= htmlspecialchars($item['nom'], ENT_QUOTES, 'UTF-8') ?>
                                </option>
                            <?php endforeach; ?>
                        </select>
                    </div>
                    <div class="col-md-4">
                        <button type="submit" class="btn btn-primary">Charger</button>
                    </div>
                </form>
            </div>
        </div>

        <?php if ($objet): ?>
            <div class="card border-0 shadow-sm">
                <div class="card-body">
                    <form method="post" action="objet_modif.php" class="row g-3">
                        <input type="hidden" name="id" value="<?= (int)$objet['id'] ?>">

                        <div class="col-md-8">
                            <label for="nom" class="form-label">Nom</label>
                            <input type="text" class="form-control" id="nom" name="nom" required maxlength="20"
                                value="<?= htmlspecialchars($_POST['nom'] ?? $objet['nom'], ENT_QUOTES, 'UTF-8') ?>">
                        </div>

                        <div class="col-md-4">
                            <label for="quantite" class="form-label">Quantité</label>
                            <input type="number" class="form-control" id="quantite" name="quantite" min="1" required
                                value="<?= htmlspecialchars((string)($_POST['quantite'] ?? $objet['quantite']), ENT_QUOTES, 'UTF-8') ?>">
                        </div>

                        <div class="col-md-8">
                            <label for="estContenuDans" class="form-label">Contenu dans</label>
                            <?php $selectedParent = $_POST['estContenuDans'] ?? ($objet['estContenuDans'] ?? ''); ?>
                            <select class="form-select" id="estContenuDans" name="estContenuDans">
                                <option value="">Aucun conteneur</option>
                                <?php foreach ($conteneurs as $conteneur): ?>
                                    <?php if ((int)$conteneur['id'] === (int)$objet['id']) continue; ?>
                                    <?php $selected = ((string)$conteneur['id'] === (string)$selectedParent) ? 'selected' : ''; ?>
                                    <option value="<?= (int)$conteneur['id'] ?>" <?= $selected ?>>
                                        #<?= (int)$conteneur['id'] ?> - <?= htmlspecialchars($conteneur['nom'], ENT_QUOTES, 'UTF-8') ?>
                                    </option>
                                <?php endforeach; ?>
                            </select>
                        </div>

                        <div class="col-md-4 form-check ms-2 mt-4">
                            <?php $checkedConteneur = isset($_POST['estConteneur']) ? true : ((int)$objet['estConteneur'] === 1); ?>
                            <input class="form-check-input" type="checkbox" id="estConteneur" name="estConteneur" <?= $checkedConteneur ? 'checked' : '' ?>>
                            <label class="form-check-label" for="estConteneur">Conteneur</label>
                        </div>

                        <div class="col-12">
                            <label class="form-label">Mots-clés</label>
                            <div class="d-flex flex-wrap gap-2">
                                <?php
                                $mcPostIds = isset($_POST['motsCles']) ? array_map('intval', $_POST['motsCles']) : ($objetMotsCles ?? []);
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
                            <button type="submit" class="btn btn-primary">Enregistrer la modification</button>
                        </div>
                    </form>
                </div>
            </div>
        <?php endif; ?>
    </main>
</body>

</html>
