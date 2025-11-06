<?php
include 'config.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $type = $_POST['type'] ?? 'B'; // Default to Memo (B)
    echo generateMemoNumber($pdo, $type);
}
?>