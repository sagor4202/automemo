<?php
include 'config.php';
$stmt = $pdo->query("SELECT id, name, price FROM products ORDER BY name");
while ($row = $stmt->fetch()) {
    echo '<option value="' . $row['id'] . '" data-price="' . $row['price'] . '">' . $row['name'] . ' - ' . $row['price'] . '৳</option>';
}
?>