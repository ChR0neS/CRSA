// Funciones Matemáticas Auxiliares
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

// Elementos del DOM
const pInput = document.getElementById('p-input');
const qInput = document.getElementById('q-input');
const mInput = document.getElementById('m-input');
const eSelect = document.getElementById('e-select');
const warningMsg = document.getElementById('warning-msg');

const outN = document.getElementById('out-n');
const outPhi = document.getElementById('out-phi');
const outD = document.getElementById('out-d');
const outCTotal = document.getElementById('out-c-total');
const outMDec = document.getElementById('out-m-dec');

function updateRSA() {
    const p = parseInt(pInput.value);
    const q = parseInt(qInput.value);
    const textMsg = mInput.value;

    if (isNaN(p) || isNaN(q)) return;

    const n_val = p * q;

    // Validación: n debe ser mayor a 255 para soportar caracteres ASCII estándar
    if (!isPrime(p) || !isPrime(q) || n_val <= 255) {
        warningMsg.classList.remove('hidden');
        outCTotal.textContent = "Error de parámetros";
        outMDec.textContent = "-";
        return;
    } else {
        warningMsg.classList.add('hidden');
    }

    const p_big = BigInt(p);
    const q_big = BigInt(q);
    const n = p_big * q_big;
    const phi = (p_big - 1n) * (q_big - 1n);

    outN.textContent = n.toString();
    outPhi.textContent = phi.toString();

    populateESelect(phi);
    
    if (!eSelect.value) return;
    const e = BigInt(eSelect.value);

    try {
        const d = modInverse(e, phi);
        outD.textContent = d.toString();

        if (textMsg.length === 0) {
            outCTotal.textContent = "-";
            outMDec.textContent = "-";
            return;
        }

        // PROCESO DE CIFRADO
        let encryptedHexArray = [];
        let encryptedBigIntArray = []; // Para usar en el descifrado

        for (let i = 0; i < textMsg.length; i++) {
            // 1. Convertir letra a valor numérico (ASCII)
            const charCode = BigInt(textMsg.charCodeAt(i));
            
            // 2. Aplicar fórmula matemática: C = M^e mod n
            const encryptedCharNum = modPow(charCode, e, n);
            encryptedBigIntArray.push(encryptedCharNum);
            
            // 3. Convertir el número a Hexadecimal para que luzca como código
            encryptedHexArray.push(encryptedCharNum.toString(16).toUpperCase());
        }

        // Mostrar el mensaje cifrado total unido por guiones
        outCTotal.textContent = encryptedHexArray.join('-');

        // PROCESO DE DESCIFRADO
        let decryptedText = "";
        
        for (let i = 0; i < encryptedBigIntArray.length; i++) {
            // 1. Aplicar fórmula inversa: M = C^d mod n
            const decryptedCharNum = modPow(encryptedBigIntArray[i], d, n);
            
            // 2. Convertir el número de vuelta a su letra correspondiente
            decryptedText += String.fromCharCode(Number(decryptedCharNum));
        }

        // Mostrar el texto reconstruido
        outMDec.textContent = decryptedText;
        
    } catch (error) {
        outD.textContent = "Error";
        outCTotal.textContent = "Error matemático en el procesamiento.";
    }
}

function populateESelect(phi) {
    const currentE = eSelect.value;
    eSelect.innerHTML = '';
    let optionsAdded = 0;

    for (let i = 2n; i < phi && optionsAdded < 30; i++) {
        if (gcd(i, phi) === 1n) {
            const option = document.createElement('option');
            option.value = i.toString();
            option.textContent = i.toString();
            eSelect.appendChild(option);
            optionsAdded++;
        }
    }

    if (currentE && Array.from(eSelect.options).some(opt => opt.value === currentE)) {
        eSelect.value = currentE;
    } else if (eSelect.options.length > 0) {
        eSelect.selectedIndex = eSelect.options.length - 1; // Elegir un e alto por defecto
    }
}

pInput.addEventListener('input', updateRSA);
qInput.addEventListener('input', updateRSA);
mInput.addEventListener('input', updateRSA);
eSelect.addEventListener('change', updateRSA);

updateRSA();
