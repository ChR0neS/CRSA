// Funciones Matemáticas Auxiliares (Se mantienen igual)
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
const outC = document.getElementById('out-c');
const outMDec = document.getElementById('out-m-dec');

// Lógica Principal
function updateRSA() {
    const p = parseInt(pInput.value);
    const q = parseInt(qInput.value);
    const textMsg = mInput.value;

    const n_val = p * q;

    // Validación de Primos y tamaño de módulo (> 255 para ASCII)
    if (!isPrime(p) || !isPrime(q) || n_val <= 255) {
        warningMsg.classList.remove('hidden');
        outC.textContent = "Error de parámetros";
        outMDec.textContent = "-";
        return;
    } else {
        warningMsg.classList.add('hidden');
    }

    if (isNaN(p) || isNaN(q)) return;

    const p_big = BigInt(p);
    const q_big = BigInt(q);

    // Paso 1: n y φ(n)
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
            outC.textContent = "-";
            outMDec.textContent = "-";
            return;
        }

        let encryptedHexArray = [];
        let decryptedText = "";

        // Procesamiento de la matriz de caracteres
        for (let i = 0; i < textMsg.length; i++) {
            // 1. Mapeo a Entero (ASCII)
            const m_char = BigInt(textMsg.charCodeAt(i));
            
            // 2. Cifrado Numérico
            const c_char = modPow(m_char, e, n);
            
            // Guardar para visualización
            encryptedHexArray.push(c_char.toString(16).toUpperCase().padStart(3, '0'));

            // 3. Descifrado Numérico Inmediato
            const m_decrypted = modPow(c_char, d, n);
            decryptedText += String.fromCharCode(Number(m_decrypted));
        }

        outC.textContent = encryptedHexArray.join('-');
        outMDec.textContent = decryptedText;
        
    } catch (error) {
        outD.textContent = "Error en el cálculo";
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
    } else if(eSelect.options.length > 0){
        eSelect.selectedIndex = eSelect.options.length - 1;
    }
}

// Listeners de Eventos
pInput.addEventListener('input', updateRSA);
qInput.addEventListener('input', updateRSA);
mInput.addEventListener('input', updateRSA);
eSelect.addEventListener('change', updateRSA);

// Inicialización
updateRSA();
