const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const url = 'https://glints.com/id/opportunities/jobs/recommended';
const outputDir = path.join(__dirname, 'data');
const outputFile = path.join(outputDir, 'jobs.txt');

// Fungsi untuk membuat folder jika belum ada
function ensureDirectoryExistence(filePath) {
    const dirname = path.dirname(filePath);
    if (!fs.existsSync(dirname)) {
        fs.mkdirSync(dirname, { recursive: true });
    }
}

// Fungsi utama untuk melakukan scraping
async function scrapeJobs() {
    try {
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);

        // Array untuk menyimpan data job
        const jobs = [];

        $('.CompactOpportunityCardsc__CompactJobCard-sc-dkg8my-4').each((index, element) => {
            const jobTitle = $(element).find('.CompactOpportunityCardsc__JobTitle-sc-dkg8my-11').text().trim();
            const salary = $(element).find('.CompactOpportunityCardsc__SalaryWrapper-sc-dkg8my-31').text().trim();
            const company = $(element).find('.CompactOpportunityCardsc__CompanyLink-sc-dkg8my-12').text().trim();
            const location = $(element).find('.CardJobLocation__StyledTruncatedLocation-sc-1by41tq-0').text().trim();
            const updatedAt = $(element).find('.CompactOpportunityCardsc__UpdatedAtMessage-sc-dkg8my-24').text().trim();

            jobs.push({
                jobTitle,
                salary,
                company,
                location,
                updatedAt
            });
        });

        // Buat folder data jika belum ada
        ensureDirectoryExistence(outputFile);

        // Simpan hasil scraping ke file
        fs.writeFileSync(outputFile, JSON.stringify(jobs, null, 2), 'utf-8');
        console.log(`Data jobs telah disimpan di ${outputFile}`);
    } catch (error) {
        console.error('Terjadi kesalahan saat melakukan scraping:', error.message);
    }
}

// Jalankan fungsi scrapeJobs
scrapeJobs();
