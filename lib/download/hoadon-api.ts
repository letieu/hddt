import { endOfDay, endOfMonth, startOfDay } from "../utils";
import { RateLimiter } from "./rate-limiter";
import * as Sentry from "@sentry/nextjs";

const rateLimiter = new RateLimiter(
  1, // 3 requests per second
  10, // 5 retries (same as your original)
  // 3, // 3 requests per second
  // 1, // 5 retries (same as your original)
  30_000, // 14 second timeout (same as your original)
);

function fetchWithTimeoutAndRetry(url: string, options = {}) {
  return rateLimiter.execute(() => fetch(url, options));
}

export type ListInvoiceItem = any;

export type SearchResponse = {
  datas: ListInvoiceItem[];
  total: number;
  state: string | undefined; // cursor
};

export type InvoiceDetailQuery = {
  nbmst: string;
  khhdon: string;
  shdon: string;
  khmshdon: string;
};

// sco-query: 'Hóa đơn có mã khởi tạo từ máy tính tiền'
// query: 'Hóa đơn điện tử'
export type InvoiceQueryType = "sco-query" | "query";

// sold: 'Tra cứu hóa đơn điện tử bán ra'
// purchase: 'Tra cứu hóa đơn điện tử mua vào'
export type InvoiceType = "sold" | "purchase";

export type FetchInvoiceOptions = Partial<{ nmmst: string; nbmst: string }>;

export async function fetchListInvoices(
  jwt: string,
  queryType: InvoiceQueryType,
  invoiceType: InvoiceType,
  startDate: number,
  endDate: number,
  options: FetchInvoiceOptions,
) {
  let invoices: ListInvoiceItem[] = [];

  let nextState: string | undefined;

  while (true) {
    const res = await fetchListInvoicesPage(
      jwt,
      queryType,
      invoiceType,
      startDate,
      endDate,
      options,
      nextState,
    );

    invoices = invoices.concat(res.datas);
    nextState = res.state;

    const isLastPage = !nextState;
    if (isLastPage) {
      break;
    }
  }

  return invoices;
}

async function fetchListInvoicesPage(
  jwt: string,
  queryType: InvoiceQueryType,
  invoiceType: InvoiceType,
  startDate: number,
  endDate: number,
  options: FetchInvoiceOptions,
  state?: string,
): Promise<SearchResponse> {
  const formattedStartDate = formatDate(new Date(startDate));
  const formattedEndDate = formatDate(new Date(endDate));

  let queryString = `sort=tdlap:desc,khmshdon:asc,shdon:desc&size=15&search=tdlap=ge=${formattedStartDate};tdlap=le=${formattedEndDate}`;

  if (options?.nbmst) {
    queryString += `;nbmst==${options.nbmst}`;
  }
  if (options?.nmmst) {
    queryString += `;nmmst==${options.nmmst}`;
  }

  if (state) {
    queryString = `${queryString}&state=${state}`;
  }

  const res = await fetchWithTimeoutAndRetry(
    `https://hoadondientu.gdt.gov.vn:30000/${queryType}/invoices/${invoiceType}?${queryString}`,
    {
      method: "GET",
      headers: {
        accept: "application/json, text/plain, */*",
        authorization: `Bearer ${jwt}`,
      },
    },
  );

  if (!res.ok) {
    throw new Error(res.status + " Lỗi khi tải hóa đơn");
  }

  const data = await res.json();
  return data;
}

export async function downloadXML(
  jwt: string,
  queryType: InvoiceQueryType,
  query: InvoiceDetailQuery,
) {
  let queryString = `nbmst=${query.nbmst}&khhdon=${query.khhdon}&shdon=${query.shdon}&khmshdon=${query.khmshdon}`;

  const res = await fetchWithTimeoutAndRetry(
    `https://hoadondientu.gdt.gov.vn:30000/${queryType}/invoices/export-xml?${queryString}`,
    {
      method: "GET",
      headers: {
        accept: "application/json, text/plain, */*",
        authorization: `Bearer ${jwt}`,
      },
    },
  );

  if (!res.ok) {
    throw new Error(res.status + " Lỗi khi tải hóa đơn");
  }

  const blob = await res.blob();
  return blob;
}

export async function fetchInvoiceDetail(
  jwt: string,
  queryType: InvoiceQueryType,
  query: InvoiceDetailQuery,
) {
  let queryString = `nbmst=${query.nbmst}&khhdon=${query.khhdon}&shdon=${query.shdon}&khmshdon=${query.khmshdon}`;

  const res = await fetchWithTimeoutAndRetry(
    `https://hoadondientu.gdt.gov.vn:30000/${queryType}/invoices/detail?${queryString}`,
    {
      method: "GET",
      headers: {
        accept: "application/json, text/plain, */*",
        authorization: `Bearer ${jwt}`,
      },
    },
  );

  if (!res.ok) {
    throw new Error(res.status + " Lỗi khi tải hóa đơn");
  }

  const data = await res.json();
  return data;
}

export async function getAuthToken(
  username: string,
  password: string,
  ckey: string,
  cvalue: string,
): Promise<{ token: string; error: string }> {
  const res = await fetch(
    `https://hoadondientu.gdt.gov.vn:30000/security-taxpayer/authenticate`,
    {
      method: "POST",
      headers: {
        accept: "application/json, text/plain, */*",
        "content-type": "application/json;charset=UTF-8",
      },
      body: JSON.stringify({
        username: username,
        password: password,
        cvalue: cvalue,
        ckey: ckey,
      }),
    },
  );

  if (!res.ok) {
    const response = await res.json();
    return { token: "", error: response.message };
  }

  const { token } = await res.json();
  return { token, error: "" };
}

export async function fetchProfile(jwt: string) {
  const res = await fetch(
    `https:///hoadondientu.gdt.gov.vn:30000/security-taxpayer/profile`,
    {
      method: "GET",
      headers: {
        accept: "application/json, text/plain, */*",
        authorization: `Bearer ${jwt}`,
        "content-type": "application/json;charset=UTF-8",
      },
    },
  );

  if (!res.ok) {
    throw new Error(res.status + " Lỗi khi tải hóa đơn");
  }

  const data = await res.json();
  return data;
}

export async function getCaptcha(): Promise<{ key: string; content: string }> {
  const res = await fetch(`https://hoadondientu.gdt.gov.vn:30000/captcha`, {
    method: "GET",
    headers: {
      accept: "application/json, text/plain, */*",
    },
  });

  if (!res.ok) {
    throw new Error(res.status + " Lỗi khi tải hóa đơn");
  }

  const data = await res.json();
  return data;
}

function formatDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${day}/${month}/${year}T${hours}:${minutes}:${seconds}`;
}

export async function fetchAllInvoices(
  jwt: string,
  startDate: Date,
  endDate: Date,
  filter: FetchInvoiceOptions,
  queryType: InvoiceQueryType,
  invoiceType: InvoiceType,
) {
  const start = startOfDay(startDate);
  const end = endOfDay(endDate);

  let currentStart = start;
  let currentEnd = Math.min(end, endOfMonth(startDate));

  const allInvoices: any[] = [];

  while (currentStart <= end) {
    const chunkStart = currentStart;
    const chunkEnd = currentEnd;

    // ✅ Fetch invoice list for this month chunk
    const invoices = await fetchListInvoices(
      jwt,
      queryType,
      invoiceType,
      chunkStart,
      chunkEnd,
      filter,
    );

    allInvoices.push(...invoices);

    // ✅ Move to next month chunk
    currentStart = currentEnd + 1;
    currentEnd = Math.min(end, endOfMonth(new Date(currentStart)));
  }

  return allInvoices;
}
