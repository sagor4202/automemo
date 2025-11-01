<?php
include 'config.php';
$stmt = $pdo->query("SELECT id, name FROM customers ORDER BY name");
while ($row = $stmt->fetch()) {
    echo '<option value="' . $row['id'] . '">' . $row['name'] . '</option>';
}
?>