// Enhanced EMI Calculator with validation and improved UX
class EMICalculator {
    constructor() {
        this.loanAmount = document.getElementById("amount");
        this.interestRate = document.getElementById("interest");
        this.loanDuration = document.getElementById("loanTenure");
        this.submitButton = document.getElementById("calculate");
        this.yearRadio = document.getElementById("year");
        this.monthRadio = document.getElementById("month");
        this.outputSection = document.querySelector(".output");
        
        this.init();
    }

    init() {
        // Add event listeners
        this.submitButton.addEventListener('click', (e) => {
            e.preventDefault();
            this.calculateEMI();
        });

        // Add input validation listeners
        [this.loanAmount, this.interestRate, this.loanDuration].forEach(input => {
            input.addEventListener('input', () => this.validateInput(input));
            input.addEventListener('blur', () => this.validateInput(input));
        });

        // Add enter key support
        // Only trigger on Enter inside the form, not globally
        const form = document.querySelector('.calculator-container');
        if (form) {
            form.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.calculateEMI();
                }
            });
        }

        // Format number inputs on blur
        this.loanAmount.addEventListener('blur', () => this.formatCurrency(this.loanAmount));
        this.interestRate.addEventListener('blur', () => this.formatPercentage(this.interestRate));
    }

    validateInput(input) {
        this.clearError(input);
        // Normalize value: strip commas and non-numeric (keep dot)
        const raw = (input.value || '').toString().replace(/[^0-9.]/g, '');
        const value = parseFloat(raw);
        
        if (!input.value || isNaN(value) || value <= 0) {
            this.showError(input, 'Please enter a valid positive number');
            return false;
        }

        if (input === this.loanAmount && value < 1000) {
            this.showError(input, 'Loan amount should be at least ₹1,000');
            return false;
        }

        if (input === this.interestRate && (value < 0.1 || value > 50)) {
            this.showError(input, 'Interest rate should be between 0.1% and 50%');
            return false;
        }

        if (input === this.loanDuration && (value < 1 || value > 600)) {
            this.showError(input, 'Please enter a valid tenure');
            return false;
        }

        return true;
    }

    showError(input, message) {
        input.classList.add('input-error');
        
        // Remove existing error message
        const existingError = input.parentNode.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }

        // Add new error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        input.parentNode.appendChild(errorDiv);
    }

    clearError(input) {
        input.classList.remove('input-error');
        const errorMessage = input.parentNode.querySelector('.error-message');
        if (errorMessage) {
            errorMessage.remove();
        }
    }

    formatCurrency(input) {
        if (input.value) {
            const value = parseFloat(input.value.replace(/[^0-9.]/g, ''));
            if (!isNaN(value)) {
                input.value = value.toLocaleString('en-IN');
            }
        }
    }

    formatPercentage(input) {
        if (input.value) {
            const value = parseFloat(input.value);
            if (!isNaN(value)) {
                input.value = value.toFixed(2);
            }
        }
    }

    showCalculating() {
        this.submitButton.textContent = 'Calculating...';
        this.submitButton.disabled = true;
        document.querySelector('.calculator-container').classList.add('calculating');
    }

    hideCalculating() {
        this.submitButton.textContent = 'Calculate EMI';
        this.submitButton.disabled = false;
        document.querySelector('.calculator-container').classList.remove('calculating');
    }

    calculateEMI() {
        // Validate all inputs
        const isAmountValid = this.validateInput(this.loanAmount);
        const isInterestValid = this.validateInput(this.interestRate);
        const isDurationValid = this.validateInput(this.loanDuration);

        if (!isAmountValid || !isInterestValid || !isDurationValid) {
            this.showAlert('Please fix the errors before calculating', 'error');
            return;
        }

        // Check if tenure type is selected
        if (!this.yearRadio.checked && !this.monthRadio.checked) {
            this.showAlert('Please select loan tenure type (Year or Month)', 'warning');
            return;
        }

        this.showCalculating();

        // Simulate calculation delay for better UX
        setTimeout(() => {
            this.performCalculation();
            this.hideCalculating();
        }, 800);
    }

    performCalculation() {
        try {
            // Get clean values
                const principal = parseFloat((this.loanAmount.value || '').toString().replace(/[^0-9.]/g, ''));
            const annualRate = parseFloat((this.interestRate.value || '').toString());
            const tenure = parseFloat((this.loanDuration.value || '').toString());

            // Calculate number of months
            let noOfMonths = 0;
            if (this.yearRadio.checked) {
                noOfMonths = tenure * 12;
            } else {
                noOfMonths = tenure;
            }

            // Calculate monthly interest rate
            const monthlyRate = annualRate / 12 / 100;

            if (!isFinite(principal) || principal <= 0 || !isFinite(annualRate) || annualRate < 0 || !isFinite(tenure) || tenure <= 0) {
                this.showAlert('Please enter valid positive numbers for all fields', 'error');
                return;
            }

            let emi, totalInterest, totalPayment;

            if (monthlyRate === 0) {
                // Handle zero interest rate
                if (noOfMonths <= 0) { this.showAlert('Tenure must be greater than 0', 'error'); return; }
                emi = principal / noOfMonths;
                totalInterest = 0;
                totalPayment = principal;
            } else {
                // EMI Formula: P * r * (1 + r)^n / ((1 + r)^n - 1)
                const rateCompound = Math.pow((1 + monthlyRate), noOfMonths);
                if (!isFinite(rateCompound) || rateCompound <= 1) { this.showAlert('Tenure is too small for calculation', 'error'); return; }
                emi = (principal * monthlyRate * rateCompound) / (rateCompound - 1);
                totalPayment = emi * noOfMonths;
                totalInterest = totalPayment - principal;
            }

            // Display results
            this.displayResults(emi, totalInterest, totalPayment, principal);
            this.showAlert('EMI calculated successfully!', 'success');

        } catch (error) {
            console.error('Calculation error:', error);
            this.showAlert('Error in calculation. Please check your inputs.', 'error');
        }
    }

    displayResults(emi, totalInterest, totalPayment, principal) {
        document.getElementById("emi").textContent = "₹" + Math.round(emi).toLocaleString('en-IN');
        document.getElementById("totalInterest").textContent = "₹" + Math.round(totalInterest).toLocaleString('en-IN');
        document.getElementById("totalPayment").textContent = "₹" + Math.round(totalPayment).toLocaleString('en-IN');

        // Show output section with animation
        this.outputSection.classList.add('show');
        this.outputSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

        // Broadcast results for any UI widgets (e.g., donut breakdown)
        try {
            const event = new CustomEvent('emi:updated', {
                detail: {
                    emi: emi,
                    totalInterest: totalInterest,
                    totalPayment: totalPayment,
                    principal: principal
                }
            });
            document.dispatchEvent(event);
        } catch (_) {
            // safe no-op if CustomEvent not supported
        }
    }

    showAlert(message, type = 'info') {
        // Remove existing alerts
        const existingAlert = document.querySelector('.alert');
        if (existingAlert) {
            existingAlert.remove();
        }

        // Create alert
        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.innerHTML = `
            <span>${message}</span>
            <button onclick="this.parentElement.remove()" style="margin-left: 10px; background: none; border: none; font-size: 1.2rem; cursor: pointer;">&times;</button>
        `;
        
        // Style alert
        alert.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 9999;
            max-width: 400px;
            animation: slideInRight 0.3s ease-out;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        `;

        // Set color based on type
        switch (type) {
            case 'success':
                alert.style.background = 'linear-gradient(135deg, #10b981, #059669)';
                break;
            case 'error':
                alert.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
                break;
            case 'warning':
                alert.style.background = 'linear-gradient(135deg, #f59e0b, #d97706)';
                break;
            default:
                alert.style.background = 'linear-gradient(135deg, #6366f1, #5b21b6)';
        }

        document.body.appendChild(alert);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (alert.parentElement) {
                alert.remove();
            }
        }, 5000);
    }
}

// Utility functions for the main site
class SiteUtils {
    static init() {
        this.initScrollAnimation();
        this.initFormValidation();
        this.initSmoothScrolling();
        this.initMobileMenu();
    }

    static initScrollAnimation() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -100px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('loading');
                }
            });
        }, observerOptions);

        document.querySelectorAll('section, .card, .stat-card').forEach(el => {
            observer.observe(el);
        });
    }

    static initFormValidation() {
        document.querySelectorAll('form').forEach(form => {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const inputs = form.querySelectorAll('input[required], textarea[required]');
                let isValid = true;

                inputs.forEach(input => {
                    if (!input.value.trim()) {
                        input.classList.add('input-error');
                        isValid = false;
                    } else {
                        input.classList.remove('input-error');
                    }
                });

                if (isValid) {
                    this.showAlert('Form submitted successfully!', 'success');
                } else {
                    this.showAlert('Please fill in all required fields', 'error');
                }
            });
        });
    }

    static initSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    static initMobileMenu() {
        // Add mobile menu functionality if needed
        const navToggle = document.querySelector('.nav-toggle');
        if (navToggle) {
            navToggle.addEventListener('click', () => {
                document.querySelector('nav').classList.toggle('active');
            });
        }
    }

    static showAlert(message, type = 'info') {
        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.textContent = message;
        alert.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 9999;
            animation: slideInRight 0.3s ease-out;
        `;

        switch (type) {
            case 'success':
                alert.style.background = 'linear-gradient(135deg, #10b981, #059669)';
                break;
            case 'error':
                alert.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
                break;
            default:
                alert.style.background = 'linear-gradient(135deg, #6366f1, #5b21b6)';
        }

        document.body.appendChild(alert);
        setTimeout(() => alert.remove(), 3000);
    }
}

// Add slide animation CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
`;
document.head.appendChild(style);

// Initialize based on current page
const initApp = () => {
    // Initialize EMI Calculator if on calculator page
    if (document.getElementById('calculate')) {
        new EMICalculator();
    }
    // Initialize general site utilities
    SiteUtils.init();
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    // DOM already parsed
    initApp();
}
