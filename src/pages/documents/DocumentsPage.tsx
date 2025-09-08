import React, { useState, useRef } from "react";
import { FileText, Upload, Download, Trash2, Share2, FileSignature } from "lucide-react";
import { Card, CardHeader, CardBody } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import SignatureCanvas from "react-signature-canvas";


const documents = [
  { id: 1, name: "Pitch Deck 2024.pdf", type: "PDF", size: "2.4 MB", lastModified: "2024-02-15", shared: true, status: "Signed" },
  { id: 2, name: "Financial Projections.xlsx", type: "Spreadsheet", size: "1.8 MB", lastModified: "2024-02-10", shared: false, status: "Draft" },
  { id: 3, name: "Business Plan.docx", type: "Document", size: "3.2 MB", lastModified: "2024-02-05", shared: true, status: "In Review" },
];

const getStatusVariant = (status: string): "primary" | "secondary" | "success" => {
  switch (status) {
    case "Draft":
      return "secondary"; // gray
    case "In Review":
      return "primary"; // blue
    case "Signed":
      return "success"; // green
    default:
      return "secondary";
  }
};

export const DocumentsPage: React.FC = () => {
  const [documentsList, setDocumentsList] = useState(documents); // stateful
  const [showChamber, setShowChamber] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [status, setStatus] = useState("Draft");
  const sigPad = useRef<SignatureCanvas>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setUploadedFile(e.target.files[0]);
    }
  };

  const clearSignature = () => {
    sigPad.current?.clear();
  };

  const handleSaveDocument = () => {
    if (uploadedFile) {
      const newDoc = {
        id: documentsList.length + 1,
        name: uploadedFile.name,
        type: uploadedFile.name.endsWith(".pdf")
          ? "PDF"
          : uploadedFile.name.endsWith(".doc") || uploadedFile.name.endsWith(".docx")
          ? "Document"
          : uploadedFile.name.endsWith(".xlsx") || uploadedFile.name.endsWith(".xls")
          ? "Spreadsheet"
          : "File",
        size: `${(uploadedFile.size / (1024 * 1024)).toFixed(1)} MB`,
        lastModified: new Date().toISOString().split("T")[0],
        shared: false,
        status: status,
      };

      setDocumentsList([...documentsList, newDoc]);
      setUploadedFile(null);
      setShowChamber(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top bar */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
          <p className="text-gray-600">Manage your startup's important files</p>
        </div>
        <div className="flex gap-2">
          <Button leftIcon={<Upload size={18} />}>Upload Document</Button>
          <Button
            leftIcon={<FileSignature size={18} />}
            variant="outline"
            onClick={() => setShowChamber(true)}
          >
            Document Chamber
          </Button>
        </div>
      </div>

      {/* Chamber Modal */}
      {showChamber && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl p-6 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Document Chamber</h2>
              <button
                onClick={() => setShowChamber(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            {/* Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Upload Document
              </label>
              <input
                type="file"
                accept=".pdf,.doc,.docx,.xls,.xlsx"
                onChange={handleFileUpload}
                className="mt-2"
              />
              {uploadedFile && (
                <p className="mt-2 text-sm text-gray-600">
                  Uploaded: <strong>{uploadedFile.name}</strong>
                </p>
              )}
            </div>

            {/* Signature */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                E-Signature
              </label>
              <SignatureCanvas
                ref={sigPad}
                penColor="black"
                canvasProps={{
                  className: "border rounded-md w-full h-32 bg-gray-50",
                }}
              />
              <Button
                size="sm"
                variant="outline"
                className="mt-2"
                onClick={clearSignature}
              >
                Clear Signature
              </Button>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <div className="flex gap-3">
                {["Draft", "In Review", "Signed"].map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatus(s)}
                    className={`px-3 py-1 rounded-full text-sm ${
                      status === s
                        ? "bg-primary-600 text-white"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Save */}
            <div className="flex justify-end">
              <Button onClick={handleSaveDocument}>Save</Button>
            </div>
          </div>
        </div>
      )}

      {/* Documents List */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Card>
            <CardHeader className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">All Documents</h2>
            </CardHeader>
            <CardBody>
              <div className="space-y-2">
                {documentsList.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center p-4 hover:bg-gray-50 rounded-lg transition"
                  >
                    <div className="p-2 bg-primary-50 rounded-lg mr-4">
                      <FileText size={24} className="text-primary-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {doc.name}
                        </h3>
                        {doc.shared && (
                          <Badge variant="secondary" size="sm">
                            Shared
                          </Badge>
                        )}
                        <Badge variant="secondary" size="sm">{doc.status}</Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                        <span>{doc.type}</span>
                        <span>{doc.size}</span>
                        <span>Modified {doc.lastModified}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};
