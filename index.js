import { readFileSync } from "fs";

function parseValue(base, value) {
  return BigInt(parseInt(value, parseInt(base)));
}

// Helper function to compute BigInt power
function bigIntPow(base, exponent) {
  if (exponent === 0) return 1n;
  let result = 1n;
  for (let i = 0; i < exponent; i++) {
    result *= base;
  }
  return result;
}

// Helper function to compute absolute value for BigInt
function bigIntAbs(value) {
  return value < 0n ? -value : value;
}

function gaussianElimination(points, k) {
  const selectedPoints = points.slice(0, k);
  const n = selectedPoints.length;

  const matrix = [];

  // Build the matrix with BigInt values
  for (let i = 0; i < n; i++) {
    const [xi, yi] = selectedPoints[i];
    const row = [];

    for (let j = 0; j < k; j++) {
      row.push(bigIntPow(BigInt(xi), j));
    }
    row.push(yi);
    matrix.push(row);
  }

  // Forward elimination with BigInt arithmetic
  for (let i = 0; i < n; i++) {
    let maxRow = i;
    for (let k = i + 1; k < n; k++) {
      if (bigIntAbs(matrix[k][i]) > bigIntAbs(matrix[maxRow][i])) {
        maxRow = k;
      }
    }

    [matrix[i], matrix[maxRow]] = [matrix[maxRow], matrix[i]];

    for (let k = i + 1; k < n; k++) {
      if (matrix[i][i] === 0n) continue; // Skip if pivot is zero

      // For BigInt division in Gaussian elimination, we need to be careful
      // We'll multiply through to avoid fractions
      const numerator = matrix[k][i];
      const denominator = matrix[i][i];

      for (let j = i; j <= n; j++) {
        if (i === j) {
          matrix[k][j] = 0n;
        } else {
          // matrix[k][j] = matrix[k][j] - (numerator * matrix[i][j]) / denominator
          matrix[k][j] = matrix[k][j] * denominator - numerator * matrix[i][j];
        }
      }
    }
  }

  // Back substitution with BigInt arithmetic
  const solution = new Array(n);
  for (let i = n - 1; i >= 0; i--) {
    solution[i] = matrix[i][n];
    for (let j = i + 1; j < n; j++) {
      solution[i] -= matrix[i][j] * solution[j];
    }
    // For the final division, we need to handle BigInt carefully
    if (matrix[i][i] !== 0n) {
      solution[i] = solution[i] / matrix[i][i];
    }
  }

  return solution[0];
}

function solveShamirSecret(jsonData) {
  const { keys, ...roots } = jsonData;
  const { n, k } = keys;

  const points = [];

  for (const [key, data] of Object.entries(roots)) {
    const x = parseInt(key);
    const y = parseValue(data.base, data.value);
    points.push([x, y]);
  }

  points.sort((a, b) => a[0] - b[0]);

  const secret = gaussianElimination(points, k);

  return secret;
}

try {
  const jsonData = JSON.parse(readFileSync("index.json", "utf8"));
  const jsonData2 = JSON.parse(readFileSync("index2.json", "utf8"));

  const secret1 = solveShamirSecret(jsonData);
  console.log("Secret 1 (constant term):", secret1.toString());

  const secret2 = solveShamirSecret(jsonData2);
  console.log("Secret 2 (constant term):", secret2.toString());
} catch (error) {
  console.error("Error reading or parsing JSON file:", error.message);
}
