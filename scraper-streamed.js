const puppeteer = require("puppeteer");
const fs = require("fs");

async function checkFlightsStreamed(origin, destination, date, send) {
  const airlines = JSON.parse(fs.readFileSync("airlines.json", "utf-8"));

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  for (const item of airlines) {
    const url = item.url
      .replace("ORIGIN", origin)
      .replace("DEST", destination)
      .replace("DATE", date);

    try {
      await page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/138.0.0.0 Safari/537.36"
      );
      await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });
      await new Promise((res) => setTimeout(res, 4000));

      const found = await page.evaluate(() => {
        return Array.from(document.querySelectorAll("button,a")).some((el) =>
          el.innerText.includes("انتخاب")
        );
      });

      if (found) {
        const html = `
<div class="card border-success mb-3">
  <div class="card-header bg-success text-white d-flex justify-content-between align-items-center">
    <span><i class="bi bi-airplane-engines"></i> ${item.airline}</span>
    <a href="${url}" target="_blank" class="btn btn-warning fw-bold btn-sm">مشاهده پرواز</a>
  </div>
</div>
`;

        send(html.replace(/\n/g, "").replace(/\s\s+/g, " "));
      } else {
        const html = `<div class="alert alert-secondary">${item.airline}: هیچ پروازی یافت نشد.</div>`;
        send(html);
      }
    } catch (err) {
      const html = `<div class="alert alert-danger">${item.airline}: خطا در بررسی – ${err.message}</div>`;
      send(html);
    }
  }

  send("__END__"); // علامت پایان بررسی
  await browser.close();
}

module.exports = { checkFlightsStreamed };
