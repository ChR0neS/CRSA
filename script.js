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

// Algoritmo de Euclides Extendido para Inverso Modular
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

// Exponenciación Modular Rápida: (base^exp) % mod
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
    const M_val = parseInt(mInput.value);

    // Validación de Primos
    if (!isPrime(p) || !isPrime(q)) {
        warningMsg.classList.remove('hidden');
    } else {
        warningMsg.classList.add('hidden');
    }

    if (isNaN(p) || isNaN(q) || isNaN(M_val)) return;

    // Uso de BigInt para precisión matemática
    const p_big = BigInt(p);
    const q_big = BigInt(q);
    const M = BigInt(M_val);

    // Paso 1: n y φ(n)
    const n = p_big * q_big;
    const phi = (p_big - 1n) * (q_big - 1n);

    outN.textContent = n.toString();
    outPhi.textContent = phi.toString();

    // Actualizar selector de 'e' si cambia φ(n)
    populateESelect(phi);
    
    // Si no hay 'e' seleccionado, detenemos el cálculo
    if (!eSelect.value) return;
    
    const e = BigInt(eSelect.value);

    // Validación del Mensaje M < n
    if (M >= n) {
        outC.textContent = "Error: M debe ser menor que n";
        outMDec.textContent = "-";
        return;
    }

    // Calcular d (inverso modular)
    try {
        const d = modInverse(e, phi);
        outD.textContent = d.toString();

        // Paso 2: Cifrado (C = M^e mod n)
        const C = modPow(M, e, n);
        outC.textContent = C.toString();

        // Paso 3: Descifrado (M_dec = C^d mod n)
        const M_dec = modPow(C, d, n);
        outMDec.textContent = M_dec.toString();
        
    } catch (error) {
        outD.textContent = "Error en el cálculo";
    }
}

function populateESelect(phi) {
    // Guardar el valor actual para no perderlo si aún es válido
    const currentE = eSelect.value;
    eSelect.innerHTML = '';

    let optionsAdded = 0;
    // Buscamos candidatos para 'e' (1 < e < phi, coprimos con phi)
    // Limitamos a 50 opciones para no sobrecargar el selector
    for (let i = 2n; i < phi && optionsAdded < 50; i++) {
        if (gcd(i, phi) === 1n) {
            const option = document.createElement('option');
            option.value = i.toString();
            option.textContent = i.toString();
            eSelect.appendChild(option);
            optionsAdded++;
        }
    }

    // Intentar mantener la selección anterior si es posible
    if (currentE && Array.from(eSelect.options).some(opt => opt.value === currentE)) {
        eSelect.value = currentE;
    } else {
        // Seleccionar un 'e' tradicional si está disponible (ej. 65537, o el primer candidato)
        if(eSelect.options.length > 0){
            eSelect.selectedIndex = 0;
        }
    }
}

// Listeners de Eventos
pInput.addEventListener('input', updateRSA);
qInput.addEventListener('input', updateRSA);
mInput.addEventListener('input', updateRSA);
eSelect.addEventListener('change', updateRSA);

// Inicialización
updateRSA();
