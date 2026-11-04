
import { chunkText } from "./chunkText";

const text = "ABCDEFGHIJKL"; // (5, 2) => ABCDE DEFGH GHIJK JKL

const chunks = chunkText(text, 5, 2);

console.log(chunks);
console.log("Number of chunks:", chunks.length);
console.log("First chunk:", chunks[0]);
console.log("Last chunk:", chunks[chunks.length - 1]);
