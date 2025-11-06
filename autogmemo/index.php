<?php
include 'config.php';

// Generate memo number based on type (B for memo, C for invoice)
$memo_type = isset($_GET['type']) ? $_GET['type'] : 'B';
$memo_number = generateMemoNumber($pdo, $memo_type);
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
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
</head>
<body>
    <div class="container">
        <header class="no-print">
            <h1>AutoGMemo - ডিজিটাল মেমো সিস্টেম</h1>
        </header>

        <div class="memo-form no-print">
            <!-- Company Information Section -->
            <div class="shop-info-section">
                <h3>কম্পানির তথ্য</h3>
                <div class="form-row">
                    <div class="form-group">
                        <label>কম্পানির নাম:</label>
                        <input type="text" id="shop_name" placeholder="আপনার কম্পানির নাম লিখুন" value="আপনার কম্পানির নাম">
                    </div>
                    <div class="form-group">
                        <label>ক্যাশ মেমো/চালান:</label>
                        <select id="cash_memo_type" onchange="togglePriceSection()" style="width: 100%; padding: 10px;">
                            <option value="ক্যাশ মেমো">ক্যাশ মেমো</option>
                            <option value="চালান">চালান</option>
                            <option value="ক্যাশ রিসিট">ক্যাশ রিসিট</option>
                        </select>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group full-width">
                        <label>মোবাইল নাম্বার:</label>
                        <input type="text" id="mobile_number" placeholder="মোবাইল নাম্বার লিখুন" value="০১৭১২-৩৪৫৬৭৮">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group half-width">
                        <label>ব্যবসার ধরন:</label>
                        <input type="text" id="business_type" placeholder="আপনার ব্যবসার ধরন লিখুন" value="এখানে গার্মেন্টস কোয়ালিটি ওয়েস্টিজ মাল ক্রয় ও বিক্রয় করা হয়">
                    </div>
                    <div class="form-group half-width">
                        <label>ঠিকানা:</label>
                        <input type="text" id="shop_address" placeholder="কম্পানির ঠিকানা লিখুন" value="আইডেন সেন্টার, নিউ মার্কেট, ঢাকা">
                    </div>
                </div>
            </div>

            <!-- Memo Information Section -->
            <div class="form-row">
                <div class="form-group">
                    <label>নং:</label>
                    <div class="memo-number-container">
                        <select id="memo_type" onchange="updateMemoNumber()" class="memo-type-select">
                            <option value="B">মেমো (B)</option>
                            <option value="C">চালান (C)</option>
                        </select>
                        <input type="text" id="memo_number" value="<?php echo $memo_number; ?>" readonly class="memo-number-input">
                    </div>
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
                    <div class="form-group">
                        <input type="text" id="customer_name" placeholder="গ্রাহকের নাম">
                    </div>
                    <div class="form-group">
                        <input type="text" id="customer_phone" placeholder="গ্রাহকের ফোন নম্বর">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group full-width">
                        <input type="text" id="customer_address" placeholder="গ্রাহকের ঠিকানা">
                    </div>
                </div>
            </div>

            <!-- Products Section -->
            <div class="items-section">
                <h3>পণ্যের তালিকা</h3>
                
                <div class="manual-product-section" id="manual_product_section">
                    <div class="form-row">
                        <div class="form-group">
                            <label>পণ্যের বিবরণ:</label>
                            <input type="text" id="new_product_name" placeholder="পণ্যের বিবরণ লিখুন">
                        </div>
                        <div class="form-group">
                            <label>বস্তা:</label>
                            <input type="number" id="new_product_bags" placeholder="বস্তা সংখ্যা" step="0.01" value="0">
                        </div>
                        <div class="form-group">
                            <label>পরিমাণ:</label>
                            <div class="quantity-with-unit">
                                <input type="number" id="new_product_quantity" placeholder="পরিমাণ" step="0.01" value="1">
                                <select id="new_product_unit">
                                    <option value="কে.জি">কে.জি</option>
                                    <option value="টা">টা</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-group price-field">
                            <label>দর:</label>
                            <input type="number" id="new_product_price" placeholder="দর লিখুন" step="0.01">
                        </div>
                        <div class="form-group price-field">
                            <label>টাকা:</label>
                            <input type="number" id="new_product_amount" placeholder="টাকা" step="0.01" readonly>
                        </div>
                        <div class="form-group">
                            <button type="button" onclick="addManualProduct()" class="add-product-btn" style="margin-top: 25px;">পণ্য যোগ করুন</button>
                        </div>
                    </div>
                </div>

                <table id="items_table">
                    <thead>
                        <tr>
                            <th>পণ্যের বিবরণ</th>
                            <th>বস্তা</th>
                            <th>পরিমাণ</th>
                            <th class="price-column">দর</th>
                            <th class="price-column">টাকা</th>
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
                            <td><input type="number" class="bags" step="0.01" value="0" placeholder="বস্তা"></td>
                            <td>
                                <div class="quantity-with-unit">
                                    <input type="number" class="quantity" step="0.01" value="1" placeholder="পরিমাণ">
                                    <select class="quantity-unit">
                                        <option value="কে.জি">কে.জি</option>
                                        <option value="টা">টা</option>
                                    </select>
                                </div>
                            </td>
                            <td class="price-column"><input type="number" class="unit-price" step="0.01" placeholder="দর" onchange="calculateRowTotal(this)"></td>
                            <td class="price-column"><input type="number" class="amount" step="0.01" placeholder="টাকা" readonly></td>
                            <td><button type="button" class="remove-btn" onclick="removeRow(this)">মুছুন</button></td>
                        </tr>
                    </tbody>
                </table>
                
                <div class="section-buttons">
                    <button type="button" onclick="addNewRow()" class="add-row-btn">+ সারি যোগ করুন</button>
                </div>
            </div>

            <!-- Calculation Section -->
            <div class="calculation-section" id="calculation_section">
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
                <button type="button" onclick="downloadMemo()" class="download-btn">📥 মেমো ডাউনলোড করুন</button>
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
                <button type="button" onclick="downloadMemo()" class="download-btn">📥 মেমো ডাউনলোড করুন</button>
                <button type="button" onclick="printMemo()" class="print-preview-btn">🖨️ মেমো প্রিন্ট করুন</button>
                <button type="button" onclick="closePreview()" class="close-preview-btn">✖️ প্রিভিউ বন্ধ করুন</button>
            </div>
        </div>
    </div>

    <script src="js/script.js"></script>
</body>
</html>