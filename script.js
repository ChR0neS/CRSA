// --- MATEMÁTICAS AVANZADAS PARA BIGINT ---

function isPrimeBigInt(n) {
    if (n === 2n || n === 3n) return true;
    if (n <= 1n || n % 2n === 0n) return false;
    
    let d = n - 1n;
    let s = 0n;
    while (d % 2n === 0n) {
        d /= 2n;
        s += 1n;
    }
    
    const bases = [2n, 3n, 5n, 7n, 11n, 13n, 17n, 19n, 23n, 29n, 31n, 37n];
    
    for (let a of bases) {
        if (n <= a) break;
        let x = modPow(a, d, n);
        if (x === 1n || x === n - 1n) continue;
        
        let composite = true;
        for (let r = 1n; r < s; r++) {
            x = modPow(x, 2n, n);
            if (x === n - 1n) {
                composite = false;
                break;
            }
        }
        if (composite) return false;
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

// Algoritmo Square-and-Multiply
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

// --- FUNCIÓN DE ANÁLISIS DE COMPLEJIDAD MEJORADA ---
function analyzeComplexity(exponent) {
    const binString = exponent.toString(2);
    const bits = binString.length;
    
    // Cuenta la cantidad de '1's.
    const ones = binString.split('1').length - 1; 
    
    // Matemática pura del Square-and-Multiply:
    // Número de cuadrados (squarings) = longitud de bits - 1
    // Número de multiplicaciones = número de unos - 1
    const squarings = bits - 1;
    const multiplications = ones - 1;
    const totalOps = squarings + multiplications;

    return { bits, totalOps, squarings, multiplications };
}

function renderMath() {
    if (window.MathJax) {
        MathJax.typesetPromise([document.getElementById('block-1'), document.getElementById('block-3')]).catch(function (err) {
            console.log('Error de MathJax: ', err.message);
        });
    }
}

// --- REFERENCIAS DOM ---
const pInput = document.getElementById('p-input');
const qInput = document.getElementById('q-input');
const textInput = document.getElementById('text-input');
const eInput = document.getElementById('e-input'); // Ahora es un Input
const mainWarning = document.getElementById('main-warning');

const resPrim = document.getElementById('res-prim');
const resN = document.getElementById('res-n');
const resPhi = document.getElementById('res-phi');
const resE = document.getElementById('res-e');
const resD = document.getElementById('res-d');
const resC = document.getElementById('res-c');
const resM = document.getElementById('res-m');

const block1 = document.getElementById('block-1');
const block2 = document.getElementById('block-2');
const block3 = document.getElementById('block-3');
const outEncrypted = document.getElementById('out-encrypted');
const outDecrypted = document.getElementById('out-decrypted');

const compEncBits = document.getElementById('comp-enc-bits');
const compEncOps = document.getElementById('comp-enc-ops');
const compDecBits = document.getElementById('comp-dec-bits');
const compDecOps = document.getElementById('comp-dec-ops');

let global_n, global_e, global_d;

// --- LÓGICA PRINCIPAL ---
function updateSystem() {
    mainWarning.classList.add('hidden');
    let p_big, q_big, e_val;

    try {
        p_big = BigInt(pInput.value.replace(/\s/g, ''));
        q_big = BigInt(qInput.value.replace(/\s/g, ''));
    } catch (e) {
        showError("Ingresa números primos válidos en p y q.");
        return;
    }

    const pIsPrime = isPrimeBigInt(p_big);
    const qIsPrime = isPrimeBigInt(q_big);
    const areDistinct = p_big !== q_big;

    if (!pIsPrime || !qIsPrime) {
        resPrim.innerHTML = "❌ p y q deben ser primos";
        resPrim.style.color = "var(--danger)";
        showError("¡Error! p y q deben ser números primos.");
        return;
    } else if (!areDistinct) {
        resPrim.innerHTML = "❌ p y q no pueden ser iguales";
        resPrim.style.color = "var(--danger)";
        showError("¡Error Matemático! En RSA, p y q DEBEN ser distintos.");
        return;
    } else {
        resPrim.innerHTML = "✅ Sí (Primos y Distintos)";
        resPrim.style.color = "var(--accent)";
    }

    global_n = p_big * q_big;
    if (global_n <= 255n) {
        showError("El módulo n (p*q) debe ser mayor a 255 para soportar caracteres de texto (ASCII).");
        return;
    }

    const phi = (p_big - 1n) * (q_big - 1n);

    resN.innerHTML = global_n.toString();
    resPhi.innerHTML = phi.toString();

    // Validar el Exponente E que el usuario ha escrito
    try {
        e_val = BigInt(eInput.value.replace(/\s/g, ''));
    } catch (e) {
        resE.innerHTML = `❌ Formato inválido`;
        resE.style.color = "var(--danger)";
        showError("Ingresa un número válido para el exponente público (e).");
        return;
    }

    if (e_val <= 1n || e_val >= phi || gcd(e_val, phi) !== 1n) {
        resE.innerHTML = `❌ No es coprimo con \(\\phi\)`;
        resE.style.color = "var(--danger)";
        showError(`El exponente ${e_val} NO es válido. Prueba con un número primo que no comparta divisores con la función de Euler (como 65537, 41, 17...).`);
        return;
    } else {
        resE.innerHTML = `✅ ${e_val} es válido`;
        resE.style.color = "var(--accent)";
    }

    global_e = e_val;

    try {
        global_d = modInverse(global_e, phi);
        resD.textContent = global_d.toString();

        block1.classList.remove('disabled-block');
        block2.classList.remove('disabled-block');
        block3.classList.remove('disabled-block');

        // Renderizar la complejidad dinámicamente
        const encStats = analyzeComplexity(global_e);
        const decStats = analyzeComplexity(global_d);

        compEncBits.textContent = `${encStats.bits} bits`;
        compEncOps.textContent = `${encStats.totalOps} (${encStats.squarings} cuad. + ${encStats.multiplications} mult.)`;
        
        compDecBits.textContent = `${decStats.bits} bits`;
        compDecOps.textContent = `${decStats.totalOps} (${decStats.squarings} cuad. + ${decStats.multiplications} mult.)`;

        processText();
    } catch (error) {
        resD.textContent = "Error matemático";
        showError("No se pudo calcular la clave privada.");
    }
}

function processText() {
    const text = textInput.value;
    if (!text || !global_n || !global_e || !global_d) {
        outEncrypted.textContent = "-";
        outDecrypted.textContent = "-";
        resC.textContent = "-";
        resM.textContent = "-";
        return;
    }

    let encryptedHex = [];
    let decryptedStr = "";

    for (let i = 0; i < text.length; i++) {
        const charCode = BigInt(text.charCodeAt(i));
        
        const cipherNum = modPow(charCode, global_e, global_n);
        encryptedHex.push(cipherNum.toString(16).toUpperCase());

        const plainNum = modPow(cipherNum, global_d, global_n);
        decryptedStr += String.fromCharCode(Number(plainNum));

        if (i === 0) {
            resC.innerHTML = `\\( \\text{ASCII}(${text[0]}) = ${charCode} \\rightarrow ${charCode}^{${global_e}} \\pmod{${global_n}} = \\mathbf{${cipherNum}} \\)`;
            resM.innerHTML = `\\( ${cipherNum}^{${global_d}} \\pmod{${global_n}} = ${plainNum} \\rightarrow \\mathbf{'${String.fromCharCode(Number(plainNum))}'} \\)`;
        }
    }

    outEncrypted.textContent = encryptedHex.join('-');
    outDecrypted.textContent = decryptedStr;

    renderMath();
}

function showError(msg) {
    mainWarning.textContent = msg;
    mainWarning.classList.remove('hidden');
    block1.classList.add('disabled-block');
    block2.classList.add('disabled-block');
    block3.classList.add('disabled-block');
    outEncrypted.textContent = "-";
    outDecrypted.textContent = "-";
}

// Listeners
pInput.addEventListener('input', updateSystem);
qInput.addEventListener('input', updateSystem);
textInput.addEventListener('input', processText);
eInput.addEventListener('input', updateSystem); // Responde en tiempo real al escribir el exponente

// Iniciar
updateSystem();
