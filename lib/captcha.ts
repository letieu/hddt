
const CAP_SOLVER_KEY = process.env.CAP_SOLVER_KEY;

export async function resolveCaptcha(imageBase64: string) {
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
