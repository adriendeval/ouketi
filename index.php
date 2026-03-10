<!DOCTYPE html>
<html lang="fr">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Oukéti?</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet"
        integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">
    <script src="script.js"></script>
    <style>
        body {
            background: #f8f9fa;
        }

        .app-shell {
            max-width: 1234px;
        }

        .app-title {
            letter-spacing: 0.02em;
        }

        .section-card {
            border: 0;
            border-radius: 0.85rem;
            box-shadow: 0 0.125rem 0.5rem rgba(0, 0, 0, 0.05);
        }

        .section-card .card-header {
            background: #ffffff;
            border-bottom: 1px solid #e9ecef;
            font-weight: 600;
        }

        #motsClesRestants,
        #motsClesSelectionnes {
            min-height: 72px;
        }

        #resultatsRecherche h3,
        #detailsObjet h4 {
            font-size: 1.1rem;
            font-weight: 700;
        }

        #debug {
            height: 400px;
            background-color: #202020;
            color: white;
            font-family: 'Consolas', 'Courier New', Courier, monospace;
        }
    </style>
</head>

<body>

    <main class="container py-4 app-shell">
        <header class="text-center mb-4">
            <h1 class="app-title mb-2">Oukéti ?</h1>
            <p class="text-muted mb-0">Choisissez des mots-clés pour retrouver rapidement les objets correspondants.</p>
            <div class="d-flex justify-content-center gap-2 flex-wrap mt-3">
                <a href="objet_ajout.php" class="btn btn-success btn-sm">Ajouter un objet</a>
                <a href="objet_modif.php" class="btn btn-primary btn-sm">Modifier un objet</a>
                <a href="objet_suppression.php" class="btn btn-danger btn-sm">Supprimer un objet</a>
            </div>
        </header>

        <section class="card section-card mb-3">
            <div class="card-header" id="motsClesRestantsHeader">
                1) Mots-clés disponibles
            </div>
            <div id="motsClesRestants" class="card-body">
            </div>
        </section>

        <section class="card section-card mb-3">
            <div class="card-header">
                2) Filtres actifs
            </div>
            <div id="motsClesSelectionnes" class="card-body">
            </div>
        </section>

        <section class="card section-card mb-3">
            <div class="card-header">3) Résultats</div>
            <div class="card-body">
                <div id="resultatsRecherche"></div>
                <div id="detailsObjet" class="mt-3"></div>
            </div>
        </section>

        <div class="accordion" id="debugAccordion">
            <div class="accordion-item">
                <h2 class="accordion-header" id="debugHeader">
                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse"
                        data-bs-target="#collapseDebug" aria-expanded="false" aria-controls="collapseDebug">
                        Debug
                    </button>
                </h2>
                <div id="collapseDebug" class="accordion-collapse collapse" aria-labelledby="debugHeader"
                    data-bs-parent="#debugAccordion">
                    <div class="accordion-body p-0">
                        <textarea id="debug" class="form-control border-0" readonly></textarea>
                    </div>
                </div>
            </div>
        </div>
    </main>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"
        integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz"
        crossorigin="anonymous"></script>
</body>

</html>