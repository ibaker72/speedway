import { NextResponse } from "next/server";
import { parseAutofundsCsvDetailed } from "@/lib/feed/autofunds-parser";
import { fetchCsvViaSftp } from "@/lib/feed/sftp-client";
import { importVehicles } from "@/lib/server/importVehicles";

export const runtime = "nodejs";

export async function GET(request: Request) {
  // Auth: Bearer token in header OR ?secret= query param
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = request.headers.get("authorization");
    const urlSecret = new URL(request.url).searchParams.get("secret");
    if (authHeader !== `Bearer ${cronSecret}` && urlSecret !== cronSecret) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
  }

  const fileName = process.env.SFTP_FILE_NAME ?? "daily_inventory.csv";
  const remoteDir = process.env.SFTP_REMOTE_DIR
    ?? process.env.AUTOFUNDS_SFTP_REMOTE_PATH
    ?? "/speedwaymotors/inventory";

  let csvText: string;

  const sftpHost = process.env.SFTP_HOST ?? process.env.AUTOFUNDS_SFTP_HOST;
  if (sftpHost) {
    const remotePath = remoteDir.replace(/\/$/, "") + "/" + fileName;
    console.log(`[sync-autofunds] connecting to SFTP ${sftpHost} → ${remotePath}`);
    try {
      csvText = await fetchCsvViaSftp({
        host: sftpHost,
        port: process.env.SFTP_PORT
          ? parseInt(process.env.SFTP_PORT, 10)
          : process.env.AUTOFUNDS_SFTP_PORT
          ? parseInt(process.env.AUTOFUNDS_SFTP_PORT, 10)
          : undefined,
        username: process.env.SFTP_USERNAME ?? process.env.AUTOFUNDS_SFTP_USER ?? "",
        password: process.env.SFTP_PASSWORD ?? process.env.AUTOFUNDS_SFTP_PASS,
        privateKey:
          process.env.SFTP_PRIVATE_KEY ?? process.env.AUTOFUNDS_SFTP_PRIVATE_KEY,
        passphrase:
          process.env.SFTP_PRIVATE_KEY_PASSPHRASE ??
          process.env.AUTOFUNDS_SFTP_PRIVATE_KEY_PASSPHRASE,
        remotePath,
      });
      console.log(`[sync-autofunds] SFTP download complete, ${csvText.length} bytes`);
    } catch (err) {
      console.error("[sync-autofunds] SFTP fetch failed:", err);
      return NextResponse.json(
        { message: `SFTP fetch failed: ${err instanceof Error ? err.message : String(err)}` },
        { status: 502 }
      );
    }
  } else {
    const feedUrl = process.env.AUTOFUNDS_FEED_URL;
    if (!feedUrl) {
      return NextResponse.json(
        { message: "Neither SFTP_HOST nor AUTOFUNDS_FEED_URL is configured" },
        { status: 500 }
      );
    }
    try {
      console.log(`[sync-autofunds] fetching HTTP feed: ${feedUrl}`);
      const feedRes = await fetch(feedUrl, { cache: "no-store" });
      if (!feedRes.ok) {
        return NextResponse.json(
          { message: `AutoFunds feed returned HTTP ${feedRes.status}` },
          { status: 502 }
        );
      }
      csvText = await feedRes.text();
    } catch (err) {
      return NextResponse.json(
        { message: `Failed to fetch AutoFunds feed: ${err instanceof Error ? err.message : String(err)}` },
        { status: 502 }
      );
    }
  }

  console.log("[sync-autofunds] parsing CSV...");
  const { vehicles, diagnostics } = parseAutofundsCsvDetailed(csvText);

  console.log(
    `[sync-autofunds] CSV diagnostics — csvRows=${diagnostics.csvRowCount} dataRows=${diagnostics.dataRowCount} ` +
      `parsed=${vehicles.length} headers=${diagnostics.headers.length} ` +
      `missingRequired=[${diagnostics.missingRequiredHeaders.join(",")}] ` +
      `unknown=[${diagnostics.unknownHeaders.join(",")}] ` +
      `skipReasons=${JSON.stringify(diagnostics.skipReasons)}`
  );

  if (vehicles.length === 0) {
    const reason =
      diagnostics.missingRequiredHeaders.length > 0
        ? `Missing required headers: ${diagnostics.missingRequiredHeaders.join(", ")}`
        : diagnostics.csvRowCount < 2
        ? "CSV had fewer than 2 rows (header + at least one data row required)"
        : "All data rows failed required-field validation";
    console.error(`[sync-autofunds] 0 vehicles parsed — ${reason}`);
    return NextResponse.json(
      {
        message: `No vehicles parsed from feed: ${reason}`,
        diagnostics: {
          csvRowCount: diagnostics.csvRowCount,
          dataRowCount: diagnostics.dataRowCount,
          headersDetected: diagnostics.headers,
          missingRequiredHeaders: diagnostics.missingRequiredHeaders,
          unknownHeaders: diagnostics.unknownHeaders,
          skipReasons: diagnostics.skipReasons,
        },
      },
      { status: 422 }
    );
  }

  console.log(`[sync-autofunds] parsed ${vehicles.length} vehicles, importing to Supabase...`);
  const summary = await importVehicles(vehicles);

  console.log(
    `[sync-autofunds] done — inserted=${summary.inserted} updated=${summary.updated} ` +
      `(upserted=${summary.upserted}) skipped=${summary.skipped} inactive=${summary.markedInactive} ` +
      `errors=${summary.errors.length}`
  );

  return NextResponse.json({
    ok: true,
    source: "autofunds",
    file: fileName,
    summary: {
      totalRows: summary.totalRows,
      inserted: summary.inserted,
      updated: summary.updated,
      upserted: summary.upserted,
      skipped: summary.skipped,
      markedInactive: summary.markedInactive,
    },
    diagnostics: {
      csvRowCount: diagnostics.csvRowCount,
      dataRowCount: diagnostics.dataRowCount,
      headersDetected: diagnostics.headers.length,
      missingRequiredHeaders: diagnostics.missingRequiredHeaders,
      unknownHeaders: diagnostics.unknownHeaders,
      skipReasons: diagnostics.skipReasons,
    },
    errors: summary.errors.length > 0 ? summary.errors : undefined,
  });
}
