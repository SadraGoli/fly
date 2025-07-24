const puppeteer = require('puppeteer');
const fs = require('fs');

async function checkFlights(origin, destination, date) {
  const airlines = JSON.parse(fs.readFileSync('airlines.json', 'utf-8'));
  const results = [];

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  for (const item of airlines) {
    const url = item.url
      .replace('ORIGIN', origin)
      .replace('DEST', destination)
      .replace('DATE', date);

    try {
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/138.0.0.0 Safari/537.36');

      await page.goto(url, { waitUntil: 'networkidle2', timeout: 10000 });
        await new Promise(resolve => setTimeout(resolve, 5000));

      const found = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('button, a')).some(el => el.innerText.includes('انتخاب'));
      });

      if (found) {
        results.push({ airline: item.airline, url });
      }
    } catch (err) {
      console.log(`خطا در ${item.airline}: ${err.message}`);
    }
  }

  await browser.close();

  // HTML آماده برای نمایش
  if (results.length === 0) {
    return '<div class="alert alert-warning">هیچ پروازی یافت نشد.</div>';
  }

  let html = '<div class="alert alert-success">پروازهای موجود:</div><ul class="list-group">';
  results.forEach(r => {
    html += `<li class='list-group-item d-flex justify-content-between align-items-center'>
                <strong>${r.airline}</strong>
                <a href='${r.url}' target='_blank' class='btn btn-sm btn-outline-primary'>مشاهده پرواز</a>
            </li>`;
  });
  html += '</ul>';
  return html;
}

module.exports = { checkFlights };
