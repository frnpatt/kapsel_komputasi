function CholeskyDekom(A) {
    const n = A.length;

    // Check symmetry
    for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
            if (!math.equal(A[i][j], A[j][i])) {
                alert("Matriks tidak simetris. Cholesky decomposition tidak dapat dilakukan.");
                throw new TypeError("Matrix is not symmetric.");
            }
        }
    }

    // Initialize L matrix
    const L = Array.from({ length: n }, () => Array(n).fill(math.fraction(0)));

    for (let k = 0; k < n; k++) {
        // Partial pivoting: Find the row with the largest diagonal element
        let maxRow = k;
        for (let i = k + 1; i < n; i++) {
            if (math.abs(A[i][i]) > math.abs(A[maxRow][maxRow])) {
                maxRow = i;
            }
        }

        if (maxRow !== k) {
            // Swap rows in A
            [A[k], A[maxRow]] = [A[maxRow], A[k]];

            // Swap corresponding rows in L
            for (let j = 0; j < k; j++) {
                [L[k][j], L[maxRow][j]] = [L[maxRow][j], L[k][j]];
            }
        }

        // Check if the pivot is sufficiently large (ill-conditioned check)
        if (math.smaller(math.abs(A[k][k]), math.fraction(1e-10))) {
            alert("Pivot terlalu kecil. Matriks tidak dapat didekomposisi Cholesky.");
            throw new TypeError("Matrix is ill-conditioned for Cholesky decomposition.");
        }

        // Compute the diagonal element
        L[k][k] = math.sqrt(A[k][k]);

        // Compute the sub-diagonal elements
        for (let i = k + 1; i < n; i++) {
            L[i][k] = math.divide(A[i][k], L[k][k]);
        }

        // Update the matrix A
        for (let i = k + 1; i < n; i++) {
            for (let j = k + 1; j <= i; j++) {
                A[i][j] = math.subtract(A[i][j], math.multiply(L[i][k], L[j][k]));
            }
        }
    }

    // Output matrices
    console.log('L =', L.map(row => row.map(value => value.toFraction())));
    console.log('Lᵀ =', L.map(row => row.map(value => value.toFraction())).map((_, i, arr) => arr.map(row => row[i])));

    // Display results
    triggerModal();
    removeContent('modal-box-content');
    hideHistory();
    resultYesCholeskyDecomp(L);
    historyCholeskyDecomp(L, A);
}

// Display Cholesky Results
function resultYesCholeskyDecomp(L) {
    const headerModal = document.querySelector('.modal-box-header');
    headerModal.innerHTML = 'Cholesky Decomposition';

    const modalBox = document.querySelector('.modal-box-content');

    const formatValue = value =>
        math.isFraction(value) ? value.toFraction() : value.toFixed(3);

    // Create L Table
    const lTable = document.createElement('table');
    lTable.className = 'lTable';
    lTable.innerHTML = '<caption>L</caption>';
    L.forEach(row => {
        const tr = document.createElement('tr');
        row.forEach(value => {
            const td = document.createElement('td');
            td.textContent = formatValue(value);
            tr.appendChild(td);
        });
        lTable.appendChild(tr);
    });

    // Append L and Lᵀ tables
    modalBox.appendChild(lTable);
}

// History for Cholesky Decomposition
function historyCholeskyDecomp(L, A) {
    console.log("Cholesky History");
    console.log("Matrix A:", A);
    console.log("Matrix L:", L);
    console.log("Matrix Lᵀ:", L.map((_, i, arr) => arr.map(row => row[i])));
}
