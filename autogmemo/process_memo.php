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
            $stmt = $pdo->prepare("INSERT INTO customers (name, phone, address) VALUES (?, ?, ?)");
            $stmt->execute([
                $memoData['customer_name'], 
                $memoData['customer_phone'] ?? '',
                $memoData['customer_address'] ?? ''
            ]);
            $customerId = $pdo->lastInsertId();
        }
        
        // Save memo
        $stmt = $pdo->prepare("INSERT INTO memos (memo_number, customer_id, customer_name, customer_address, subtotal, discount, total, memo_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            $memoData['memo_number'],
            $customerId,
            $memoData['customer_name'] ?? null,
            $memoData['customer_address'] ?? null,
            $memoData['subtotal'],
            $memoData['discount'],
            $memoData['total'],
            $memoData['memo_date']
        ]);
        
        $memoId = $pdo->lastInsertId();
        
        // Save memo items
        $stmt = $pdo->prepare("INSERT INTO memo_items (memo_id, product_id, product_name, bags, quantity, unit, unit_price, amount) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
        
        foreach ($memoData['items'] as $item) {
            if (!empty($item['product_name'])) {
                $stmt->execute([
                    $memoId,
                    $item['product_id'],
                    $item['product_name'],
                    $item['bags'],
                    $item['quantity'],
                    $item['unit'] ?? 'কে.জি',
                    $item['unit_price'],
                    $item['amount']
                ]);
            }
        }
        
        $pdo->commit();
        
        // Generate preview with new design
        $preview = generateMemoPreview($memoData);
        
        echo json_encode(['success' => true, 'preview' => $preview]);
        
    } catch (Exception $e) {
        $pdo->rollBack();
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}

function numberToBengaliWords($number) {
    $units = ['', 'এক', 'দুই', 'তিন', 'চার', 'পাঁচ', 'ছয়', 'সাত', 'আট', 'নয়'];
    $teens = ['দশ', 'এগারো', 'বারো', 'তেরো', 'চৌদ্দ', 'পনেরো', 'ষোল', 'সতেরো', 'আঠারো', 'উনিশ'];
    $tens = ['', '', 'বিশ', 'ত্রিশ', 'চল্লিশ', 'পঞ্চাশ', 'ষাট', 'সত্তর', 'আশি', 'নব্বই'];
    $hundreds = ['', 'একশ', 'দুইশ', 'তিনশ', 'চারশ', 'পাঁচশ', 'ছয়শ', 'সাতশ', 'আটশ', 'নয়শ'];
    
    $crore = 10000000;
    $lakh = 100000;
    $thousand = 1000;
    $hundred = 100;
    
    if ($number === 0) return 'শূন্য';
    
    $words = '';
    
    // Handle crore part
    if ($number >= $crore) {
        $words .= numberToBengaliWords(floor($number / $crore)) . ' কোটি ';
        $number %= $crore;
    }
    
    // Handle lakh part
    if ($number >= $lakh) {
        $words .= numberToBengaliWords(floor($number / $lakh)) . ' লক্ষ ';
        $number %= $lakh;
    }
    
    // Handle thousand part
    if ($number >= $thousand) {
        $words .= numberToBengaliWords(floor($number / $thousand)) . ' হাজার ';
        $number %= $thousand;
    }
    
    // Handle hundred part
    if ($number >= $hundred) {
        $words .= $hundreds[floor($number / $hundred)] . ' ';
        $number %= $hundred;
    }
    
    // Handle tens and units
    if ($number > 0) {
        if ($number < 10) {
            $words .= $units[$number];
        } else if ($number < 20) {
            $words .= $teens[$number - 10];
        } else {
            $words .= $tens[floor($number / 10)];
            if ($number % 10 > 0) {
                $words .= ' ' . $units[$number % 10];
            }
        }
    }
    
    return trim($words);
}

function convertAmountToBengaliWords($amount) {
    $taka = floor($amount);
    $poisha = round(($amount - $taka) * 100);
    
    $words = '';
    
    if ($taka > 0) {
        $words .= numberToBengaliWords($taka) . ' টাকা';
    }
    
    if ($poisha > 0) {
        if ($words !== '') $words .= ' এবং ';
        $words .= numberToBengaliWords($poisha) . ' পয়সা';
    }
    
    if ($words === '') {
        $words = 'শূন্য টাকা';
    }
    
    return $words . ' মাত্র';
}

function generateMemoPreview($data) {
    // Format date
    $memoDate = new DateTime($data['memo_date']);
    $day = $memoDate->format('d');
    $month = $memoDate->format('m');
    $year = $memoDate->format('Y');
    
    $isChalan = $data['cash_memo_type'] === 'চালান';
    $amountInWords = convertAmountToBengaliWords($data['total']);
    
    $html = '
    <div class="preview-sheet">
        <header class="brand">
            <h1>' . ($data['shop_name'] ?: 'ব্রাদার্স এন্টারপ্রাইজ') . '</h1>
            <div class="subbox">' . ($data['cash_memo_type'] ?: 'ক্যাশ মেমো') . '</div>
            <div class="contacts">মোবাইল: ' . ($data['mobile_number'] ?: '01679610868, 01707387608') . '</div>
            <div class="address">' . ($data['business_type'] ?: 'এখানে গার্মেন্টস কোয়ালিটি ওয়েজিং মাল ক্রয় ও বিক্রয় করা হয়।') . '<br>' . ($data['shop_address'] ?: 'আদমজী নগর-১৪৩১, সিদ্দিরগঞ্জ, নারায়ণগঞ্জ।') . '</div>
        </header>

        <div class="info-row">
            <div class="meta">
                <div class="label">নং:</div>
                <div class="box">' . $data['memo_number'] . '</div>
            </div>

            <div class="meta" style="align-items:flex-end;">
                <div class="label">তারিখ:</div>
                <div style="display:flex; gap:8px;">
                    <div class="box">' . $day . '</div>
                    <div class="box">' . $month . '</div>
                    <div class="box">' . $year . '</div>
                </div>
            </div>
        </div>

        <div class="name-row">
            নাম: ' . ($data['customer_name'] ?: 'সাধারণ গ্রাহক') . '
        </div>

        <table class="items">
            <thead>
                <tr>
                    <th style="width:56px;">সংখ্যা</th>
                    <th>মালের বিবরণ</th>
                    <th class="col-shaded">বস্তা</th>
                    <th class="col-bags">পরিমান</th>
                    <th class="col-rate">দর</th>
                    <th class="col-amount">টাকা</th>
                </tr>
            </thead>
            <tbody>';
    
    $counter = 1;
    
    foreach ($data['items'] as $item) {
        if (!empty($item['product_name'])) {
            $bags = $item['bags'] > 0 ? $item['bags'] : '&nbsp;';
            $quantity = $item['quantity'] . ' ' . ($item['unit'] ?? 'কে.জি');
            
            // For চালান, keep দর and টাকা columns blank
            $unitPrice = $isChalan ? '&nbsp;' : ($item['unit_price'] > 0 ? number_format($item['unit_price'], 2) : '&nbsp;');
            $amount = $isChalan ? '&nbsp;' : ($item['amount'] > 0 ? number_format($item['amount'], 2) : '&nbsp;');
            
            $html .= '
                <tr>
                    <td class="col-num">' . $counter . '</td>
                    <td class="desc">' . $item['product_name'] . '</td>
                    <td class="col-shaded">' . $bags . '</td>
                    <td class="col-qty">' . $quantity . '</td>
                    <td class="col-rate">' . $unitPrice . '</td>
                    <td class="col-amount">' . $amount . '</td>
                </tr>';
            $counter++;
        }
    }
    
    // Add empty rows
    for ($i = $counter; $i <= 6; $i++) {
        $html .= '
            <tr>
                <td class="col-num">' . $i . '</td>
                <td class="desc" style="height:40px;"></td>
                <td class="col-shaded"></td>
                <td class="col-qty"></td>
                <td class="col-rate"></td>
                <td class="col-amount"></td>
            </tr>';
    }
    
    // Total amount - show for both memo types but blank for chalan
    $totalAmount = $isChalan ? '&nbsp;' : number_format($data['total'], 2);
    
    $html .= '
            <tr>
                <td colspan="5" style="border-right:none; padding:10px; text-align:right; font-weight:700;">মোট</td>
                <td class="total-cell">' . $totalAmount . '</td>
            </tr>
            </tbody>
        </table>

        <div class="notes">কথায়ঃ ' . $amountInWords . '</div>

        <!-- Signature section shows for BOTH memo types -->
        <div class="signature-section">
            <div class="signature-container">
                <div class="signature-line left">
                    <div class="line"></div>
                    <div>ক্রেতার স্বাক্ষর</div>
                </div>
                <div class="signature-line right">
                    <div class="line"></div>
                    <div>বিক্রেতার স্বাক্ষর</div>
                </div>
            </div>
        </div>
    </div>';
    
    return $html;
}
?>