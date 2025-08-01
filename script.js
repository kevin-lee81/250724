document.addEventListener('DOMContentLoaded', function() {

    const BASE_PRICE_PER_100_SHEETS = 4400; // (공급가 11,000 - 후가공 2,200) / (200장/100) = 4,400

    const postProcessingOptions = {
        'guido': { name: '귀도리 [네귀도리/6mm]', price: 2200 }
    };

    const optionsData = {
        productName: [
            { value: 'card_business', text: '카드명함' },
            { value: 'standard_business', text: '일반명함' },
            { value: 'premium_business', text: '고급명함' }
        ],
        paperType: [
            { value: 'white_pet_230', text: '화이트카드 PET 흰색 230g', priceMultiplier: 1.0 },
            { value: 'gold_pet_250', text: '골드카드 PET 250g', priceMultiplier: 1.2 },
            { value: 'silver_pet_250', text: '실버카드 PET 250g', priceMultiplier: 1.2 }
        ],
        printMethod: [
            { value: 'double_sided_color', text: '양면컬러8도' },
            { value: 'single_sided_color', text: '단면컬러4도' }
        ],
        sizePreset: [
            { value: '86_54', text: '규격사이즈', cutW: 86, cutH: 54, bleedW: 90, bleedH: 58 },
            { value: '90_50', text: '비규격(90x50)', cutW: 90, cutH: 50, bleedW: 94, bleedH: 54 },
            { value: 'custom', text: '직접입력', cutW: 0, cutH: 0, bleedW: 0, bleedH: 0 }
        ],
        sizeUnit: [ { value: 'mm', text: 'mm' } ],
        quantity: [
            { value: '200', text: '200 장' },
            { value: '400', text: '400 장' },
            { value: '600', text: '600 장' },
            { value: '1000', text: '1,000 장' }
        ]
    };

    const elements = {
        productName: document.getElementById('product-name'), paperType: document.getElementById('paper-type'),
        printMethod: document.getElementById('print-method'), sizePreset: document.getElementById('size-preset'),
        sizeDisplay: document.querySelector('.size-display'), cutWidth: document.getElementById('cut-width'),
        cutHeight: document.getElementById('cut-height'), bleedWidth: document.getElementById('bleed-width'),
        bleedHeight: document.getElementById('bleed-height'), quantity: document.getElementById('quantity'),
        quantityCase: document.querySelector('.quantity-case'), quantitySlider: document.getElementById('quantity-slider'),
        mainImage: document.getElementById('main-product-image'), thumbnails: document.querySelectorAll('.thumb-item'),
        originalPrice: document.querySelector('.original-price'), totalPrice: document.querySelector('.total-price'),
        priceBreakdown: document.querySelector('.price-breakdown'), orderSummaryText: document.getElementById('order-summary-text')
    };
    
    function populateDropdown(selectElement, options) {
        if (!selectElement) return;
        selectElement.innerHTML = '';
        options.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option.value;
            optionElement.textContent = option.text;
            selectElement.appendChild(optionElement);
        });
    }

    function updateSizeFields() {
        const selectedSizeValue = elements.sizePreset.value;
        const sizeData = optionsData.sizePreset.find(s => s.value === selectedSizeValue);
        if (!sizeData) return;

        elements.cutWidth.value = sizeData.cutW;
        elements.cutHeight.value = sizeData.cutH;
        elements.bleedWidth.value = sizeData.bleedW;
        elements.bleedHeight.value = sizeData.bleedH;
        elements.sizeDisplay.textContent = `${sizeData.cutW}*${sizeData.cutH}`;
        
        const isCustom = selectedSizeValue === 'custom';
        [elements.cutWidth, elements.cutHeight, elements.bleedWidth, elements.bleedHeight].forEach(input => input.readOnly = !isCustom);

        updateOrderDetails();
    }

    function updateOrderDetails() {
        const selectedProductName = elements.productName.options[elements.productName.selectedIndex].text;
        const selectedPaperValue = elements.paperType.value;
        const selectedPrintMethod = elements.printMethod.options[elements.printMethod.selectedIndex].text;
        const selectedQuantity = parseInt(elements.quantity.value, 10);
        const selectedCases = parseInt(elements.quantityCase.value, 10);
        const currentCutWidth = elements.cutWidth.value;
        const currentCutHeight = elements.cutHeight.value;
        const paperOption = optionsData.paperType.find(p => p.value === selectedPaperValue);
        const paperMultiplier = paperOption ? paperOption.priceMultiplier : 1.0;
        const productPrice = (selectedQuantity / 100) * BASE_PRICE_PER_100_SHEETS * paperMultiplier;
        const postProcessingPrice = postProcessingOptions.guido.price;
        const supplyPrice = (productPrice + postProcessingPrice) * selectedCases;
        const vat = Math.round(supplyPrice * 0.1);
        const totalPrice = supplyPrice + vat;

        elements.originalPrice.innerHTML = `${totalPrice.toLocaleString()}원`;
        elements.totalPrice.innerHTML = `${totalPrice.toLocaleString()} <small>원</small>`;
        elements.priceBreakdown.textContent = `공급가 : ${supplyPrice.toLocaleString()}원 + 부가세 : ${vat.toLocaleString()}원`;
        const sizeText = `${currentCutWidth}*${currentCutHeight}`;
        const orderSummary = `${selectedProductName}, ${selectedPrintMethod}, 86*54(${sizeText}), ${selectedQuantity}장 * ${selectedCases}건\n${postProcessingOptions.guido.name}`;
        elements.orderSummaryText.innerText = orderSummary;
    }

    function syncQuantitySlider() {
        elements.quantitySlider.value = elements.quantity.value;
    }

    function syncQuantityDropdown() {
        const sliderValue = parseInt(elements.quantitySlider.value, 10);
        const quantityValues = optionsData.quantity.map(q => parseInt(q.value, 10));
        const closestValue = quantityValues.reduce((prev, curr) => Math.abs(curr - sliderValue) < Math.abs(prev - sliderValue) ? curr : prev);
        if (elements.quantity.value != closestValue) {
            elements.quantity.value = closestValue;
            updateOrderDetails();
        }
    }

    function setupEventListeners() {
        elements.thumbnails.forEach(thumb => {
            thumb.addEventListener('click', function() {
                elements.thumbnails.forEach(t => t.classList.remove('active'));
                this.classList.add('active');
                elements.mainImage.src = this.querySelector('img').src;
            });
        });

        [elements.productName, elements.paperType, elements.printMethod, elements.quantity, elements.quantityCase].forEach(el => el.addEventListener('change', updateOrderDetails));
        elements.sizePreset.addEventListener('change', updateSizeFields);
        elements.quantity.addEventListener('change', syncQuantitySlider);
        elements.quantitySlider.addEventListener('input', syncQuantityDropdown);
    }
    
    function init() {
        populateDropdown(elements.productName, optionsData.productName);
        populateDropdown(elements.paperType, optionsData.paperType);
        populateDropdown(elements.printMethod, optionsData.printMethod);
        populateDropdown(elements.sizePreset, optionsData.sizePreset);
        populateDropdown(document.getElementById('size-unit'), optionsData.sizeUnit);
        populateDropdown(elements.quantity, optionsData.quantity);
        elements.quantity.value = '200';
        const quantityValues = optionsData.quantity.map(q => parseInt(q.value, 10));
        elements.quantitySlider.min = Math.min(...quantityValues);
        elements.quantitySlider.max = Math.max(...quantityValues);
        setupEventListeners();
        updateSizeFields();
        syncQuantitySlider();
    }
    init();
});
