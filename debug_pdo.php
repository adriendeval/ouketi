<?php
$host = 'localhost';
$db   = 'ouketi';
$user = 'root';
$pass = 'root';

echo "Test de connexion MySQL...\n";
echo "Host: $host\n";
echo "DB: $db\n";
echo "User: $user\n";

echo "Extensions chargées:\n";
if (extension_loaded('pdo')) echo "- PDO: OK\n";
else echo "- PDO: NON\n";
if (extension_loaded('pdo_mysql')) echo "- PDO_MYSQL: OK\n";
else echo "- PDO_MYSQL: NON\n";

try {
    $dsn = "mysql:host=$host;dbname=$db;charset=utf8mb4";
    $pdo = new PDO($dsn, $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    echo "Connexion RÉUSSIE !\n";
} catch (PDOException $e) {
    echo "Connexion ÉCHOUÉE : " . $e->getMessage() . "\n";
} catch (Throwable $e) {
    echo "Autre Erreur : " . $e->getMessage() . "\n";
}
