import { NextResponse } from "next/server";
import { parseAutofundsCsv } from "@/lib/feed/autofunds-parser";
import { fetchCsvViaSftp } from "@/lib/feed/sftp-client";

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
  }

  let csvText: string;

  const sftpHost = process.env.AUTOFUNDS_SFTP_HOST;
  if (sftpHost) {
    try {
      csvText = await fetchCsvViaSftp({
        host: sftpHost,
        port: process.env.AUTOFUNDS_SFTP_PORT
          ? parseInt(process.env.AUTOFUNDS_SFTP_PORT, 10)
          : undefined,
        username: process.env.AUTOFUNDS_SFTP_USER ?? "",
        password: process.env.AUTOFUNDS_SFTP_PASS ?? "",
        remotePath: process.env.AUTOFUNDS_SFTP_REMOTE_PATH ?? "/",
      });
    } catch (err) {
      return NextResponse.json(
        {
          message: `SFTP fetch failed: ${err instanceof Error ? err.message : String(err)}`,
        },
        { status: 502 }
      );
    }
  } else {
    const feedUrl = process.env.AUTOFUNDS_FEED_URL;
    if (!feedUrl) {
      return NextResponse.json(
        { message: "Neither AUTOFUNDS_SFTP_HOST nor AUTOFUNDS_FEED_URL is configured" },
        { status: 500 }
      );
    }
    try {
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
        {
          message: `Failed to fetch AutoFunds feed: ${err instanceof Error ? err.message : String(err)}`,
        },
        { status: 502 }
      );
    }
  }

  const vehicles = parseAutofundsCsv(csvText);

  if (vehicles.length === 0) {
    return NextResponse.json({ message: "No vehicles parsed from feed" }, { status: 422 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.speedwaymotorsnj.net";
  const ingestRes = await fetch(`${baseUrl}/api/inventory/ingest`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.INVENTORY_API_KEY ?? ""}`,
    },
    body: JSON.stringify({ vehicles }),
  });

  const result = await ingestRes.json();

  console.log(
    `[cron/sync-autofunds] parsed=${vehicles.length} inserted=${result.inserted} updated=${result.updated} deactivated=${result.deactivated} errors=${result.errors?.length ?? 0}`
  );

  return NextResponse.json({
    ok: ingestRes.ok,
    parsed: vehicles.length,
    ...result,
  });
}
