// Load customers and products on page load
$(document).ready(function() {
    loadCustomers();
    loadProducts();
    togglePriceSection(); // Initialize on page load
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
        
        // Show calculation section only if prices exist
        calculateSubtotal();
    }
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
            <td><input type="number" class="quantity" step="0.01" value="${productQuantity}" placeholder="পরিমাণ"></td>
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
    }
}

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
            <td><input type="number" class="quantity" step="0.01" value="1" placeholder="পরিমাণ"></td>
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

// Download Memo as PDF - SIMPLE WORKING VERSION
function downloadMemo() {
    // Check if memo is generated
    if (!$('#memo_preview').html().trim()) {
        alert('দয়া করে প্রথমে মেমো জেনারেট করুন!');
        return;
    }

    const memoNumber = $('#memo_number').val();
    const memoType = $('#memo_type').val();
    const memoTypeText = (memoType === 'C') ? 'মেমো' : 'চালান';
    
    // Get the memo preview element
    const element = document.getElementById('memo_preview');
    
    // Simple options for PDF
    const options = {
        margin: 10,
        filename: `${memoNumber}_${memoTypeText}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
            scale: 2,
            useCORS: true
        },
        jsPDF: { 
            unit: 'mm', 
            format: 'a4', 
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
        const unitPrice = isChalan ? 0 : (parseFloat($(this).find('.unit-price').val()) || 0);
        const amount = isChalan ? 0 : (parseFloat($(this).find('.amount').val()) || 0);
        
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
        subtotal: isChalan ? 0 : (parseFloat($('#subtotal').val()) || 0),
        discount: isChalan ? 0 : (parseFloat($('#discount').val()) || 0),
        total: isChalan ? 0 : (parseFloat($('#total_amount').val()) || 0),
        items: items
    };
}

// Validate memo data
function validateMemoData(memoData) {
    // Check if at least one product is added
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

// Generate memo preview HTML
function generateMemoPreview(data) {
    // Format date in Bangla style
    const memoDate = new Date(data.memo_date).toLocaleDateString('bn-BD');
    
    // Determine memo type for display
    const memoType = data.memo_number.charAt(0);
    const memoTypeDisplay = (memoType === 'C') ? 'মেমো' : 'চালান';
    const isChalan = data.cash_memo_type === 'চালান';
    
    let itemsHtml = '';
    let counter = 1;
    
    data.items.forEach(function(item) {
        if (item.product_name) {
            const bags = item.bags > 0 ? item.bags : '';
            const quantity = item.quantity;
            const unitPrice = (!isChalan && item.unit_price > 0) ? item.unit_price.toFixed(2) : '';
            const amount = (!isChalan && item.amount > 0) ? item.amount.toFixed(2) : '';
            
            itemsHtml += `
                <tr>
                    <td>${counter}</td>
                    <td class="item-description">${item.product_name}</td>
                    <td>${bags}</td>
                    <td>${quantity}</td>
                    <td>${unitPrice}</td>
                    <td>${amount}</td>
                </tr>`;
            counter++;
        }
    });
    
    // Add empty rows for traditional memo look
    for (let i = counter; i <= 8; i++) {
        itemsHtml += `
            <tr>
                <td>${i}</td>
                <td class="item-description">&nbsp;</td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
            </tr>`;
    }
    
    // Show totals only if it's not চালান and there are prices
    const hasPrices = !isChalan && data.items.some(item => item.unit_price > 0);
    const totalsHtml = hasPrices ? `
        <div class="total-section-bangla">
            <table class="total-table-bangla" align="right">
                <tr>
                    <td width="70%" align="right">মোট:</td>
                    <td width="30%" align="right">${data.subtotal.toFixed(2)}৳</td>
                </tr>
                <tr>
                    <td align="right">ছাড়:</td>
                    <td align="right">${data.discount.toFixed(2)}৳</td>
                </tr>
                <tr class="grand-total-bangla">
                    <td align="right"><strong>সর্বমোট:</strong></td>
                    <td align="right"><strong>${data.total.toFixed(2)}৳</strong></td>
                </tr>
            </table>
        </div>
    ` : '';
    
    return `
    <div class="bangla-memo">
        <div class="memo-header-bangla">
            <div class="shop-name-bangla">${data.shop_name || 'আপনার কম্পানির নাম'}</div>
            <div class="shop-address-bangla">${data.shop_address || 'আইডেন সেন্টার, নিউ মার্কেট, ঢাকা'}</div>
            <div class="shop-contact-bangla">${data.cash_memo_type || 'ক্যাশ মেমো'} | মোবাইল: ${data.mobile_number || '০১৭১২-৩৪৫৬৭৮'}</div>
            <div class="business-type-bangla">${data.business_type || 'এখানে গার্মেন্টস কোয়ালিটি ওয়েস্টিজ মাল ক্রয় ও বিক্রয় করা হয়'}</div>
        </div>
        
        <div class="memo-title-bangla">${memoTypeDisplay}</div>
        
        <table class="memo-info-table">
            <tr>
                <td width="30%">নং:</td>
                <td width="70%">${data.memo_number}</td>
            </tr>
            <tr>
                <td>তারিখ:</td>
                <td>${memoDate}</td>
            </tr>
            <tr>
                <td>গ্রাহক:</td>
                <td>${data.customer_name || 'সাধারণ গ্রাহক'}</td>
            </tr>
            <tr>
                <td>গ্রাহকের ঠিকানা:</td>
                <td>${data.customer_address || ''}</td>
            </tr>
        </table>
        
        <table class="items-table-bangla">
            <thead>
                <tr>
                    <th width="5%">নং</th>
                    <th width="35%">পণ্যের বিবরণ</th>
                    <th width="10%">বস্তা</th>
                    <th width="10%">পরিমাণ</th>
                    <th width="10%">দর</th>
                    <th width="10%">টাকা</th>
                </tr>
            </thead>
            <tbody>
                ${itemsHtml}
            </tbody>
        </table>
        
        ${totalsHtml}
        
        <div class="memo-footer-bangla">
            <div class="thank-you-bangla">ধন্যবাদান্তে</div>
            <div class="signature-line">
                ..............................................<br>
                <em>দোকানদারের স্বাক্ষর</em>
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
    // Keep shop info but reset memo data
    updateMemoNumber(); // Generate new memo number
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
            <td><input type="number" class="quantity" step="0.01" value="1" placeholder="পরিমাণ"></td>
            <td class="price-column"><input type="number" class="unit-price" step="0.01" placeholder="দর" onchange="calculateRowTotal(this)"></td>
            <td class="price-column"><input type="number" class="amount" step="0.01" placeholder="টাকা" readonly></td>
            <td><button type="button" class="remove-btn" onclick="removeRow(this)">মুছুন</button></td>
        </tr>
    `);
    $('#subtotal').val('0');
    $('#discount').val('0');
    $('#total_amount').val('0');
    togglePriceSection(); // Reset price section visibility
    $('#memo_preview_section').hide();
    currentMemoData = null;
    loadProducts();
}