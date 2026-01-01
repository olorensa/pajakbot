export function splitText(text, chunkSize = 500) {
    const chunks = [];
    let start = 0;
  
    while (start < text.length) {
      chunks.push(text.slice(start, start + chunkSize));
      start += chunkSize;
    }
  
    return chunks;
  }
  