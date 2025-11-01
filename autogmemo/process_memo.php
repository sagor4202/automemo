<?php
include 'config.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $memoData = json_decode($_POST['memo_data'], true);
    
    try {
        $pdo->beginTransaction();
        
        // Handle customer
        $customerId = $memoData['customer_id'];
        if (empty($customerId) && !empty($memoData['customer_name'])) {
            $stmt = $pdo->prepare("INSERT INTO customers (name, phone) VALUES (?, ?)");
            $stmt->execute([$memoData['customer_name'], $memoData['customer_phone'] ?? '']);
            $customerId = $pdo->lastInsertId();
        }
        
        // Save memo
        $stmt = $pdo->prepare("INSERT INTO memos (memo_number, customer_id, customer_name, subtotal, discount, total, memo_date) VALUES (?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            $memoData['memo_number'],
            $customerId,
            $memoData['customer_name'] ?? null,
            $memoData['subtotal'],
            $memoData['discount'],
            $memoData['total'],
            $memoData['memo_date']
        ]);
        
        $memoId = $pdo->lastInsertId();
        
        // Save memo items
        $stmt = $pdo->prepare("INSERT INTO memo_items (memo_id, product_id, product_name, quantity, unit_price, total_price) VALUES (?, ?, ?, ?, ?, ?)");
        
        foreach ($memoData['items'] as $item) {
            if (!empty($item['product_name'])) {
                $stmt->execute([
                    $memoId,
                    $item['product_id'],
                    $item['product_name'],
                    $item['quantity'],
                    $item['unit_price'],
                    $item['total_price']
                ]);
            }
        }
        
        $pdo->commit();
        
        // Generate preview with shop information
        $preview = generateMemoPreview($memoData);
        
        echo json_encode(['success' => true, 'preview' => $preview]);
        
    } catch (Exception $e) {
        $pdo->rollBack();
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}

function generateMemoPreview($data) {
    // Format date in Bangla style
    $memoDate = date('d/m/Y', strtotime($data['memo_date']));
    
    $html = '
    <div class="bangla-memo">
        <div class="memo-header-bangla">
            <div class="shop-name-bangla">' . ($data['shop_name'] ?: 'আপনার দোকানের নাম') . '</div>
            <div class="shop-address-bangla">' . ($data['shop_address'] ?: 'আইডেন সেন্টার, নিউ মার্কেট, ঢাকা') . '</div>
            <div class="shop-contact-bangla">মোবাইল: ' . ($data['shop_phone'] ?: '০১৭১২-৩৪৫৬৭৮') . ' | টিন: ' . ($data['shop_tin'] ?: '১২৩৪৫৬৭৮৯০১২৩') . '</div>
        </div>
        
        <div class="memo-title-bangla">মেমো</div>
        
        <table class="memo-info-table">
            <tr>
                <td width="30%">মেমো নং:</td>
                <td width="70%">' . $data['memo_number'] . '</td>
            </tr>
            <tr>
                <td>তারিখ:</td>
                <td>' . $memoDate . '</td>
            </tr>
            <tr>
                <td>গ্রাহকের নাম:</td>
                <td>' . ($data['customer_name'] ?: 'সাধারণ গ্রাহক') . '</td>
            </tr>
        </table>
        
        <table class="items-table-bangla">
            <thead>
                <tr>
                    <th width="5%">নং</th>
                    <th width="50%">পণ্যের বিবরণ</th>
                    <th width="15%">পরিমাণ</th>
                    <th width="15%">দর</th>
                    <th width="15%">মূল্য</th>
                </tr>
            </thead>
            <tbody>';
    
    $counter = 1;
    
    foreach ($data['items'] as $item) {
        if (!empty($item['product_name'])) {
            $html .= '
                <tr>
                    <td>' . $counter . '</td>
                    <td class="item-description">' . $item['product_name'] . '</td>
                    <td>' . $item['quantity'] . '</td>
                    <td>' . number_format($item['unit_price'], 2) . '</td>
                    <td>' . number_format($item['total_price'], 2) . '</td>
                </tr>';
            $counter++;
        }
    }
    
    // Add empty rows for traditional memo look
    for ($i = $counter; $i <= 8; $i++) {
        $html .= '
            <tr>
                <td>' . $i . '</td>
                <td class="item-description">&nbsp;</td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
            </tr>';
    }
    
    $html .= '
            </tbody>
        </table>
        
        <div class="total-section-bangla">
            <table class="total-table-bangla" align="right">
                <tr>
                    <td width="70%" align="right">মোট:</td>
                    <td width="30%" align="right">' . number_format($data['subtotal'], 2) . '৳</td>
                </tr>
                <tr>
                    <td align="right">ছাড়:</td>
                    <td align="right">' . number_format($data['discount'], 2) . '৳</td>
                </tr>
                <tr class="grand-total-bangla">
                    <td align="right"><strong>সর্বমোট:</strong></td>
                    <td align="right"><strong>' . number_format($data['total'], 2) . '৳</strong></td>
                </tr>
            </table>
        </div>
        
        <div class="memo-footer-bangla">
            <div class="thank-you-bangla">ধন্যবাদান্তে</div>
            <div class="signature-line">
                ..............................................<br>
                <em>দোকানদারের স্বাক্ষর</em>
            </div>
        </div>
    </div>';
    
    return $html;
}
?>