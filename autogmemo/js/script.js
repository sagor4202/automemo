// Load customers and products on page load
$(document).ready(function() {
    loadCustomers();
    loadProducts();
});

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

function addNewCustomer() {
    $('#customer_details').show();
    $('#customer_id').val('');
}

// Add manual product function
function addManualProduct() {
    const productName = $('#new_product_name').val();
    const productPrice = parseFloat($('#new_product_price').val()) || 0;
    const productQuantity = parseFloat($('#new_product_quantity').val()) || 1;
    
    if (!productName) {
        alert('দয়া করে পণ্যের নাম লিখুন!');
        return;
    }
    
    if (productPrice <= 0) {
        alert('দয়া করে সঠিক দর লিখুন!');
        return;
    }
    
    // Add new row with manual product
    const newRow = `
        <tr class="item-row">
            <td>
                <input type="text" class="manual-product-name" value="${productName}" readonly style="border: none; background: transparent; width: 100%;">
            </td>
            <td><input type="number" class="quantity" step="0.01" value="${productQuantity}" onchange="calculateRowTotal(this)"></td>
            <td><input type="number" class="unit-price" step="0.01" value="${productPrice}" onchange="calculateRowTotal(this)"></td>
            <td><span class="row-total">${(productQuantity * productPrice).toFixed(2)}</span></td>
            <td><button type="button" class="remove-btn" onclick="removeRow(this)">মুছুন</button></td>
        </tr>
    `;
    $('#items_body').append(newRow);
    
    // Clear manual product inputs
    $('#new_product_name').val('');
    $('#new_product_price').val('');
    $('#new_product_quantity').val('1');
    
    calculateSubtotal();
}

function updatePrice(select) {
    const row = $(select).closest('tr');
    const price = $(select).find(':selected').data('price');
    row.find('.unit-price').val(price || 0);
    calculateRowTotal(select);
}

function calculateRowTotal(input) {
    const row = $(input).closest('tr');
    const quantity = parseFloat(row.find('.quantity').val()) || 0;
    const unitPrice = parseFloat(row.find('.unit-price').val()) || 0;
    const total = quantity * unitPrice;
    row.find('.row-total').text(total.toFixed(2));
    calculateSubtotal();
}

function calculateSubtotal() {
    let subtotal = 0;
    $('.item-row').each(function() {
        subtotal += parseFloat($(this).find('.row-total').text()) || 0;
    });
    $('#subtotal').val(subtotal.toFixed(2));
    calculateTotal();
}

function calculateTotal() {
    const subtotal = parseFloat($('#subtotal').val()) || 0;
    const discount = parseFloat($('#discount').val()) || 0;
    const total = subtotal - discount;
    $('#total_amount').val(total.toFixed(2));
}

function addNewRow() {
    const newRow = `
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
    `;
    $('#items_body').append(newRow);
    loadProducts();
}

function removeRow(button) {
    if ($('.item-row').length > 1) {
        $(button).closest('tr').remove();
        calculateSubtotal();
    } else {
        alert('অন্তত একটি পণ্য থাকতে হবে!');
    }
}

// Generate Memo Function (Preview Only)
function generateMemo() {
    const memoData = getMemoData();
    
    if (!validateMemoData(memoData)) {
        return;
    }
    
    // Generate preview without saving to database
    const preview = generateMemoPreview(memoData);
    $('#memo_preview').html(preview);
    $('#memo_preview_section').show();
    
    // Scroll to preview section
    $('html, body').animate({
        scrollTop: $('#memo_preview_section').offset().top
    }, 1000);
}

// Save Memo Function (Save to Database)
function saveMemo() {
    const memoData = getMemoData();
    
    if (!validateMemoData(memoData)) {
        return;
    }

    $.ajax({
        url: 'process_memo.php',
        type: 'POST',
        data: {memo_data: JSON.stringify(memoData)},
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
            } else {
                alert('ত্রুটি: ' + result.message);
            }
        }
    });
}

// Get memo data from form
function getMemoData() {
    return {
        shop_name: $('#shop_name').val(),
        shop_address: $('#shop_address').val(),
        shop_phone: $('#shop_phone').val(),
        shop_tin: $('#shop_tin').val(),
        memo_number: $('#memo_number').val(),
        memo_date: $('#memo_date').val(),
        customer_id: $('#customer_id').val(),
        customer_name: $('#customer_name').val(),
        customer_phone: $('#customer_phone').val(),
        subtotal: $('#subtotal').val(),
        discount: $('#discount').val(),
        total: $('#total_amount').val(),
        items: []
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
    
    // Check if subtotal is greater than 0
    if (parseFloat(memoData.subtotal) <= 0) {
        alert('মোট টাকা ০ এর বেশি হতে হবে!');
        return false;
    }
    
    return true;
}

// Generate memo preview HTML
function generateMemoPreview(data) {
    // Format date in Bangla style
    const memoDate = new Date(data.memo_date).toLocaleDateString('bn-BD');
    
    let itemsHtml = '';
    let counter = 1;
    
    $('.item-row').each(function() {
        const productSelect = $(this).find('.product-select');
        const manualProduct = $(this).find('.manual-product-name');
        
        let productName = '';
        
        if (manualProduct.length > 0 && manualProduct.val()) {
            productName = manualProduct.val();
        } else if (productSelect.val()) {
            productName = productSelect.find(':selected').text().split(' - ')[0];
        }
        
        if (productName) {
            const quantity = $(this).find('.quantity').val();
            const unitPrice = $(this).find('.unit-price').val();
            const totalPrice = $(this).find('.row-total').text();
            
            itemsHtml += `
                <tr>
                    <td>${counter}</td>
                    <td class="item-description">${productName}</td>
                    <td>${quantity}</td>
                    <td>${parseFloat(unitPrice).toFixed(2)}</td>
                    <td>${parseFloat(totalPrice).toFixed(2)}</td>
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
            </tr>`;
    }
    
    return `
    <div class="bangla-memo">
        <div class="memo-header-bangla">
            <div class="shop-name-bangla">${data.shop_name || 'আপনার দোকানের নাম'}</div>
            <div class="shop-address-bangla">${data.shop_address || 'আইডেন সেন্টার, নিউ মার্কেট, ঢাকা'}</div>
            <div class="shop-contact-bangla">মোবাইল: ${data.shop_phone || '০১৭১২-৩৪৫৬৭৮'} | টিন: ${data.shop_tin || '১২৩৪৫৬৭৮৯০১২৩'}</div>
        </div>
        
        <div class="memo-title-bangla">মেমো</div>
        
        <table class="memo-info-table">
            <tr>
                <td width="30%">মেমো নং:</td>
                <td width="70%">${data.memo_number}</td>
            </tr>
            <tr>
                <td>তারিখ:</td>
                <td>${memoDate}</td>
            </tr>
            <tr>
                <td>গ্রাহকের নাম:</td>
                <td>${data.customer_name || 'সাধারণ গ্রাহক'}</td>
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
            <tbody>
                ${itemsHtml}
            </tbody>
        </table>
        
        <div class="total-section-bangla">
            <table class="total-table-bangla" align="right">
                <tr>
                    <td width="70%" align="right">মোট:</td>
                    <td width="30%" align="right">${parseFloat(data.subtotal).toFixed(2)}৳</td>
                </tr>
                <tr>
                    <td align="right">ছাড়:</td>
                    <td align="right">${parseFloat(data.discount).toFixed(2)}৳</td>
                </tr>
                <tr class="grand-total-bangla">
                    <td align="right"><strong>সর্বমোট:</strong></td>
                    <td align="right"><strong>${parseFloat(data.total).toFixed(2)}৳</strong></td>
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
    $('#memo_number').val('GM' + new Date().toISOString().slice(0,10).replace(/-/g,'') + Math.floor(100 + Math.random() * 900));
    $('#memo_date').val(new Date().toISOString().slice(0,10));
    $('#customer_id').val('');
    $('#customer_name').val('');
    $('#customer_phone').val('');
    $('#customer_details').hide();
    $('#items_body').html(`
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
    `);
    $('#subtotal').val('0');
    $('#discount').val('0');
    $('#total_amount').val('0');
    $('#memo_preview_section').hide();
    loadProducts();
}