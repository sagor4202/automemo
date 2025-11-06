// Bengali Number to Words Converter
function numberToBengaliWords(number) {
    const units = ['', 'এক', 'দুই', 'তিন', 'চার', 'পাঁচ', 'ছয়', 'সাত', 'আট', 'নয়'];
    const teens = ['দশ', 'এগারো', 'বারো', 'তেরো', 'চৌদ্দ', 'পনেরো', 'ষোল', 'সতেরো', 'আঠারো', 'উনিশ'];
    const tens = ['', '', 'বিশ', 'ত্রিশ', 'চল্লিশ', 'পঞ্চাশ', 'ষাট', 'সত্তর', 'আশি', 'নব্বই'];
    const hundreds = ['', 'একশ', 'দুইশ', 'তিনশ', 'চারশ', 'পাঁচশ', 'ছয়শ', 'সাতশ', 'আটশ', 'নয়শ'];
    
    const crore = 10000000;
    const lakh = 100000;
    const thousand = 1000;
    const hundred = 100;
    
    if (number === 0) return 'শূন্য';
    
    let words = '';
    
    // Handle crore part
    if (number >= crore) {
        words += numberToBengaliWords(Math.floor(number / crore)) + ' কোটি ';
        number %= crore;
    }
    
    // Handle lakh part
    if (number >= lakh) {
        words += numberToBengaliWords(Math.floor(number / lakh)) + ' লক্ষ ';
        number %= lakh;
    }
    
    // Handle thousand part
    if (number >= thousand) {
        words += numberToBengaliWords(Math.floor(number / thousand)) + ' হাজার ';
        number %= thousand;
    }
    
    // Handle hundred part
    if (number >= hundred) {
        words += hundreds[Math.floor(number / hundred)] + ' ';
        number %= hundred;
    }
    
    // Handle tens and units
    if (number > 0) {
        if (number < 10) {
            words += units[number];
        } else if (number < 20) {
            words += teens[number - 10];
        } else {
            words += tens[Math.floor(number / 10)];
            if (number % 10 > 0) {
                words += ' ' + units[number % 10];
            }
        }
    }
    
    return words.trim();
}

function convertAmountToBengaliWords(amount) {
    const taka = Math.floor(amount);
    const poisha = Math.round((amount - taka) * 100);
    
    let words = '';
    
    if (taka > 0) {
        words += numberToBengaliWords(taka) + ' টাকা';
    }
    
    if (poisha > 0) {
        if (words !== '') words += ' এবং ';
        words += numberToBengaliWords(poisha) + ' পয়সা';
    }
    
    if (words === '') {
        words = 'শূন্য টাকা';
    }
    
    return words + ' মাত্র';
}

// Load customers and products on page load
$(document).ready(function() {
    loadCustomers();
    loadProducts();
    togglePriceSection(); // Initialize price section visibility
    setupAmountCalculation();
});

function setupAmountCalculation() {
    // Calculate amount when price or quantity changes in manual product section
    $('#new_product_price, #new_product_quantity').on('input', function() {
        const price = parseFloat($('#new_product_price').val()) || 0;
        const quantity = parseFloat($('#new_product_quantity').val()) || 0;
        const amount = price * quantity;
        $('#new_product_amount').val(amount.toFixed(2));
    });
    
    // Update amount in words when total changes
    $('#total_amount').on('change input', function() {
        updateAmountInWords();
    });
    
    $('#discount').on('change input', function() {
        updateAmountInWords();
    });
}

function updateAmountInWords() {
    const totalAmount = parseFloat($('#total_amount').val()) || 0;
    const amountInWords = convertAmountToBengaliWords(totalAmount);
    $('#amount_in_words').text(amountInWords);
}

function loadCustomers() {
    $.ajax({
        url: 'get_customers.php',
        type: 'GET',
        success: function(response) {
            $('#customer_id').html('<option value="">গ্রাহক নির্বাচন করুন</option>' + response);
        }
    });
}

function loadProducts() {
    $.ajax({
        url: 'get_products.php',
        type: 'GET',
        success: function(response) {
            $('.product-select').html('<option value="">পণ্য নির্বাচন করুন</option>' + response);
        }
    });
}

// Toggle price section based on cash memo type
function togglePriceSection() {
    const cashMemoType = $('#cash_memo_type').val();
    const isChalan = cashMemoType === 'চালান';
    
    if (isChalan) {
        // For চালান, HIDE price fields in form
        $('.price-field').hide();
        $('.price-column').hide();
        $('.calculation-section').hide();
        
        // Clear all prices
        $('.unit-price').val('');
        $('.amount').val('');
        $('#subtotal').val('0');
        $('#discount').val('0');
        $('#total_amount').val('0');
    } else {
        // For cash memo, SHOW price fields
        $('.price-field').show();
        $('.price-column').show();
        $('.calculation-section').show();
        
        // Show calculation section only if prices exist
        calculateSubtotal();
    }
    
    updateAmountInWords();
}

// Update memo number based on type selection
function updateMemoNumber() {
    const memoType = $('#memo_type').val();
    $.ajax({
        url: 'get_next_memo_number.php',
        type: 'POST',
        data: { type: memoType },
        success: function(response) {
            $('#memo_number').val(response);
        }
    });
}

function addNewCustomer() {
    $('#customer_details').show();
    $('#customer_id').val('');
}

// Add manual product function
function addManualProduct() {
    const productName = $('#new_product_name').val();
    const productBags = parseFloat($('#new_product_bags').val()) || 0;
    const productQuantity = parseFloat($('#new_product_quantity').val()) || 0;
    const productUnit = $('#new_product_unit').val();
    const productPrice = parseFloat($('#new_product_price').val()) || 0;
    const productAmount = parseFloat($('#new_product_amount').val()) || 0;
    const cashMemoType = $('#cash_memo_type').val();
    const isChalan = cashMemoType === 'চালান';
    
    if (!productName) {
        alert('দয়া করে পণ্যের বিবরণ লিখুন!');
        return;
    }
    
    // Add new row with manual product
    const newRow = `
        <tr class="item-row">
            <td>
                <input type="text" class="manual-product-name" value="${productName}" readonly style="border: none; background: transparent; width: 100%;">
            </td>
            <td><input type="number" class="bags" step="0.01" value="${productBags}" placeholder="বস্তা"></td>
            <td>
                <div class="quantity-with-unit">
                    <input type="number" class="quantity" step="0.01" value="${productQuantity}" placeholder="পরিমাণ" style="flex: 1;">
                    <select class="quantity-unit" style="width: 80px; margin-left: 5px;">
                        <option value="কে.জি" ${productUnit === 'কে.জি' ? 'selected' : ''}>কে.জি</option>
                        <option value="টা" ${productUnit === 'টা' ? 'selected' : ''}>টা</option>
                    </select>
                </div>
            </td>
            <td class="price-column"><input type="number" class="unit-price" step="0.01" value="${productPrice}" placeholder="দর" onchange="calculateRowTotal(this)"></td>
            <td class="price-column"><input type="number" class="amount" step="0.01" value="${productAmount}" placeholder="টাকা" readonly></td>
            <td><button type="button" class="remove-btn" onclick="removeRow(this)">মুছুন</button></td>
        </tr>
    `;
    $('#items_body').append(newRow);
    
    // Clear manual product inputs
    $('#new_product_name').val('');
    $('#new_product_bags').val('0');
    $('#new_product_quantity').val('1');
    $('#new_product_unit').val('কে.জি');
    $('#new_product_price').val('');
    $('#new_product_amount').val('');
    
    if (!isChalan) {
        calculateRowTotal($('.item-row').last().find('.unit-price'));
    }
    
    // Apply current visibility settings
    togglePriceSection();
}

function updatePrice(select) {
    const cashMemoType = $('#cash_memo_type').val();
    const isChalan = cashMemoType === 'চালান';
    
    if (!isChalan) {
        const row = $(select).closest('tr');
        const price = $(select).find(':selected').data('price');
        if (price) {
            row.find('.unit-price').val(price);
        }
        calculateRowTotal(select);
    }
}

function calculateRowTotal(input) {
    const cashMemoType = $('#cash_memo_type').val();
    const isChalan = cashMemoType === 'চালান';
    
    if (!isChalan) {
        const row = $(input).closest('tr');
        const quantity = parseFloat(row.find('.quantity').val()) || 0;
        const unitPrice = parseFloat(row.find('.unit-price').val()) || 0;
        const amount = quantity * unitPrice;
        
        row.find('.amount').val(amount.toFixed(2));
        calculateSubtotal();
    }
}

function calculateSubtotal() {
    const cashMemoType = $('#cash_memo_type').val();
    const isChalan = cashMemoType === 'চালান';
    
    if (isChalan) {
        $('#subtotal').val('0');
        $('#total_amount').val('0');
        updateAmountInWords();
        return;
    }
    
    let subtotal = 0;
    
    $('.item-row').each(function() {
        const amount = parseFloat($(this).find('.amount').val()) || 0;
        subtotal += amount;
    });
    
    $('#subtotal').val(subtotal.toFixed(2));
    calculateTotal();
}

function calculateTotal() {
    const cashMemoType = $('#cash_memo_type').val();
    const isChalan = cashMemoType === 'চালান';
    
    if (!isChalan) {
        const subtotal = parseFloat($('#subtotal').val()) || 0;
        const discount = parseFloat($('#discount').val()) || 0;
        const total = subtotal - discount;
        $('#total_amount').val(total > 0 ? total.toFixed(2) : '0');
        updateAmountInWords();
    }
}

// Add new row function
function addNewRow() {
    const cashMemoType = $('#cash_memo_type').val();
    const isChalan = cashMemoType === 'চালান';
    
    const newRow = `
        <tr class="item-row">
            <td>
                <select class="product-select" onchange="updatePrice(this)">
                    <option value="">পণ্য নির্বাচন করুন</option>
                </select>
            </td>
            <td><input type="number" class="bags" step="0.01" value="0" placeholder="বস্তা"></td>
            <td>
                <div class="quantity-with-unit">
                    <input type="number" class="quantity" step="0.01" value="1" placeholder="পরিমাণ" style="flex: 1;">
                    <select class="quantity-unit" style="width: 80px; margin-left: 5px;">
                        <option value="কে.জি">কে.জি</option>
                        <option value="টা">টা</option>
                    </select>
                </div>
            </td>
            <td class="price-column"><input type="number" class="unit-price" step="0.01" placeholder="দর" onchange="calculateRowTotal(this)"></td>
            <td class="price-column"><input type="number" class="amount" step="0.01" placeholder="টাকা" readonly></td>
            <td><button type="button" class="remove-btn" onclick="removeRow(this)">মুছুন</button></td>
        </tr>
    `;
    $('#items_body').append(newRow);
    loadProducts();
    
    // Apply current visibility settings
    togglePriceSection();
}

function removeRow(button) {
    if ($('.item-row').length > 1) {
        $(button).closest('tr').remove();
        const cashMemoType = $('#cash_memo_type').val();
        const isChalan = cashMemoType === 'চালান';
        
        if (!isChalan) {
            calculateSubtotal();
        }
    } else {
        alert('অন্তত একটি পণ্য থাকতে হবে!');
    }
}

// Store current memo data globally
let currentMemoData = null;

// Generate Memo Function (Preview Only)
function generateMemo() {
    currentMemoData = getMemoData();
    
    if (!validateMemoData(currentMemoData)) {
        return;
    }
    
    // Generate preview without saving to database
    const preview = generateMemoPreview(currentMemoData);
    $('#memo_preview').html(preview);
    $('#memo_preview_section').show();
    
    // Scroll to preview section
    $('html, body').animate({
        scrollTop: $('#memo_preview_section').offset().top
    }, 1000);
}

// Save Memo Function (Save to Database)
function saveMemo() {
    currentMemoData = getMemoData();
    
    if (!validateMemoData(currentMemoData)) {
        return;
    }

    $.ajax({
        url: 'process_memo.php',
        type: 'POST',
        data: {memo_data: JSON.stringify(currentMemoData)},
        success: function(response) {
            const result = JSON.parse(response);
            if (result.success) {
                // Show success message
                $('#memo_preview').html('<div class="success-message">✅ মেমো সফলভাবে সংরক্ষণ করা হয়েছে!</div>' + result.preview);
                $('#memo_preview_section').show();
                
                // Scroll to preview section
                $('html, body').animate({
                    scrollTop: $('#memo_preview_section').offset().top
                }, 1000);
                
                // Generate new memo number for next memo
                updateMemoNumber();
            } else {
                alert('ত্রুটি: ' + result.message);
            }
        }
    });
}

// Download Memo as PDF
function downloadMemo() {
    // Check if memo is generated
    if (!$('#memo_preview').html().trim()) {
        alert('দয়া করে প্রথমে মেমো জেনারেট করুন!');
        return;
    }

    const memoNumber = $('#memo_number').val();
    const memoType = $('#memo_type').val();
    const memoTypeText = (memoType === 'B') ? 'মেমো' : 'চালান';
    
    // Get the memo preview element
    const element = document.getElementById('memo_preview');
    
    // Options for PDF
    const options = {
        margin: 0,
        filename: `${memoNumber}_${memoTypeText}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
            scale: 2,
            useCORS: true,
            width: 800,
            height: 1120
        },
        jsPDF: { 
            unit: 'px', 
            format: [800, 1120],
            orientation: 'portrait' 
        }
    };

    // Generate PDF directly
    html2pdf().set(options).from(element).save();
}

// Get memo data from form
function getMemoData() {
    const items = [];
    const cashMemoType = $('#cash_memo_type').val();
    const isChalan = cashMemoType === 'চালান';
    
    $('.item-row').each(function() {
        const productSelect = $(this).find('.product-select');
        const manualProduct = $(this).find('.manual-product-name');
        const bags = parseFloat($(this).find('.bags').val()) || 0;
        const quantity = parseFloat($(this).find('.quantity').val()) || 0;
        const unit = $(this).find('.quantity-unit').val() || 'কে.জি';
        const unitPrice = parseFloat($(this).find('.unit-price').val()) || 0;
        const amount = parseFloat($(this).find('.amount').val()) || 0;
        
        let productName = '';
        let productId = '';
        
        if (manualProduct.length > 0 && manualProduct.val()) {
            productName = manualProduct.val();
            productId = '';
        } else if (productSelect.val()) {
            productName = productSelect.find(':selected').text().split(' - ')[0];
            productId = productSelect.val();
        }
        
        if (productName) {
            items.push({
                product_id: productId,
                product_name: productName,
                bags: bags,
                quantity: quantity,
                unit: unit,
                unit_price: unitPrice,
                amount: amount
            });
        }
    });

    return {
        shop_name: $('#shop_name').val(),
        shop_address: $('#shop_address').val(),
        mobile_number: $('#mobile_number').val(),
        cash_memo_type: cashMemoType,
        business_type: $('#business_type').val(),
        memo_number: $('#memo_number').val(),
        memo_date: $('#memo_date').val(),
        customer_id: $('#customer_id').val(),
        customer_name: $('#customer_name').val(),
        customer_phone: $('#customer_phone').val(),
        customer_address: $('#customer_address').val(),
        subtotal: parseFloat($('#subtotal').val()) || 0,
        discount: parseFloat($('#discount').val()) || 0,
        total: parseFloat($('#total_amount').val()) || 0,
        items: items
    };
}

// Validate memo data
function validateMemoData(memoData) {
    let hasProducts = false;
    $('.item-row').each(function() {
        const productSelect = $(this).find('.product-select');
        const manualProduct = $(this).find('.manual-product-name');
        
        if ((productSelect.val() && productSelect.val() !== '') || 
            (manualProduct.length > 0 && manualProduct.val())) {
            hasProducts = true;
        }
    });
    
    if (!hasProducts) {
        alert('দয়া করে অন্তত একটি পণ্য যোগ করুন!');
        return false;
    }
    
    return true;
}

// Generate memo preview HTML - UPDATED: Show all columns but keep prices blank for চালান
function generateMemoPreview(data) {
    // Format date in Bangla style
    const memoDate = new Date(data.memo_date);
    const day = memoDate.getDate();
    const month = memoDate.getMonth() + 1;
    const year = memoDate.getFullYear();
    
    const isChalan = data.cash_memo_type === 'চালান';
    const amountInWords = convertAmountToBengaliWords(data.total);
    
    let itemsHtml = '';
    let counter = 1;
    
    data.items.forEach(function(item) {
        if (item.product_name) {
            const bags = item.bags > 0 ? item.bags : '';
            const quantity = item.quantity + ' ' + (item.unit || 'কে.জি');
            
            // For চালান, keep দর and টাকা columns blank
            const unitPrice = isChalan ? '' : (item.unit_price > 0 ? item.unit_price.toFixed(2) : '');
            const amount = isChalan ? '' : (item.amount > 0 ? item.amount.toFixed(2) : '');
            
            itemsHtml += `
                <tr>
                    <td class="col-num">${counter}</td>
                    <td class="desc">${item.product_name}</td>
                    <td class="col-shaded">${bags}</td>
                    <td class="col-qty">${quantity}</td>
                    <td class="col-rate">${unitPrice}</td>
                    <td class="col-amount">${amount}</td>
                </tr>`;
            counter++;
        }
    });
    
    // Add empty rows for traditional memo look
    for (let i = counter; i <= 6; i++) {
        itemsHtml += `
            <tr>
                <td class="col-num">${i}</td>
                <td class="desc" style="height:40px;"></td>
                <td class="col-shaded"></td>
                <td class="col-qty"></td>
                <td class="col-rate"></td>
                <td class="col-amount"></td>
            </tr>`;
    }
    
    // Total amount - show for both memo types
    const totalAmount = isChalan ? '' : data.total.toFixed(2);
    
    return `
    <div class="preview-sheet">
        <header class="brand">
            <h1>${data.shop_name || 'ব্রাদার্স এন্টারপ্রাইজ'}</h1>
            <div class="subbox">${data.cash_memo_type || 'ক্যাশ মেমো'}</div>
            <div class="contacts">মোবাইল: ${data.mobile_number || '01679610868, 01707387608'}</div>
            <div class="address">${data.business_type || 'এখানে গার্মেন্টস কোয়ালিটি ওয়েজিং মাল ক্রয় ও বিক্রয় করা হয়।'}<br>${data.shop_address || 'আদমজী নগর-১৪৩১, সিদ্দিরগঞ্জ, নারায়ণগঞ্জ।'}</div>
        </header>

        <div class="info-row">
            <div class="meta">
                <div class="label">নং:</div>
                <div class="box">${data.memo_number}</div>
            </div>

            <div class="meta" style="align-items:flex-end;">
                <div class="label">তারিখ:</div>
                <div style="display:flex; gap:8px;">
                    <div class="box">${day}</div>
                    <div class="box">${month}</div>
                    <div class="box">${year}</div>
                </div>
            </div>
        </div>

        <div class="name-row">
            নাম: ${data.customer_name || 'সাধারণ গ্রাহক'}
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
            <tbody>
                ${itemsHtml}
                <tr>
                    <td colspan="5" style="border-right:none; padding:10px; text-align:right; font-weight:700;">মোট</td>
                    <td class="total-cell">${totalAmount}</td>
                </tr>
            </tbody>
        </table>

        <div class="notes">কথায়ঃ ${amountInWords}</div>

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
    </div>`;
}

// Close preview section
function closePreview() {
    $('#memo_preview_section').hide();
}

function printMemo() {
    window.print();
}

function clearForm() {
    updateMemoNumber();
    $('#memo_date').val(new Date().toISOString().slice(0,10));
    $('#customer_id').val('');
    $('#customer_name').val('');
    $('#customer_phone').val('');
    $('#customer_address').val('');
    $('#customer_details').hide();
    $('#items_body').html(`
        <tr class="item-row">
            <td>
                <select class="product-select" onchange="updatePrice(this)">
                    <option value="">পণ্য নির্বাচন করুন</option>
                </select>
            </td>
            <td><input type="number" class="bags" step="0.01" value="0" placeholder="বস্তা"></td>
            <td>
                <div class="quantity-with-unit">
                    <input type="number" class="quantity" step="0.01" value="1" placeholder="পরিমাণ" style="flex: 1;">
                    <select class="quantity-unit" style="width: 80px; margin-left: 5px;">
                        <option value="কে.জি">কে.জি</option>
                        <option value="টা">টা</option>
                    </select>
                </div>
            </td>
            <td class="price-column"><input type="number" class="unit-price" step="0.01" placeholder="দর" onchange="calculateRowTotal(this)"></td>
            <td class="price-column"><input type="number" class="amount" step="0.01" placeholder="টাকা" readonly></td>
            <td><button type="button" class="remove-btn" onclick="removeRow(this)">মুছুন</button></td>
        </tr>
    `);
    $('#subtotal').val('0');
    $('#discount').val('0');
    $('#total_amount').val('0');
    togglePriceSection();
    $('#memo_preview_section').hide();
    currentMemoData = null;
    loadProducts();
    updateAmountInWords();
}