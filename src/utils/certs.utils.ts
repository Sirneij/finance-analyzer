import fs from "fs";
import { fileURLToPath } from "url";
import path from "path";
import { baseConfig } from "$config/base.config.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CERT_DIR = path.join(__dirname, "../..", "certs");
const isDev = process.env.NODE_ENV === "development";

interface CertificateResponse {
  key: string;
  cert: string;
}

const fetchProductionCerts = async (): Promise<
  CertificateResponse | undefined
> => {
  const certUrl = process.env.PERM_CERT_LINK;

  if (!certUrl) {
    baseConfig.logger.error("PERM_CERT_LINK environment variable is not set");
    return undefined;
  }

  try {
    const response = await fetch(certUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data as CertificateResponse;
  } catch (error) {
    baseConfig.logger.error("Error fetching production certificates:", error);
    return undefined;
  }
};

let cachedCerts: { key: Buffer; cert: Buffer } | undefined;

export const getCertificates = async () => {
  if (isDev) {
    try {
      return {
        key: fs.readFileSync(path.join(CERT_DIR, "server.key")),
        cert: fs.readFileSync(path.join(CERT_DIR, "server.crt")),
      };
    } catch (error) {
      baseConfig.logger.error("Error reading development certificates:", error);
      return undefined;
    }
  }

  if (cachedCerts) return cachedCerts;

  const certData = await fetchProductionCerts();
  if (!certData?.key || !certData?.cert) return undefined;

  cachedCerts = {
    key: Buffer.from(certData.key),
    cert: Buffer.from(certData.cert),
  };

  return cachedCerts;
};
