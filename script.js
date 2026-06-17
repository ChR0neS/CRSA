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

function renderMath() {
    if (window.MathJax) {
        MathJax.typesetPromise([document.getElementById('block-1')]).catch(function (err) {
            console.log('Error de MathJax: ', err.message);
        });
    }
}

// --- REFERENCIAS DOM ---
const pInput = document.getElementById('p-input');
const qInput = document.getElementById('q-input');
const textInput = document.getElementById('text-input');
const eSelect = document.getElementById('e-select');
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
const outEncrypted = document.getElementById('out-encrypted');
const outDecrypted = document.getElementById('out-decrypted');

let global_n, global_e, global_d;
let last_phi; // <--- FIX: Memoria para evitar reconstrucción infinita del select

// --- LÓGICA PRINCIPAL ---
function updateSystem() {
    mainWarning.classList.add('hidden');
    let p_big, q_big;

    try {
        p_big = BigInt(pInput.value.replace(/\s/g, ''));
        q_big = BigInt(qInput.value.replace(/\s/g, ''));
    } catch (e) {
        showError("Ingresa números enteros válidos.");
        return;
    }

    const pIsPrime = isPrimeBigInt(p_big);
    const qIsPrime = isPrimeBigInt(q_big);
    const areDistinct = p_big !== q_big;

    // 1. Primalidad y validaciones
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

    // 2 y 3. Módulo y Totiente
    resN.innerHTML = global_n.toString();
    resPhi.innerHTML = phi.toString();

    // FIX: Solo reconstruir las opciones de 'e' si phi realmente cambió
    if (phi !== last_phi) {
        populateESelect(phi);
        last_phi = phi;
    }

    // Verificar si hay opciones en el selector de e
    if (!eSelect.value) {
        resE.innerHTML = `❌ Inválido`;
        resE.style.color = "var(--danger)";
        showError("No se encontraron exponentes públicos válidos para estos números primos.");
        return;
    }

    global_e = BigInt(eSelect.value);

    // 4. Exponente
    if (gcd(global_e, phi) === 1n) {
        resE.innerHTML = `✅ ${global_e} es válido`;
        resE.style.color = "var(--accent)";
    } else {
        resE.innerHTML = `❌ Inválido`;
        resE.style.color = "var(--danger)";
        return;
    }

    try {
        // 5. Inverso
        global_d = modInverse(global_e, phi);
        resD.textContent = global_d.toString();

        block1.classList.remove('disabled-block');
        block2.classList.remove('disabled-block');

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
        
        // Cifrado
        const cipherNum = modPow(charCode, global_e, global_n);
        encryptedHex.push(cipherNum.toString(16).toUpperCase());

        // Descifrado
        const plainNum = modPow(cipherNum, global_d, global_n);
        decryptedStr += String.fromCharCode(Number(plainNum));

        // Mostrar el desglose con sintaxis LaTeX dinámica para la PRIMERA letra
        if (i === 0) {
            resC.innerHTML = `\\( \\text{ASCII}(${text[0]}) = ${charCode} \\rightarrow ${charCode}^{${global_e}} \\pmod{${global_n}} = \\mathbf{${cipherNum}} \\)`;
            resM.innerHTML = `\\( ${cipherNum}^{${global_d}} \\pmod{${global_n}} = ${plainNum} \\rightarrow \\mathbf{'${String.fromCharCode(Number(plainNum))}'} \\)`;
        }
    }

    outEncrypted.textContent = encryptedHex.join('-');
    outDecrypted.textContent = decryptedStr;

    // Ordenar a MathJax que vuelva a dibujar las ecuaciones tras actualizar los valores
    renderMath();
}

function populateESelect(phi) {
    const currentE = eSelect.value;
    eSelect.innerHTML = '';
    let count = 0;

    // Buscar candidatos a 'e' empezando desde 3
    for (let i = 3n; i < phi && count < 30; i+=2n) {
        if (gcd(i, phi) === 1n) {
            const opt = document.createElement('option');
            opt.value = i.toString();
            opt.textContent = i.toString();
            eSelect.appendChild(opt);
            count++;
        }
    }

    // Mantener la selección actual si aún es válida, sino tomar una del medio
    if (currentE && Array.from(eSelect.options).some(o => o.value === currentE)) {
        eSelect.value = currentE;
    } else if (eSelect.options.length > 0) {
        eSelect.selectedIndex = Math.min(5, eSelect.options.length - 1); 
    }
}

function showError(msg) {
    mainWarning.textContent = msg;
    mainWarning.classList.remove('hidden');
    block1.classList.add('disabled-block');
    block2.classList.add('disabled-block');
    outEncrypted.textContent = "-";
    outDecrypted.textContent = "-";
}

// Listeners
pInput.addEventListener('input', updateSystem);
qInput.addEventListener('input', updateSystem);
textInput.addEventListener('input', processText);
eSelect.addEventListener('change', updateSystem); // Ahora esto funciona correctamente sin romper el DOM

// Iniciar
updateSystem();
