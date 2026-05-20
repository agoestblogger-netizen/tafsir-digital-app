import * as fs from 'fs';

function main() {
  const jsonStr = fs.readFileSync('scripts/output-sains-ayat.json', 'utf-8');
  const newData = JSON.parse(jsonStr);

  const fixedData = newData.map((item: any, index: number) => ({
    ...item,
    id: 16 + index
  }));

  const tsFilePath = 'src/data/sains_ayat.ts';
  let tsContent = fs.readFileSync(tsFilePath, 'utf-8');

  // Find the end of the AYAT_SAINS array
  const insertionPoint = tsContent.indexOf('\n]\n');
  if (insertionPoint === -1) {
    console.error('Could not find the end of AYAT_SAINS array');
    return;
  }

  const newItemsStr = fixedData.map((item: any) => '  ' + JSON.stringify(item, null, 2).replace(/\n/g, '\n  ') + ',').join('\n');

  tsContent = tsContent.slice(0, insertionPoint) + ',\n' + newItemsStr + tsContent.slice(insertionPoint);

  fs.writeFileSync(tsFilePath, tsContent);
  console.log(`Successfully appended ${fixedData.length} items to ${tsFilePath}`);
}

main();
