import * as fs from 'fs';

function main() {
  const jsonStr = fs.readFileSync('scripts/output-doa-qurani.json', 'utf-8');
  const newData = JSON.parse(jsonStr);

  const fixedData = newData.map((item: any, index: number) => {
    const paddedIndex = String(16 + index).padStart(3, '0');
    return {
      ...item,
      id: `${item.kategori}-${paddedIndex}`,
      tafsir_ulama: item.tafsir_ulama || []
    };
  });

  const tsFilePath = 'src/data/doa_qurani.ts';
  let tsContent = fs.readFileSync(tsFilePath, 'utf-8');

  // Find the end of the DOA_QURANI array
  // We can look for the last closing bracket of the array, but there are multiple arrays.
  // The DOA_QURANI array declaration ends before `export function getByKategori` or similar helper functions.
  // Let's find the closing bracket of DOA_QURANI.
  
  const searchPattern = '\n]\n\n// Helper functions';
  let insertionPoint = tsContent.indexOf(searchPattern);
  if (insertionPoint === -1) {
      insertionPoint = tsContent.lastIndexOf('\n]');
  }

  if (insertionPoint === -1) {
    console.error('Could not find the end of DOA_QURANI array');
    return;
  }

  const newItemsStr = fixedData.map((item: any) => '  ' + JSON.stringify(item, null, 2).replace(/\n/g, '\n  ') + ',').join('\n');

  tsContent = tsContent.slice(0, insertionPoint) + ',\n' + newItemsStr + tsContent.slice(insertionPoint);

  fs.writeFileSync(tsFilePath, tsContent);
  console.log(`Successfully appended ${fixedData.length} items to ${tsFilePath}`);
}

main();
