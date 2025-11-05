<?php
include 'config.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $type = $_POST['type'] ?? 'C';
    echo generateMemoNumber($pdo, $type);
}
?>