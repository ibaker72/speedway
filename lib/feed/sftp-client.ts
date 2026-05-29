import SftpClient from "ssh2-sftp-client";

interface SftpConfig {
  host: string;
  port?: number;
  username: string;
  password: string;
  // Either a direct file path or a directory (picks the newest .csv inside)
  remotePath: string;
}

export async function fetchCsvViaSftp(config: SftpConfig): Promise<string> {
  const sftp = new SftpClient();
  try {
    await sftp.connect({
      host: config.host,
      port: config.port ?? 22,
      username: config.username,
      password: config.password,
      readyTimeout: 20_000,
    });

    let filePath = config.remotePath;

    const stat = await sftp.stat(config.remotePath);
    if (stat.isDirectory) {
      const files = await sftp.list(config.remotePath);
      const csvFiles = files
        .filter((f) => f.type === "-" && f.name.toLowerCase().endsWith(".csv"))
        .sort((a, b) => b.modifyTime - a.modifyTime);

      if (csvFiles.length === 0) {
        throw new Error(`No CSV files found at SFTP path: ${config.remotePath}`);
      }
      const dir = config.remotePath.replace(/\/$/, "");
      filePath = `${dir}/${csvFiles[0].name}`;
      console.log(`[sftp] using newest file: ${filePath}`);
    }

    const data = await sftp.get(filePath);
    return Buffer.isBuffer(data) ? data.toString("utf-8") : String(data);
  } finally {
    await sftp.end().catch(() => {});
  }
}
