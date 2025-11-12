import * as cheerio from "npm:cheerio@1.0.0-rc.12";
import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { CreditError, deductCredits } from "../_shared/credit.ts";

const CAP_SOLVER_KEY = Deno.env.get("CAP_SOLVER_KEY");

async function resolveCaptcha(imageBase64: string) {
  const res = await fetch("https://api.capsolver.com/createTask", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      clientKey: CAP_SOLVER_KEY,
      task: {
        module: "common",
        type: "ImageToTextTask",
        body: imageBase64,
      },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("[ERROR] CapSolver:", text);
    throw new Error("Cannot resolve captcha");
  }

  const data = await res.json();
  if (!data?.solution?.text) throw new Error("No solution from CapSolver");
  return data.solution.text;
}

async function fetchWithCookies(
  url: string,
  opts: RequestInit = {},
  cookieJar: string[] = [],
): Promise<{ res: Response; cookieJar: string[] }> {
  const headers = new Headers(opts.headers);
  if (cookieJar.length > 0) {
    headers.set("Cookie", cookieJar.join("; "));
  }

  const res = await fetch(url, { ...opts, headers });

  const setCookie = res.headers.get("set-cookie");
  if (setCookie) {
    const cookieParts = setCookie.split(",");
    cookieParts.forEach((cookieStr) => {
      const cookie = cookieStr.split(";")[0];
      const [name] = cookie.split("=");
      // replace if exists
      cookieJar = cookieJar.filter((c) => !c.startsWith(`${name}=`));
      cookieJar.push(cookie);
    });
  }

  return { res, cookieJar };
}

async function fetchCaptchaAndSolve(cookieJar: string[]) {
  const { res: captchaRes, cookieJar: updatedCookieJar } = await fetchWithCookies(
    "https://tracuunnt.gdt.gov.vn/tcnnt/captcha.png?uid=",
    {
      headers: {
        "User-Agent": "Mozilla/5.0",
      },
    },
    cookieJar,
  );

  if (!captchaRes.ok) throw new Error("Cannot fetch captcha");

  const imageBuffer = new Uint8Array(await captchaRes.arrayBuffer());
  const imageBase64 = btoa(
    Array.from(imageBuffer)
      .map((b) => String.fromCharCode(b))
      .join(""),
  );

  const solvedCaptcha = await resolveCaptcha(imageBase64);
  console.log("[INFO] Captcha solved:", solvedCaptcha);
  return { solvedCaptcha, cookieJar: updatedCookieJar };
}

async function fetchTaxInfo(
  mst: string,
  type: "cn" | "dn",
  captcha: string,
  cookieJar: string[],
) {
  const body = new URLSearchParams({
    cm: "cm",
    mst,
    fullname: "",
    address: "",
    cmt: "",
    captcha,
  });

  let url = "";
  if (type === "cn") {
    url = `https://tracuunnt.gdt.gov.vn/tcnnt/mstcn.jsp?taxId=${mst}`;
  } else {
    url = `https://tracuunnt.gdt.gov.vn/tcnnt/mstdn.jsp?taxId=${mst}`;
  }

  const { res, cookieJar: updatedCookieJar } = await fetchWithCookies(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Referer: `https://tracuunnt.gdt.gov.vn/tcnnt/mstcn.jsp?taxId=${mst}`,
    },
    body,
  }, cookieJar);

  if (!res.ok) throw new Error("Cannot fetch tax info");
  return { html: await res.text(), cookieJar: updatedCookieJar };
}

function getCompanyDetail(html: string) {
  const $ = cheerio.load(html);
  const table = $(".ta_border");
  if (!table.length) return [];

  const headers: string[] = [];
  table
    .find("tr")
    .first()
    .find("th")
    .each((_, th) => {
      headers.push($(th).text().trim());
    });

  const results: any[] = [];
  table
    .find("tr")
    .slice(1)
    .each((_, row) => {
      const obj: Record<string, string> = {};
      $(row)
        .find("td")
        .each((i, td) => {
          const key = headers[i] || `col_${i}`;
          const value = $(td).text().trim().replace(/\s+/g, " ");
          obj[key] = value;
        });
      results.push(obj);
    });

  return results;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      },
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const { msts, type } = await req.json();
    if (!msts || !Array.isArray(msts) || msts.length === 0 || !type) {
      return new Response(JSON.stringify({ error: "Missing msts or type" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    await deductCredits(supabase, user.id, msts.length);

    if (type !== "cn" && type !== "dn") {
      return new Response(JSON.stringify({ error: "Invalid type" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const lookupPromises = msts.map(async (mst) => {
      let cookieJar: string[] = []; // Each lookup gets its own cookieJar
      try {
        const { solvedCaptcha: captcha, cookieJar: cookieJarAfterCaptcha } =
          await fetchCaptchaAndSolve(cookieJar);
        cookieJar = cookieJarAfterCaptcha;

        const { html, cookieJar: cookieJarAfterTaxInfo } = await fetchTaxInfo(
          mst,
          type,
          captcha,
          cookieJar,
        );
        // cookieJar = cookieJarAfterTaxInfo; // Not strictly needed as this promise is isolated

        const detail = getCompanyDetail(html);

        if (detail && detail.length > 0) {
          return detail; // Return the actual data
        } else {
          return [{ // Return a structured "not found" message
            MST: mst,
            "Tên người nộp thuế": "Không tìm thấy dữ liệu",
            "Địa chỉ trụ sở/địa chỉ kinh doanh": "",
            "Cơ quan thuế quản lý": "",
            "Trạng thái MST": "",
          }];
        }
      } catch (error: any) {
        console.error(`Error crawling MST ${mst}:`, error);
        return [{ // Return a structured error message
          MST: mst,
          "Tên người nộp thuế": "Lỗi",
          "Địa chỉ trụ sở/địa chỉ kinh doanh": error.message,
          "Cơ quan thuế quản lý": "",
          "Trạng thái MST": "",
        }];
      }
    });

    const results = await Promise.allSettled(lookupPromises);

    const allCrawlData: any[] = [];
    results.forEach((result) => {
      if (result.status === "fulfilled") {
        allCrawlData.push(...result.value);
      } else {
        // This case should ideally not be hit if individual promise catches errors
        // but it's good for robustness.
        console.error("Promise rejected:", result.reason);
        allCrawlData.push({
          MST: "N/A", // Or try to extract from result.reason if possible
          "Tên người nộp thuế": "Lỗi hệ thống",
          "Địa chỉ trụ sở/địa chỉ kinh doanh": result.reason?.message || "Unknown error",
          "Cơ quan thuế quản lý": "",
          "Trạng thái MST": "",
        });
      }
    });

    return new Response(JSON.stringify({ data: allCrawlData }), {
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (err) {
    console.error("[ERROR]", err);
    const isCreditError = err instanceof CreditError;
    return new Response(JSON.stringify({ error: err.message }), {
      status: isCreditError ? 402 : 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
