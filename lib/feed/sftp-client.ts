import SftpClient from "ssh2-sftp-client";

interface SftpConfig {
  host: string;
  port?: number;
  username: string;
  password?: string;
  privateKey?: string;
  passphrase?: string;
  // Either a direct file path or a directory (picks the newest .csv inside)
  remotePath: string;
}

export async function fetchCsvViaSftp(config: SftpConfig): Promise<string> {
  const sftp = new SftpClient();
  try {
    const hasPassword = Boolean(config.password?.trim());
    const hasPrivateKey = Boolean(config.privateKey?.trim());
    if (!hasPassword && !hasPrivateKey) {
      throw new Error(
        "SFTP auth is not configured. Provide SFTP_PASSWORD (or AUTOFUNDS_SFTP_PASS) or SFTP_PRIVATE_KEY."
      );
    }

    const connectOptions: Record<string, unknown> = {
      host: config.host,
      port: config.port ?? 22,
      username: config.username,
      readyTimeout: 20_000,
    };

    if (hasPrivateKey) {
      // Support keys stored in env vars where newlines are escaped.
      connectOptions.privateKey = config.privateKey!.replace(/\\n/g, "\n");
      if (config.passphrase) {
        connectOptions.passphrase = config.passphrase;
      }
    }

    if (hasPassword) {
      connectOptions.password = config.password;
      connectOptions.tryKeyboard = true;
    }

    await sftp.connect({
      ...connectOptions,
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
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (/all configured authentication methods failed/i.test(message)) {
      throw new Error(
        "SFTP authentication failed. Verify SFTP_USERNAME and password/key in .env.local, or confirm with the SFTP provider which auth method is enabled for this account."
      );
    }
    throw err;
  } finally {
    await sftp.end().catch(() => {});
  }
}
