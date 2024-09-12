const puppeteer = require('puppeteer');
const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');

(async () => {
  // Create 'data' directory if it does not exist
  const dataDir = path.join(__dirname, 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
  }

  // Launch Puppeteer browser
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  const maxPages = 123456789; // Set the maximum number of pages to scrape
  const allCompanies = []; // Array to store all companies' data

  for (let currentPage = 1; currentPage <= maxPages; currentPage++) {
    try {
      // Navigate to the Glints page
      await page.goto(`https://glints.com/id/companies?locations=%255B%257B%2522id%2522%253A%2522078b37b2-e791-4739-958e-c29192e5df3e%2522%252C%2522name%2522%253A%2522Jakarta%2520Selatan%252C%2520DKI%2520Jakarta%252C%2520Indonesia%2522%252C%2522type%2522%253A%2522locations%2522%257D%255D&page=${currentPage}`, { waitUntil: 'networkidle2' });

      // Scrape the company data
      const companies = await page.evaluate(() => {
        const companyElements = document.querySelectorAll('.CompaniesPagesc__CompanyCardGrid-sc-wb7i3-6 .stylessc__Anchor-sc-1edpj7p-0');
        return Array.from(companyElements).map(company => {
          const name = company.querySelector('.stylessc__CompanyName-sc-1edpj7p-3')?.innerText;
          const location = company.querySelector('.stylessc__LocationName-sc-1edpj7p-4')?.innerText;
          const logo = company.querySelector('.stylessc__CompanyLogo-sc-1edpj7p-7')?.src;
          const jobsLink = company.href;
          return { name, location, logo, jobsLink };
        });
      });

      // Append data from the current page to the allCompanies array
      allCompanies.push(...companies);

      // Create a new Excel workbook and worksheet for the current page
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet(`Page ${currentPage}`);

      // Add headers to the worksheet
      worksheet.columns = [
        { header: 'Name', key: 'name', width: 30 },
        { header: 'Location', key: 'location', width: 30 },
        { header: 'Logo', key: 'logo', width: 50 },
        { header: 'Jobs Link', key: 'jobsLink', width: 50 },
      ];

      // Add rows to the worksheet
      companies.forEach(company => {
        worksheet.addRow(company);
      });

      // Define file path for the current page
      const filePath = path.join(dataDir, `companies_page_${currentPage}.xlsx`);
      
      // Save the workbook to a file for the current page
      await workbook.xlsx.writeFile(filePath);
      console.log(`Data from page ${currentPage} saved to ${filePath}`);

      // Check if there is a next page
      const nextPageButton = await page.$('.CustomPaginationsc__Arrow-sc-ngkv7y-1.lhKfoG:not(.disabled)');
      if (!nextPageButton) {
        break; // No more pages to scrape
      }
    } catch (error) {
      console.error(`Error scraping page ${currentPage}:`, error);
    }
  }

  // Create a new Excel workbook to merge all data
  const finalWorkbook = new ExcelJS.Workbook();
  const finalWorksheet = finalWorkbook.addWorksheet('All Companies');

  // Add headers to the final worksheet
  finalWorksheet.columns = [
    { header: 'Name', key: 'name', width: 30 },
    { header: 'Location', key: 'location', width: 30 },
    { header: 'Logo', key: 'logo', width: 50 },
    { header: 'Jobs Link', key: 'jobsLink', width: 50 },
  ];

  // Add rows to the final worksheet
  allCompanies.forEach(company => {
    finalWorksheet.addRow(company);
  });

  // Save the final workbook to a file
  const finalFilePath = path.join(dataDir, 'companies_all.xlsx');
  await finalWorkbook.xlsx.writeFile(finalFilePath);
  console.log(`All data combined and saved to ${finalFilePath}`);

  // Close the browser
  await browser.close();
})();
