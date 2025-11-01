<?php
include 'config.php';
$memo_number = "GM" . date('Ymd') . rand(100, 999);
?>
<!DOCTYPE html>
<html lang="bn">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AutoGMemo - ডিজিটাল মেমো সিস্টেম</title>
    <link rel="stylesheet" href="style.css">
    <link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
</head>
<body>
    <div class="container">
        <header class="no-print">
            <h1>AutoGMemo - ডিজিটাল মেমো সিস্টেম</h1>
        </header>

        <div class="memo-form no-print">
            <!-- Shop Information Section -->
            <div class="shop-info-section">
                <h3>দোকানের তথ্য</h3>
                <div class="form-row">
                    <div class="form-group">
                        <label>দোকানের নাম:</label>
                        <input type="text" id="shop_name" placeholder="আপনার দোকানের নাম লিখুন" value="আপনার দোকানের নাম">
                    </div>
                    <div class="form-group">
                        <label>ঠিকানা:</label>
                        <input type="text" id="shop_address" placeholder="দোকানের ঠিকানা লিখুন" value="আইডেন সেন্টার, নিউ মার্কেট, ঢাকা">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>ফোন নম্বর:</label>
                        <input type="text" id="shop_phone" placeholder="দোকানের ফোন নম্বর" value="০১৭১২-৩৪৫৬৭৮">
                    </div>
                    <div class="form-group">
                        <label>টিন নম্বর:</label>
                        <input type="text" id="shop_tin" placeholder="টিন নম্বর (ঐচ্ছিক)" value="১২৩৪৬৫৭৮৯০১২৩">
                    </div>
                </div>
            </div>

            <!-- Memo Information Section -->
            <div class="form-row">
                <div class="form-group">
                    <label>মেমো নং:</label>
                    <input type="text" id="memo_number" value="<?php echo $memo_number; ?>">
                </div>
                <div class="form-group">
                    <label>তারিখ:</label>
                    <input type="date" id="memo_date" value="<?php echo date('Y-m-d'); ?>">
                </div>
            </div>

            <!-- Customer Information -->
            <div class="form-group">
                <div class="button-container">
                    <label style="margin-right: 15px;">গ্রাহক:</label>
                    <select id="customer_id" style="flex: 1;">
                        <option value="">গ্রাহক নির্বাচন করুন</option>
                    </select>
                    <button type="button" onclick="addNewCustomer()" class="new-customer-btn">+ নতুন গ্রাহক</button>
                </div>
            </div>

            <div class="customer-details" id="customer_details" style="display:none;">
                <div class="form-row">
                    <input type="text" id="customer_name" placeholder="গ্রাহকের নাম">
                    <input type="text" id="customer_phone" placeholder="গ্রাহকের ফোন নম্বর">
                </div>
            </div>

            <!-- Products Section -->
            <div class="items-section">
                <h3>পণ্যের তালিকা</h3>
                
                <div class="manual-product-section">
                    <div class="form-row">
                        <div class="form-group">
                            <label>নতুন পণ্যের নাম:</label>
                            <input type="text" id="new_product_name" placeholder="পণ্যের নাম লিখুন">
                        </div>
                        <div class="form-group">
                            <label>দর:</label>
                            <input type="number" id="new_product_price" placeholder="দর লিখুন" step="0.01">
                        </div>
                        <div class="form-group">
                            <label>পরিমাণ:</label>
                            <input type="number" id="new_product_quantity" placeholder="পরিমাণ" step="0.01" value="1">
                        </div>
                        <div class="form-group">
                            <button type="button" onclick="addManualProduct()" class="add-product-btn" style="margin-top: 25px;">পণ্য যোগ করুন</button>
                        </div>
                    </div>
                </div>

                <table id="items_table">
                    <thead>
                        <tr>
                            <th>পণ্য</th>
                            <th>পরিমাণ</th>
                            <th>দর</th>
                            <th>মোট</th>
                            <th>অ্যাকশন</th>
                        </tr>
                    </thead>
                    <tbody id="items_body">
                        <tr class="item-row">
                            <td>
                                <select class="product-select" onchange="updatePrice(this)">
                                    <option value="">পণ্য নির্বাচন করুন</option>
                                </select>
                            </td>
                            <td><input type="number" class="quantity" step="0.01" value="1" onchange="calculateRowTotal(this)"></td>
                            <td><input type="number" class="unit-price" step="0.01" onchange="calculateRowTotal(this)"></td>
                            <td><span class="row-total">0.00</span></td>
                            <td><button type="button" class="remove-btn" onclick="removeRow(this)">মুছুন</button></td>
                        </tr>
                    </tbody>
                </table>
                
                <div class="section-buttons">
                    <button type="button" onclick="addNewRow()" class="add-row-btn">+ সারি যোগ করুন</button>
                </div>
            </div>

            <!-- Calculation Section -->
            <div class="calculation-section">
                <div class="form-row">
                    <div class="form-group">
                        <label>সাবটোটাল:</label>
                        <input type="number" id="subtotal" value="0" readonly>
                    </div>
                    <div class="form-group">
                        <label>ছাড়:</label>
                        <input type="number" id="discount" value="0" step="0.01" onchange="calculateTotal()">
                    </div>
                    <div class="form-group">
                        <label>মোট টাকা:</label>
                        <input type="number" id="total_amount" value="0" readonly>
                    </div>
                </div>
            </div>

            <!-- Action Buttons -->
            <div class="form-actions">
                <button type="button" onclick="generateMemo()" class="generate-btn">📄 মেমো জেনারেট করুন</button>
                <button type="button" onclick="saveMemo()" class="save-btn">💾 মেমো সেভ করুন</button>
                <button type="button" onclick="printMemo()" class="print-btn">🖨️ মেমো প্রিন্ট করুন</button>
                <button type="button" onclick="clearForm()" class="clear-btn">🔄 নতুন মেমো</button>
            </div>
        </div>

        <!-- Memo Preview Section -->
        <div id="memo_preview_section" class="memo-preview-section" style="display: none;">
            <div class="preview-header">
                <h2>মেমো প্রিভিউ</h2>
                <p>নিচের মেমোটি পর্যালোচনা করুন এবং প্রিন্ট দিন</p>
            </div>
            <div id="memo_preview" class="memo-preview"></div>
            <div class="preview-actions">
                <button type="button" onclick="printMemo()" class="print-preview-btn">🖨️ মেমো প্রিন্ট করুন</button>
                <button type="button" onclick="closePreview()" class="close-preview-btn">✖️ প্রিভিউ বন্ধ করুন</button>
            </div>
        </div>
    </div>

    <script src="js/script.js"></script>
</body>
</html>