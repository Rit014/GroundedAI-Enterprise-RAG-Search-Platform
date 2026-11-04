import { retrieveChunks } from "./retrieveChunks";

const chunks = [
  "The company provides annual leave to employees.",
  "Employees receive 20 days of annual leave each year.",
  "The office kitchen closes at 6 PM.",
];

const result = retrieveChunks(
  "How many days of annual leave do employees receive?",
  chunks
);

console.log(result);