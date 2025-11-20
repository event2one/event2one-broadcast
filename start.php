<?php

// Ce script n'est pas destiné à renvoyer du JSON, mais du HTML/texte.
// On retire les en-têtes JSON pour un affichage correct dans le navigateur.
// header("Access-Control-Allow-Origin:*");
// header('Access-Control-Allow-Methods: POST, GET, JSON');
// header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
// header('Content-Type: application/json');

class Application
{
    private $applicationPath;
    private $processPattern;

    public function __construct($path)
    {
        // On s'assure que le chemin est sécurisé pour l'exécution de commandes
        $this->applicationPath = escapeshellarg($path);
        // On définit un motif unique pour trouver le processus
        $this->processPattern = 'node ' . $this->applicationPath . '/[s]erver.js';
    }

    /**
     * Démarre l'application en arrière-plan.
     */
    public function start()
    {
        if ($this->isRunning()) {
            echo '<div class="bg-yellow-200 p-2 rounded mb-5">L\'application est déjà en cours d\'exécution.</div>';
            return;
        }
        // La commande 'cd' change le répertoire, '&&' exécute la suite seulement si 'cd' réussit.
        // 'nohup' permet au processus de continuer même si le terminal est fermé.
        // '> /dev/null 2>&1 &' redirige toutes les sorties et lance le processus en arrière-plan.
        $command = 'cd ' . $this->applicationPath . ' && nohup /usr/bin/node server.js > /dev/null 2>&1 &';
        shell_exec($command);
        // On attend une seconde pour laisser le temps au processus de démarrer avant de vérifier son statut
        sleep(1);
        echo '<div class="bg-green-200 p-2 rounded mb-5">Tentative de démarrage de l\'application...</div>';
    }

    /**
     * Vérifie si l'application est en cours d'exécution.
     * @return bool
     */
    public function isRunning()
    {
        // pgrep -f cherche le motif dans la liste complète des commandes.
        $command = 'pgrep -f "' . $this->processPattern . '"';
        $output = shell_exec($command);
        // Si la sortie n'est pas vide, pgrep a trouvé au moins un PID.
        return !empty($output);
    }

    /**
     * Affiche le statut de l'application.
     */
    public function check()
    {
        if ($this->isRunning()) {
            echo '<div class="bg-green-200 p-2 rounded mb-5">L\'application est en cours d\'exécution.</div>';
        } else {
            echo '<div class="bg-red-200 p-2 rounded mb-5">L\'application est arrêtée.</div>';
        }
    }

    /**
     * Arrête l'application.
     */
    public function stop()
    {
        // pkill -f tue tous les processus correspondant au motif.
        $command = 'pkill -f "' . $this->processPattern . '"';
        shell_exec($command);
        echo '<div class="bg-yellow-200 p-2 rounded mb-5">Tentative d\'arrêt de l\'application...</div>';
    }
}

// --- Interface Web ---
?>
<!DOCTYPE html>
<html lang="fr">

<head>
    <meta charset="UTF-8">
    <title>Gestionnaire d'application Broadcast</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>

<body class="bg-gray-100 p-10">
    <div class="max-w-md mx-auto bg-white p-6 rounded-lg shadow-lg">
        <h1 class="text-2xl font-bold mb-5">Gestionnaire Broadcast</h1>

        <?php
        // Utilisation de la classe Application
        $application = new Application('/var/www/e2o/node_apps/broadcast');

        // Logique pour gérer les actions GET
        if (isset($_GET['action'])) {
            switch ($_GET['action']) {
                case 'start':
                    $application->start();
                    break;
                case 'stop':
                    $application->stop();
                    break;
                case 'check':
                    // L'action 'check' est effectuée par défaut plus bas
                    break;
            }
        }

        // Affiche toujours le statut actuel de l'application
        $application->check();
        ?>

        <div class="flex space-x-4">
            <a href="?action=start" class="flex-1 text-center bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                Démarrer
            </a>
            <a href="?action=stop" class="flex-1 text-center bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
                Arrêter
            </a>
        </div>
    </div>
</body>

</html>