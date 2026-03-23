/**
 * Patches @capacitor/android/capacitor/build.gradle to use Java 17
 * instead of Java 21, allowing builds on JDK 17 CI environments.
 * Runs automatically after `build:android` via package.json script.
 */
import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

function patch(file) {
  try {
    let content = readFileSync(file, 'utf8');
    if (content.includes('VERSION_21')) {
      content = content.replace(/VERSION_21/g, 'VERSION_17');
      writeFileSync(file, content, 'utf8');
      console.log('[patch-cap] ✅ Patched Java 21→17 in:', file);
      return true;
    }
  } catch {}
  return false;
}

// Search locations relative to this script's directory
const searchRoots = [
  resolve(__dirname, 'node_modules'),
  resolve(__dirname, '..', '..', 'node_modules'),
];

let patched = false;
for (const root of searchRoots) {
  if (!existsSync(root)) continue;
  try {
    const result = execSync(
      `find "${root}" -name "build.gradle" -path "*/@capacitor/android/capacitor/*" 2>/dev/null`,
      { encoding: 'utf8' }
    ).trim();
    for (const f of result.split('\n').filter(Boolean)) {
      if (patch(f)) patched = true;
    }
  } catch {}
}

if (!patched) {
  console.log('[patch-cap] No Capacitor Android build.gradle found to patch (may already be Java 17).');
}
