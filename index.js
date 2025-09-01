import { readFileSync } from "fs";

function parseValue(base, value) {
  return parseInt(value, parseInt(base));
}

function gaussianElimination(points, k) {
  const selectedPoints = points.slice(0, k);
  const n = selectedPoints.length;

  const matrix = [];

  for (let i = 0; i < n; i++) {
    const [xi, yi] = selectedPoints[i];
    const row = [];

    for (let j = 0; j < k; j++) {
      row.push(Math.pow(xi, j));
    }
    row.push(yi);
    matrix.push(row);
  }

  for (let i = 0; i < n; i++) {
    let maxRow = i;
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(matrix[k][i]) > Math.abs(matrix[maxRow][i])) {
        maxRow = k;
      }
    }

    [matrix[i], matrix[maxRow]] = [matrix[maxRow], matrix[i]];

    for (let k = i + 1; k < n; k++) {
      const factor = matrix[k][i] / matrix[i][i];
      for (let j = i; j <= n; j++) {
        if (i === j) {
          matrix[k][j] = 0;
        } else {
          matrix[k][j] -= factor * matrix[i][j];
        }
      }
    }
  }

  const solution = new Array(n);
  for (let i = n - 1; i >= 0; i--) {
    solution[i] = matrix[i][n];
    for (let j = i + 1; j < n; j++) {
      solution[i] -= matrix[i][j] * solution[j];
    }
    solution[i] /= matrix[i][i];
  }

  return Math.round(solution[0]);
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
  console.log("Secret 1 (constant term):", secret1);

  const secret2 = solveShamirSecret(jsonData2);
  console.log("Secret 2 (constant term):", secret2);
} catch (error) {
  console.error("Error reading or parsing JSON file:", error.message);
}
