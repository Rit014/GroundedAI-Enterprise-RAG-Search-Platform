"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";

export default function Home() {
  const [question, setQuestion] = useState("");
  const [documentText, setDocumentText] = useState("");
  const [fileName, setFileName] = useState("");
  const [fileType, setFileType] = useState("");
  const [fileSize, setFileSize] = useState(0);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");
  const [uploadFailed, setUploadFailed] = useState(false);
  const [asking, setAsking] = useState(false);
  const [answer, setAnswer] = useState("");
  const [answerError, setAnswerError] = useState("");

  return (
    <main className="min-h-screen bg-black text-white px-6 py-10">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold">GroundedAI</h1>

        <p className="text-gray-400 mt-2">
          Ask questions. Get answers backed by your documents.
        </p>

        <div className="mt-12 border border-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-semibold">Ask your documents</h2>

          <p className="text-gray-400 text-sm mt-2">
            Upload your company documents and find answers with verified
            sources.
          </p>

          <label className="block mt-6">
            <span className="text-sm text-gray-300">
              Choose a document (PDF, TXT, or DOCX)
            </span>

            <input
              type="file"
              accept=".pdf,.txt,.docx"
              onChange={(event) => {
                const file = event.target.files?.[0];

                setError("");
                setFileName("");
                setFileType("");
                setFileSize(0);
                setDocumentText("");
                setUploadMessage("");
                setAnswer("");
                setAnswerError("");

                if (!file) return;

                const allowedTypes = [
                  "application/pdf",
                  "text/plain",
                  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                ];

                if (!allowedTypes.includes(file.type)) {
                  setError("Please select a PDF, TXT, or DOCX file.");
                  return;
                }

                if (file.size > 5 * 1024 * 1024) {
                  setError("File size must be 5 MB or less.");
                  return;
                }

                setFileName(file.name);
                setFileType(file.type);
                setFileSize(file.size);
              }}
              className="block w-full mt-2 text-sm text-gray-300"
            />

            {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

            {fileName && (
              <div className="mt-2 text-sm text-gray-400">
                <p className="mt-3 text-sm text-blue-400">
                  Selected document: {fileName}
                </p>
                <p>File type: {fileType || "Unknown"}</p>
                <p>File size: {(fileSize / 1024).toFixed(2)} KB</p>
              </div>
            )}
          </label>

          <button
            type="button"
            disabled={!fileName || !!error || uploading}
            onClick={async () => {
              const input = document.querySelector(
                'input[type="file"]'
              ) as HTMLInputElement;

              const file = input.files?.[0];
              if (!file) return;

              setUploading(true);
              setUploadMessage("");
              setUploadFailed(false);
              setAnswer("");
              setAnswerError("");

              try {
                const formData = new FormData();
                formData.append("file", file);

                const response = await fetch("/api/documents", {
                  method: "POST",
                  body: formData,
                });

                const result = await response.json();

                if (!response.ok) {
                  throw new Error(result.error || "Upload failed.");
                }

                setDocumentText(result.content);
                setUploadMessage(
                  `Document ready: ${result.fileName} (${result.content.length} characters read)`
                );
              } catch (err) {
                setDocumentText("");
                setUploadFailed(true);
                setUploadMessage(
                  err instanceof Error ? err.message : "Something went wrong."
                );
              } finally {
                setUploading(false);
              }
            }}
            className="mt-4 rounded-lg bg-blue-600 px-5 py-3 font-medium text-white disabled:opacity-40"
          >
            {uploading ? "Uploading..." : "Upload Document"}
          </button>

          {uploadMessage && (
            <p
              className={`mt-3 text-sm whitespace-pre-wrap ${
                uploadFailed ? "text-red-400" : "text-green-400"
              }`}
            >
              {uploadMessage}
            </p>
          )}

          <textarea
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="Ask something about your documents..."
            className="w-full mt-6 h-32 bg-gray-900 border border-gray-700 rounded-lg p-4 outline-none focus:border-blue-500"
          />

          <button
            disabled={!question.trim() || asking}
            onClick={async () => {
              setAnswer("");
              setAnswerError("");

              if (!documentText.trim()) {
                setAnswerError("Please upload a document first.");
                return;
              }

              setAsking(true);

              try {
                const response = await fetch("/api/answer", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ question, documentText }),
                });

                const result = await response.json();

                if (!response.ok) {
                  throw new Error(result.error || "Failed to generate answer.");
                }

                setAnswer(result.answer);
              } catch (err) {
                setAnswerError(
                  err instanceof Error ? err.message : "Something went wrong."
                );
              } finally {
                setAsking(false);
              }
            }}
            className="mt-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 px-5 py-3 rounded-lg font-medium"
          >
            {asking ? "Thinking..." : "Ask question"}
          </button>

          {answerError && (
            <p className="mt-4 text-sm text-red-400">{answerError}</p>
          )}

          {answer && (
            <div className="mt-6 rounded-lg border border-gray-800 bg-gray-900 p-4">
              <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">
                Answer
              </p>
              <div className="text-gray-200 text-sm leading-relaxed [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-2">
                <ReactMarkdown>{answer}</ReactMarkdown>
              </div>
            </div>
          )}
        </div>

        <p className="text-gray-500 text-sm mt-6">
          Answers will be supported by document evidence.
        </p>
      </div>
    </main>
  );
}