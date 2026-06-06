import { QRCodeCanvas } from "qrcode.react";

const GenerateQR = () => {
  const url = "http://localhost:5173/report?zone=WARD12";

  return (
    <div className="flex flex-col items-center justify-center min-h-screen space-y-6">
      <h1 className="text-2xl font-bold">Public Eye QR Code</h1>
      <QRCodeCanvas value={url} size={256} />
      <p className="text-sm text-muted-foreground">{url}</p>
    </div>
  );
};

export default GenerateQR;
