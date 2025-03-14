// Variáveis globais
let currentExpression = '';
let history = [];
let lastWasResult = false;

// Tema
document.getElementById('themeToggle').addEventListener('change', function(e) {
    document.body.classList.toggle('dark-theme');
    localStorage.setItem('darkTheme', e.target.checked);
});

// Carregar preferência de tema
if (localStorage.getItem('darkTheme') === 'true') {
    document.getElementById('themeToggle').checked = true;
    document.body.classList.add('dark-theme');
}

// Suporte ao teclado
document.addEventListener('keydown', function(event) {
    const key = event.key;
    if (/[0-9]/.test(key)) {
        if (lastWasResult) clearDisplay();
        appendToDisplay(key);
    } else if (['+', '-', '*', '/', '(', ')', '^', '.'].includes(key)) {
        lastWasResult = false;
        appendToDisplay(key);
    } else if (key === 'Enter') {
        calculate();
    } else if (key === 'Backspace') {
        backspace();
    } else if (key === 'Escape') {
        clearDisplay();
    }
});

// Funções da calculadora
function appendToDisplay(value) {
    const display = document.getElementById('display');
    const expression = document.getElementById('expression');
    
    if (lastWasResult && /[0-9]/.test(value)) {
        display.value = '';
        expression.value = '';
        currentExpression = '';
        lastWasResult = false;
    }
    
    currentExpression = display.value + value;
    display.value = currentExpression;
    expression.value = formatExpression(currentExpression);
}

function formatExpression(expr) {
    return expr
        .replace(/\*/g, '×')
        .replace(/\//g, '÷')
        .replace(/\^/g, '^');
}

function clearDisplay() {
    const display = document.getElementById('display');
    const expression = document.getElementById('expression');
    currentExpression = '';
    display.value = '';
    expression.value = '';
    lastWasResult = false;
}

function clearEntry() {
    if (lastWasResult) {
        clearDisplay();
    } else {
        const display = document.getElementById('display');
        const lastOperator = currentExpression.match(/[+\-*/^](?=[^+\-*/^]*$)/);
        if (lastOperator) {
            currentExpression = currentExpression.slice(0, lastOperator.index + 1);
            display.value = currentExpression;
        } else {
            clearDisplay();
        }
    }
}

function backspace() {
    if (!lastWasResult) {
        const display = document.getElementById('display');
        const expression = document.getElementById('expression');
        currentExpression = display.value.slice(0, -1);
        display.value = currentExpression;
        expression.value = formatExpression(currentExpression);
    }
}

function addToHistory(expression, result) {
    const historyItem = { expression, result, timestamp: new Date().toLocaleTimeString() };
    history.unshift(historyItem);
    if (history.length > 10) history.pop();
    updateHistoryDisplay();
    // Salvar histórico no localStorage
    localStorage.setItem('calculatorHistory', JSON.stringify(history));
}

// Carregar histórico do localStorage
try {
    const savedHistory = localStorage.getItem('calculatorHistory');
    if (savedHistory) {
        history = JSON.parse(savedHistory);
        updateHistoryDisplay();
    }
} catch (e) {
    console.error('Erro ao carregar histórico:', e);
}

function updateHistoryDisplay() {
    const historyContent = document.getElementById('historyContent');
    historyContent.innerHTML = history
        .map(item => `
            <div class="history-item" onclick="useHistoryItem('${item.result}')">
                <span>${item.expression} = ${item.result}</span>
                <small>${item.timestamp}</small>
            </div>
        `)
        .join('');
}

function useHistoryItem(value) {
    if (lastWasResult) {
        clearDisplay();
    }
    appendToDisplay(value);
}

// Função para limpar o histórico
function clearHistory() {
    history = [];
    localStorage.removeItem('calculatorHistory');
    updateHistoryDisplay();
}

// Funções matemáticas
function calculateSin() {
    const display = document.getElementById('display');
    try {
        const value = parseFloat(display.value);
        const result = Math.sin(value * Math.PI / 180);
        display.value = result.toFixed(8);
        addToHistory(`sin(${value}°)`, result.toFixed(8));
        lastWasResult = true;
    } catch (e) {
        showError();
    }
}

function calculateCos() {
    const display = document.getElementById('display');
    try {
        const value = parseFloat(display.value);
        const result = Math.cos(value * Math.PI / 180);
        display.value = result.toFixed(8);
        addToHistory(`cos(${value}°)`, result.toFixed(8));
        lastWasResult = true;
    } catch (e) {
        showError();
    }
}

function calculateTan() {
    const display = document.getElementById('display');
    try {
        const value = parseFloat(display.value);
        const result = Math.tan(value * Math.PI / 180);
        display.value = result.toFixed(8);
        addToHistory(`tan(${value}°)`, result.toFixed(8));
        lastWasResult = true;
    } catch (e) {
        showError();
    }
}

function showError() {
    const display = document.getElementById('display');
    const expression = document.getElementById('expression');
    const originalValue = display.value;
    display.value = 'Erro';
    setTimeout(() => {
        display.value = originalValue;
        expression.value = formatExpression(originalValue);
    }, 1000);
}

// Função de cálculo segura (sem eval)
function calculate() {
    const display = document.getElementById('display');
    const expression = document.getElementById('expression');
    const originalExpression = display.value;
    
    try {
        const expr = display.value
            .replace(/×/g, '*')
            .replace(/÷/g, '/')
            .replace(/\^/g, '**');
            
        // Validação de segurança
        if (!/^[0-9+\-*/(). ]*$/.test(expr.replace(/\*\*/g, ''))) {
            throw new Error('Expressão inválida');
        }

        // Usando Function no lugar de eval para maior segurança
        const result = new Function('return ' + expr)();
        
        if (!isFinite(result)) {
            throw new Error('Resultado inválido');
        }

        const formattedResult = Number.isInteger(result) ? result : result.toFixed(8);
        addToHistory(originalExpression, formattedResult);
        display.value = formattedResult;
        expression.value = originalExpression + ' =';
        currentExpression = formattedResult.toString();
        lastWasResult = true;
    } catch (e) {
        showError();
    }
}