// --- FUNCIONES MATEMÁTICAS ---
function isPrime(num) {
    if (num <= 1) return false;
    if (num <= 3) return true;
    if (num % 2 === 0 || num % 3 === 0) return false;
    for (let i = 5; i * i <= num; i += 6) {
        if (num % i === 0 || num % (i + 2) === 0) return false;
    }
    return true;
}

function gcd(a, b) {
    while (b !== 0n) {
        let temp = b;
        b = a % b;
        a = temp;
    }
    return a;
}

function modInverse(a, m) {
    let m0 = m;
    let y = 0n, x = 1n;
    if (m === 1n) return 0n;
    while (a > 1n) {
        let q = a / m;
        let t = m;
        m = a % m;
        a = t;
        t = y;
        y = x - q * y;
        x = t;
    }
    if (x < 0n) x += m0;
    return x;
}

function modPow(base, exp, mod) {
    let res = 1n;
    base = base % mod;
    while (exp > 0n) {
        if (exp % 2n === 1n) res = (res * base) % mod;
        exp = exp / 2n;
        base = (base * base) % mod;
    }
    return res;
}

// --- REFERENCIAS DOM ---
const pInput = document.getElementById('p-input');
const qInput = document.getElementById('q-input');
const eSelect = document.getElementById('e-select');
const textInput = document.getElementById('text-input');

const mathWarning = document.getElementById('math-warning');
const asciiWarning = document.getElementById('ascii-warning');
const block2 = document.getElementById('block-2');

// Tablas y Labels
const tdN = document.getElementById('td-n');
const tdPhi = document.getElementById('td-phi');
const tdD = document.getElementById('td-d');
const lblE = document.getElementById('lbl-e');
const lblN1 = document.getElementById('lbl-n1');
const lblD = document.getElementById('lbl-d');
const lblN2 = document.getElementById('lbl-n2');

// Salidas
const outEncrypted = document.getElementById('out-encrypted');
const outDecrypted = document.getElementById('out-decrypted');

// Variables Globales del Sistema
let global_n, global_e, global_d;

// --- LÓGICA PRINCIPAL ---
function updateSystem() {
    const p = parseInt(pInput.value);
    const q = parseInt(qInput.value);
    
    if (isNaN(p) || isNaN(q)) return;

    // Validación de Primos
    if (!isPrime(p) || !isPrime(q)) {
        mathWarning.classList.remove('hidden');
        disableBlock2(true);
        return;
    } else {
        mathWarning.classList.add('hidden');
    }

    const p_big = BigInt(p);
    const q_big = BigInt(q);
    global_n = p_big * q_big;
    const phi = (p_big - 1n) * (q_big - 1n);

    // Actualizar Tabla de Matemáticas
    tdN.textContent = global_n.toString();
    tdPhi.textContent = phi.toString();

    // Llenar 'e' y mantener valor si es posible
    populateESelect(phi);
    if (!eSelect.value) return;
    
    global_e = BigInt(eSelect.value);

    try {
        global_d = modInverse(global_e, phi);
        tdD.textContent = global_d.toString();
        
        // Comprobar si N soporta ASCII
        if (global_n <= 255n) {
            asciiWarning.classList.remove('hidden');
            disableBlock2(true);
        } else {
            asciiWarning.classList.add('hidden');
            disableBlock2(false);
            
            // Actualizar credenciales visuales en Bloque 2
            lblE.textContent = global_e.toString();
            lblD.textContent = global_d.toString();
            lblN1.textContent = global_n.toString();
            lblN2.textContent = global_n.toString();

            // Ejecutar cifrado de texto
            processText();
        }
    } catch (error) {
        tdD.textContent = "Error";
    }
}

function processText() {
    const text = textInput.value;
    if (!text || global_n <= 255n) {
        outEncrypted.textContent = "-";
        outDecrypted.textContent = "-";
        return;
    }

    let encryptedHex = [];
    let encryptedBigInts = [];
    let decryptedText = "";

    // Proceso de Cifrado
    for (let i = 0; i < text.length; i++) {
        const charCode = BigInt(text.charCodeAt(i));
        const cipherNum = modPow(charCode, global_e, global_n);
        encryptedBigInts.push(cipherNum);
        
        // Formatear a Hexadecimal de 3 dígitos con ceros a la izquierda
        let hex = cipherNum.toString(16).toUpperCase();
        hex = hex.padStart(3, '0');
        encryptedHex.push(hex);
    }
    outEncrypted.textContent = encryptedHex.join(' ');

    // Proceso de Descifrado
    for (let i = 0; i < encryptedBigInts.length; i++) {
        const plainNum = modPow(encryptedBigInts[i], global_d, global_n);
        decryptedText += String.fromCharCode(Number(plainNum));
    }
    outDecrypted.textContent = decryptedText;
}

function populateESelect(phi) {
    const currentE = eSelect.value;
    eSelect.innerHTML = '';
    let count = 0;

    for (let i = 2n; i < phi && count < 30; i++) {
        if (gcd(i, phi) === 1n) {
            const opt = document.createElement('option');
            opt.value = i.toString();
            opt.textContent = i.toString();
            eSelect.appendChild(opt);
            count++;
        }
    }

    if (currentE && Array.from(eSelect.options).some(o => o.value === currentE)) {
        eSelect.value = currentE;
    } else if (eSelect.options.length > 0) {
        eSelect.selectedIndex = Math.floor(eSelect.options.length / 2); // Elegir un 'e' intermedio
    }
}

function disableBlock2(disable) {
    if (disable) {
        block2.classList.add('disabled-block');
        lblE.textContent = "-"; lblN1.textContent = "-";
        lblD.textContent = "-"; lblN2.textContent = "-";
    } else {
        block2.classList.remove('disabled-block');
    }
}

// Listeners
pInput.addEventListener('input', updateSystem);
qInput.addEventListener('input', updateSystem);
eSelect.addEventListener('change', updateSystem);
textInput.addEventListener('input', processText); // Solo procesar texto al escribir

// Iniciar
updateSystem();
