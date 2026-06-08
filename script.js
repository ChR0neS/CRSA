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

// --- REFERENCIAS DOM BLOQUE 1 ---
const pInput = document.getElementById('p-input');
const qInput = document.getElementById('q-input');
const mNumInput = document.getElementById('m-num-input');
const eSelect = document.getElementById('e-select');

// Celdas de la tabla
const resPrim = document.getElementById('res-prim');
const resN = document.getElementById('res-n');
const resPhi = document.getElementById('res-phi');
const resE = document.getElementById('res-e');
const resDStep = document.getElementById('res-d-step');
const resC = document.getElementById('res-c');
const resMStep = document.getElementById('res-m-step');

// Resumen inferior
const sumN = document.getElementById('sum-n');
const sumPhi = document.getElementById('sum-phi');
const sumD = document.getElementById('sum-d');

// --- REFERENCIAS DOM BLOQUE 2 ---
const textInput = document.getElementById('text-input');
const outEncrypted = document.getElementById('out-encrypted');
const asciiWarning = document.getElementById('ascii-warning');
const block2 = document.getElementById('block-2');

const lblE = document.getElementById('lbl-e');
const lblN1 = document.getElementById('lbl-n1');
const lblD = document.getElementById('lbl-d');
const lblN2 = document.getElementById('lbl-n2');

let global_n, global_e, global_d;

// --- CONTROLADORES DE BOTONES (+ / -) ---
function setupStepper(inputId, minusId, plusId, callback) {
    const input = document.getElementById(inputId);
    document.getElementById(minusId).addEventListener('click', () => {
        input.value = parseInt(input.value) - 1;
        callback();
    });
    document.getElementById(plusId).addEventListener('click', () => {
        input.value = parseInt(input.value) + 1;
        callback();
    });
    input.addEventListener('input', callback);
}

setupStepper('p-input', 'btn-p-minus', 'btn-p-plus', updateSystem);
setupStepper('q-input', 'btn-q-minus', 'btn-q-plus', updateSystem);
setupStepper('m-num-input', 'btn-m-minus', 'btn-m-plus', updateSystem);
eSelect.addEventListener('change', updateSystem);
textInput.addEventListener('input', processText);

// --- LÓGICA PRINCIPAL ---
function updateSystem() {
    const p = parseInt(pInput.value);
    const q = parseInt(qInput.value);
    const m_num = parseInt(mNumInput.value);
    
    if (isNaN(p) || isNaN(q) || isNaN(m_num)) return;

    const pIsPrime = isPrime(p);
    const qIsPrime = isPrime(q);

    // 1. Primalidad
    if (pIsPrime && qIsPrime) {
        resPrim.innerHTML = "✅ Sí";
        resPrim.style.color = "#2ea043";
    } else {
        resPrim.innerHTML = "❌ No (Revisa p y q)";
        resPrim.style.color = "#f85149";
    }

    const p_big = BigInt(p);
    const q_big = BigInt(q);
    const M_big = BigInt(m_num);

    global_n = p_big * q_big;
    const phi = (p_big - 1n) * (q_big - 1n);

    // 2 y 3. Módulo y Totiente
    resN.innerHTML = `${p} &times; ${q} = ${global_n}`;
    resPhi.innerHTML = `${p-1} &times; ${q-1} = ${phi}`;
    
    sumN.textContent = global_n.toString();
    sumPhi.textContent = phi.toString();

    // Actualizar 'e'
    populateESelect(phi);
    if (!eSelect.value) return;
    global_e = BigInt(eSelect.value);

    // 4. Exponente
    if (gcd(global_e, phi) === 1n) {
        resE.innerHTML = `✅ ${global_e} es válido`;
    } else {
        resE.innerHTML = `❌ Inválido`;
    }

    try {
        global_d = modInverse(global_e, phi);
        
        // 5. Inverso (d)
        resDStep.textContent = global_d.toString();
        sumD.textContent = global_d.toString();

        // 6. Cifrado Numérico (Bloque 1)
        const C = modPow(M_big, global_e, global_n);
        resC.innerHTML = `${m_num}<sup>${global_e}</sup> mod ${global_n} = ${C}`;

        // 7. Descifrado Numérico (Bloque 1)
        const M_dec = modPow(C, global_d, global_n);
        resMStep.innerHTML = `${C}<sup>${global_d}</sup> mod ${global_n} = ${M_dec}`;

        // Verificación de ASCII para Bloque 2
        if (!pIsPrime || !qIsPrime) {
            disableBlock2(true);
        } else if (global_n <= 255n) {
            asciiWarning.classList.remove('hidden');
            disableBlock2(true);
        } else {
            asciiWarning.classList.add('hidden');
            disableBlock2(false);
            
            lblE.textContent = global_e.toString();
            lblD.textContent = global_d.toString();
            lblN1.textContent = global_n.toString();
            lblN2.textContent = global_n.toString();

            processText();
        }
    } catch (error) {
        resDStep.textContent = "Error";
    }
}

function processText() {
    const text = textInput.value;
    if (!text || global_n <= 255n) {
        outEncrypted.textContent = "-";
        return;
    }

    let encryptedHex = [];
    for (let i = 0; i < text.length; i++) {
        const charCode = BigInt(text.charCodeAt(i));
        const cipherNum = modPow(charCode, global_e, global_n);
        let hex = cipherNum.toString(16).toUpperCase();
        encryptedHex.push(hex.padStart(3, '0'));
    }
    outEncrypted.textContent = encryptedHex.join(' ');
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
        // En este diseño, por defecto elegimos el primer 'e' válido para replicar el "7" de la imagen
        eSelect.selectedIndex = 0; 
    }
}

function disableBlock2(disable) {
    if (disable) {
        block2.classList.add('disabled-block');
        outEncrypted.textContent = "-";
    } else {
        block2.classList.remove('disabled-block');
    }
}

// Inicializar
updateSystem();
