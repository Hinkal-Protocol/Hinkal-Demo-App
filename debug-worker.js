// Save this as debug-worker.js in your project root
// Run with: node debug-worker.js

const fs = require("fs");
const path = require("path");

console.log("🔍 Searching for worker files...\n");

function findFiles(dir, pattern, results = []) {
  try {
    const files = fs.readdirSync(dir);

    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        if (!file.includes("node_modules") || file === "@sabaaa1") {
          findFiles(filePath, pattern, results);
        }
      } else if (file.match(pattern)) {
        results.push(filePath);
      }
    }
  } catch (err) {
    // Skip permission errors
  }

  return results;
}

// Find all worker-related files
const workerFiles = findFiles("node_modules/@sabaaa1", /worker|utxo|Worker/i);

console.log("📁 Found worker-related files:");
workerFiles.forEach((file) => console.log(`  - ${file}`));

// Check package.json
const pkgPath = "node_modules/@sabaaa1/common/package.json";
if (fs.existsSync(pkgPath)) {
  console.log("\n📦 Package info:");
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
  console.log("  Name:", pkg.name);
  console.log("  Version:", pkg.version);
  console.log("  Main:", pkg.main);
  console.log("  Module:", pkg.module);
  console.log("  Exports:", JSON.stringify(pkg.exports, null, 2));
}

// Search for Worker instantiation in the code
console.log("\n🔎 Searching for Worker instantiation...");
const jsFiles = findFiles("node_modules/@sabaaa1", /\.js$/);

for (const file of jsFiles) {
  const content = fs.readFileSync(file, "utf8");
  if (content.includes("new Worker") || content.includes("Worker(")) {
    console.log(`\n  Found in: ${file}`);
    const lines = content.split("\n");
    lines.forEach((line, i) => {
      if (line.includes("Worker")) {
        console.log(`    Line ${i + 1}: ${line.trim()}`);
      }
    });
  }
}

console.log("\n✅ Done!");
