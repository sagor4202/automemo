<?php
// Database configuration
$host = 'localhost';
$username = 'root';
$password = '';
$database = 'autogmemo';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$database", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    die("Connection failed: " . $e->getMessage());
}

// Create tables
$tables = [
    "CREATE TABLE IF NOT EXISTS customers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        phone VARCHAR(20),
        address TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )",
    
    "CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        unit VARCHAR(20) DEFAULT 'pcs',
        stock_quantity INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )",
    
    "CREATE TABLE IF NOT EXISTS memos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        memo_number VARCHAR(50) UNIQUE NOT NULL,
        customer_id INT,
        customer_name VARCHAR(100),
        subtotal DECIMAL(10,2) DEFAULT 0,
        discount DECIMAL(10,2) DEFAULT 0,
        total DECIMAL(10,2) DEFAULT 0,
        memo_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES customers(id)
    )",
    
    "CREATE TABLE IF NOT EXISTS memo_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        memo_id INT,
        product_id INT,
        product_name VARCHAR(100),
        quantity DECIMAL(10,2) NOT NULL,
        unit_price DECIMAL(10,2) NOT NULL,
        total_price DECIMAL(10,2) NOT NULL,
        FOREIGN KEY (memo_id) REFERENCES memos(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id)
    )"
];

foreach ($tables as $table) {
    $pdo->exec($table);
}

// Insert sample data with Bangla names
try {
    $pdo->exec("INSERT IGNORE INTO customers (id, name, phone) VALUES 
        (1, 'সাধারণ গ্রাহক', ''),
        (2, 'আব্দুল করিম', '01712345678'),
        (3, 'ফাতেমা বেগম', '01887654321'),
        (4, 'রহিম উদ্দিন', '01955667788')
    ");
    
    $pdo->exec("INSERT IGNORE INTO products (id, name, price, unit) VALUES 
        (1, 'মসুর ডাল', 110.00, 'কেজি'),
        (2, 'নাজিরশাইল চাল', 70.00, 'কেজি'),
        (3, 'প্রাণ সয়াবিন তেল', 130.00, 'লিটার'),
        (4, 'ডিম', 40.00, 'ডজন'),
        (5, 'চিনি', 85.00, 'কেজি'),
        (6, 'লাক্স সাবান', 35.00, 'টি'),
        (7, 'আরোমাটিক চা', 450.00, 'কেজি'),
        (8, 'আটা', 55.00, 'কেজি'),
        (9, 'লবণ', 25.00, 'কেজি'),
        (10, 'পেঁয়াজ', 45.00, 'কেজি')
    ");
} catch (PDOException $e) {
    // Continue if sample data exists
}

// Function to generate memo number
function generateMemoNumber($pdo, $type = 'C') {
    $currentYear = date('y'); // Last two digits of current year
    $prefix = $type . $currentYear;
    
    // Get the last memo number for this prefix
    $stmt = $pdo->prepare("SELECT memo_number FROM memos WHERE memo_number LIKE ? ORDER BY id DESC LIMIT 1");
    $stmt->execute([$prefix . '%']);
    $lastMemo = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($lastMemo) {
        $lastNumber = intval(substr($lastMemo['memo_number'], 3));
        $newNumber = $lastNumber + 1;
    } else {
        $newNumber = 1;
    }
    
    return $prefix . str_pad($newNumber, 4, '0', STR_PAD_LEFT);
}
?>