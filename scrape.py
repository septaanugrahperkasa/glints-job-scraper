from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
import pandas as pd

# Setup WebDriver
chrome_options = Options()
chrome_options.add_argument("--headless")  # Operasikan di background
service = Service('/path/to/chromedriver')  # Ganti dengan path ke chromedriver
driver = webdriver.Chrome(service=service, options=chrome_options)

# Akses halaman
driver.get('https://glints.com/id/opportunities/jobs/explore?keyword=programmer&country=ID&locationId=78d63064-78a1-4577-8516-036a6c5e903e&locationName=DKI+Jakarta&lowestLocationLevel=2&page=2')

# Ambil elemen job card
job_cards = driver.find_elements(By.CSS_SELECTOR, 'div.CompactOpportunityCardsc__CompactJobCardWrapper-sc-dkg8my-5')

# Ekstrak data
data = []
for card in job_cards:
    title = card.find_element(By.CSS_SELECTOR, 'h3.CompactOpportunityCardsc__JobTitle-sc-dkg8my-11').text
    salary = card.find_element(By.CSS_SELECTOR, 'span.CompactOpportunityCardsc__SalaryWrapper-sc-dkg8my-31').text
    location = card.find_element(By.CSS_SELECTOR, 'span.CardJobLocation__StyledTruncatedLocation-sc-1by41tq-0').text
    data.append({
        'Title': title,
        'Salary': salary,
        'Location': location
    })

# Simpan ke file Excel
df = pd.DataFrame(data)
df.to_excel('jobs_data.xlsx', index=False)

driver.quit()
