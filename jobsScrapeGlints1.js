const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

// URL target
const url = 'https://glints.com/id/opportunities/jobs/explore?keyword=programmer&country=ID&locationId=78d63064-78a1-4577-8516-036a6c5e903e&locationName=DKI+Jakarta&lowestLocationLevel=2';

// Function to fetch and parse job data
async function fetchJobData() {
  try {
    // Fetch HTML from the URL
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    // Array to hold job data
    const jobs = [];

    // Scrape job data
    $('.JobCardsc__JobcardContainer-sc-hmqj50-0').each((index, element) => {
      const jobTitle = $(element).find('.CompactOpportunityCardsc__JobTitle-sc-dkg8my-11').text().trim();
      const salary = $(element).find('.CompactOpportunityCardsc__SalaryWrapper-sc-dkg8my-31').text().trim();
      const company = $(element).find('.CompactOpportunityCardsc__CompanyDetailContainer-sc-dkg8my-16 a').text().trim();
      const location = $(element).find('.CardJobLocation__StyledTruncatedLocation-sc-1by41tq-0').text().trim();
      const jobLink = $(element).find('.CompactOpportunityCardsc__CardAnchorWrapper-sc-dkg8my-26').attr('href');
      
      // Check if jobLink exists and prepend the base URL
      const fullJobLink = jobLink ? `https://glints.com${jobLink}` : '';

      jobs.push({ jobTitle, salary, company, location, jobLink: fullJobLink });
    });

    // Create 'data' folder if it does not exist
    const dir = './data';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }

    // Write job data to a .txt file
    const filePath = path.join(dir, 'jobs1.txt');
    fs.writeFileSync(filePath, JSON.stringify(jobs, null, 2), 'utf-8');

    console.log('Job data saved to', filePath);
  } catch (error) {
    console.error('Error fetching job data:', error);
  }
}

// Execute the function
fetchJobData();