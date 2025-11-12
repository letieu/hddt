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

// 🔹 Simple cookie jar (manual)
let cookies: string[] = [];

async function fetchWithCookies(url: string, opts: RequestInit = {}) {
  const headers = new Headers(opts.headers);
  if (cookies.length > 0) {
    headers.set("Cookie", cookies.join("; "));
  }

  const res = await fetch(url, { ...opts, headers });

  const setCookie = res.headers.get("set-cookie");
  if (setCookie) {
    const cookieParts = setCookie.split(",");
    cookieParts.forEach((cookieStr) => {
      const cookie = cookieStr.split(";")[0];
      const [name] = cookie.split("=");
      // replace if exists
      cookies = cookies.filter((c) => !c.startsWith(`${name}=`));
      cookies.push(cookie);
    });
  }

  return res;
}

async function fetchCaptchaAndSolve() {
  const captchaRes = await fetchWithCookies(
    "https://tracuunnt.gdt.gov.vn/tcnnt/captcha.png?uid=",
    {
      headers: {
        "User-Agent": "Mozilla/5.0",
      },
    },
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
  return solvedCaptcha;
}

async function fetchTaxInfo(mst: string, type: "cn" | "dn", captcha: string) {
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

  const res = await fetchWithCookies(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Referer: `https://tracuunnt.gdt.gov.vn/tcnnt/mstcn.jsp?taxId=${mst}`,
    },
    body,
  });

  if (!res.ok) throw new Error("Cannot fetch tax info");
  return await res.text();
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

// 🚀 Supabase Edge Function Entry
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      },
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    await deductCredits(supabaseAdmin, user.id, 1);

    // type: cn - Cá nhân, dn - Doanh nghiệp
    const { mst, type } = await req.json();
    if (!mst || !type) {
      return new Response(JSON.stringify({ error: "Missing mst or type" }), {
        status: 400,
      });
    }

    if (type !== "cn" && type !== "dn") {
      return new Response(JSON.stringify({ error: "Invalid type" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const captcha = await fetchCaptchaAndSolve();
    const html = await fetchTaxInfo(mst, type, captcha);
    const detail = getCompanyDetail(html);

    return new Response(JSON.stringify({ data: detail }), {
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
