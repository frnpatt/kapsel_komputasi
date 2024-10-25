// Fitur Kalkulator
const selectedOp = document.querySelector('.operator-get');
const opBox = document.querySelectorAll('.operator-box');
const usedOperator = document.querySelector('.used-operator p');
const pageBgr = document.querySelector('.page');

// Menentukan Operasi - fitur penggunaan
opBox.forEach(selected => {
    selected.addEventListener('click', function() {
        const inUse = document.querySelector('.selected');
        if (inUse) {
            inUse.classList.remove("selected");
        }
        selected.classList.add("selected");
        usedOperator.textContent = selected.querySelector('p').textContent;
    });
});

// Tetapkan ordo matriks
const setOrdo = document.querySelector('.set-ordo');
const inputBox = document.createElement('div'); // untuk masukan ukuran
inputBox.classList.add('matrix-input');
document.body.appendChild(inputBox);

// masukan untuk ukuran hanya bisa angka
document.getElementById('size').oninput = function() {
    this.value = this.value.replace(/[^0-9]/g, ''); // cuma boleh angka
};

// function setGrid() {
//     const jmlOrdo = parseInt(document.getElementById('size').value);

//     if (jmlOrdo > 1 && jmlOrdo <= 5) {
//         inputBox.innerHTML = ''; // hapus matriks lama
//         for (let i = 0; i < jmlOrdo * jmlOrdo; i++) {
//             const newInput = document.createElement('input');
//             newInput.setAttribute('type', 'number');
//             newInput.style.width = '40px';
//             // tambahkan (ke depan/append) masukan baru ke "input box"
//             inputBox.appendChild(newInput);
//         }
//     }
// }

// // event listener
// setOrdo.addEventListener('click', setGrid, false);

function generateMatrix() {
    const size = parseInt(document.getElementById('size').value);
    const container = document.getElementById('matrixContainer');
    container.innerHTML = ''; // hapus matriks sebelumnya

    if (size < 2 || size > 5 || isNaN(size)) {
        alert('Ordo matriks harus di antara 2–5.');
        return;
    }

    const table = document.createElement('table');
    for (let i = 0; i < size; i++) {
        const row = document.createElement('tr');
        for (let j = 0; j < size; j++) {
            const cell = document.createElement('td');
            const input = document.createElement('input');
            input.type = 'text';

            // cuma boleh bilangan real
            input.oninput = function() {
                this.value = this.value.replace(/[^0-9.-]/g, ''); //angka, titik (untuk desimal), dan tanda minus 
                if (this.value.split('.').length > 2) this.value = this.value.slice(0, -1); // cuma boleh satu titik
                if (this.value.indexOf('-') > 0) this.value = this.value.replace('-', ''); // minus cuma di depan
            };

            cell.appendChild(input);
            row.appendChild(cell);
        }
        table.appendChild(row);
    }
    container.appendChild(table);

    // bikin tombol untuk kirim (submit)
    const submitButton = document.createElement('button');
    submitButton.innerText = 'Hitung';
    submitButton.onclick = function() {
        const A = [];
        for (let i = 0; i < size; i++) {
            const row = [];
            const inputs = table.rows[i].getElementsByTagName('input');
            for (let j = 0; j < size; j++) {
                const value = parseFloat(inputs[j].value);
                if (isNaN(value)) {
                    alert('Mohon masukkan entri bilangan real pada matriks.');
                    return;
                }
                row.push(value);
            }
            A.push(row);
        }
        console.log('Matrix:', A);
        LUdekom(A); // fungsi buat LU
    };

    container.appendChild(submitButton);
}

// tombol enter
document.getElementById('size').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault(); // cegah kirim (submit)
        generateMatrix(); // klik manual saja
    }
});

const setOrdoButton = document.querySelector('.set-ordo');
setOrdoButton.addEventListener('click', generateMatrix);

const { fraction } = math;

function LUdekom(A) {
    const n = A.length;
    const L = Array.from({ length: n }, (_, i) => 
        Array.from({ length: n }, (_, j) => (i === j ? fraction(1) : fraction(0)))
    );
    const U = A.map(row => row.map(value => fraction(value)));

    // mekaniknya dari teorema LU
    function deter(B, peng = 1) { // Fungsi determinan dengan rekursif (kofaktor)
        const ukuran = B.length;
        if (ukuran === 1) {
            return peng * B[0][0];
        } else {
            let tanda = -1;
            let jawab = 0;
            for (let i = 0; i < ukuran; i++) {
                const boneka = [];
                for (let j = 1; j < ukuran; j++) {
                    const tamb = [];
                    for (let k = 0; k < ukuran; k++) {
                        if (k !== i) {
                            tamb.push(B[j][k]);
                        }
                    }
                    boneka.push(tamb);
                }
                tanda *= -1;
                jawab += peng * tanda * B[0][i] * deter(boneka);
            }
            return jawab;
        }
    }

    function detsub(A) { // Fungsi minor utama terdepan
        const boneka = new Array(A.length).fill(0);
        for (let l = 0; l < A.length; l++) {
            const submatriks = A.slice(0, l + 1).map(row => row.slice(0, l + 1));
            boneka[l] = deter(submatriks);
        }
        return boneka;
    }

    function cekdetsub_lu(X) { // Fungsi untuk memeriksa apakah minor utama terdepan nol atau tidak
        return detsub(X).some(value => value === 0) ? 1 : 0;
    }

    if (cekdetsub_lu(A) === 1) {
        showResult(); // Mengeluarkan tampilan modal - terdapat pada file result.js
        resultNoLUDecomp(); // Fungsi yang memberitahu pengguna bahwa matriks tidak dapat didekomposisi LU - terdapat pada file result.js
        throw new TypeError("Matriks tidak dapat didekomposisi LU. Ada minor utama terdepan dari matriks yang nol.");
    } else {
        for (let k = 0; k < n - 1; k++) {
            for (let i = k + 1; i < n; i++) {
                const faktor = U[i][k].div(U[k][k]);
                L[i][k] = faktor;
                for (let j = k; j < n; j++) {
                    U[i][j] = U[i][j].sub(faktor.mul(U[k][j]));
                }
            }
        }
    }

    // Keluaran dalam bentuk pecahan
    console.log('L =', L.map(row => row.map(value => value.toFraction())));
    console.log('U =', U.map(row => row.map(value => value.toFraction())));

    // Keluaran dalam bentuk desimal
    console.log('L (Desimal) =', L.map(row => row.map(value => value.valueOf())));
    console.log('U (Desimal) =', U.map(row => row.map(value => value.valueOf())));

    console.log(A);
    console.log(L);
    console.log(U);

    showResult();
    resultYesLUDecomp(L,U);
    historyLUDecomp(L,U,A);
}