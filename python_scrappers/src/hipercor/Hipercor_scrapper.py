from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options

from bs4 import BeautifulSoup
import time
import requests
import json
from multiprocessing import Process
import multiprocessing
from urllib.parse import quote


def generate_url(base_url, term, page=None):
    term_encoded = quote(term.lower())
    if page and page > 1:
        page_url = f'{base_url}{page}/?term={term_encoded}'
    else:
        page_url = f'{base_url}'

    return page_url


def scroll_page(driver):
    scroll_pause_time = 1
    scroll_increment = 500
    total_height = driver.execute_script('return document.body.scrollHeight')
    for i in range(0, total_height, scroll_increment):
        driver.execute_script(f'window.scrollBy(0, {scroll_increment});')
        time.sleep(scroll_pause_time)


def scrape_hipercor_product_details(url, search_term, url_base):
    options = Options()
    options.add_argument('--headless')
    options.add_argument(
        'user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.77 Safari/537.36'
    )
    options.add_argument('--window-size=1920,1080')

    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=options)
    initial_url = generate_url(url, search_term)
    driver.get(initial_url)
    pagination_element = driver.find_element(By.CSS_SELECTOR, '.pagination-controls .c6-xs')
    total_pages_text = pagination_element.text
    total_pages = int(total_pages_text.split(' ')[-1])
    scroll_page(driver)
    time.sleep(2)

    products = []

    for page in range(1, total_pages + 1):
        page_url = generate_url(url_base, search_term, page)
        driver.get(page_url)
        scroll_page(driver)
        time.sleep(2)

        html = driver.page_source
        soup = BeautifulSoup(html, 'html.parser')

        product_containers = soup.find_all(
            'div',
            class_='grid-item product_tile _retro _hipercor dataholder js-product',
        )

        for container in product_containers:
            product = {}

            name_element = container.find('h3', class_='product_tile-description')
            if name_element:
                product['name'] = name_element.text.strip()

            image_element = container.find('img')
            if image_element:
                img_url = image_element['src']

                if not img_url.startswith('https'):
                    img_url = 'https:' + img_url
                product['image_url'] = img_url

            price_element = container.find('div', class_='prices-price _offer')
            if not price_element:
                price_element = container.find('div', class_='prices-price _current')
            if price_element:
                product['price'] = price_element.text.strip()
            else:
                product['price'] = 'Precio no disponible'

            price_per_unit_element = container.find('div', class_='prices-price _pum')
            product['price_per_unit'] = (
                price_per_unit_element.text.strip() if price_per_unit_element else 'Información no disponible'
            )

            products.append(product)

    driver.quit()
    return products


def save_product_to_json(product, json_file='products2.json'):
    data = []
    try:
        with open(json_file, 'r', encoding='utf-8') as file:
            file_contents = file.read()
            if file_contents:
                data = json.loads(file_contents)
    except FileNotFoundError:
        pass
    except json.JSONDecodeError:
        print(f'Warning: {json_file} contains invalid JSON. Overwriting with new data.')

    data.append(product)

    with open(json_file, 'w', encoding='utf-8') as file:
        json.dump(data, file, indent=4)

    print(f"Product '{product['name']}' saved to {json_file}")


def generate_urls(base_url, search_terms):
    return [f'{base_url}?term={term}' for term in search_terms]


def scrap_product_by_category(url, term, url_base):
    products = scrape_hipercor_product_details(url, term, url_base)
    for product in products:
        save_product_to_json(product, json_file=f'products_{term}.json')


def save_product_to_json(product, json_file='products.json'):
    try:
        with open(json_file, 'r+', encoding='utf-8') as file:
            data = json.load(file)
            data.append(product)
            file.seek(0)
            json.dump(data, file, indent=4, ensure_ascii=False)
    except FileNotFoundError:
        with open(json_file, 'w', encoding='utf-8') as file:
            json.dump([product], file, indent=4, ensure_ascii=False)


if __name__ == '__main__':
    procs = []

    names = [
        'Agua',
        'Huevos',
    ]  # ,"Frutas","Verduras","Pan","Cereales","Hortalizas","Harina","Quesos","Legumbres","Pasta","Aceite"]

    url_base = 'https://www.hipercor.es/supermercado/buscar/'
    generated_urls = generate_urls(url_base, names)
    for i, url in enumerate(generated_urls):
        proc = Process(target=scrap_product_by_category, args=(url, names[i], url_base))
        procs.append(proc)

    for proc in procs:
        print('Lanzando proceso')
        proc.start()

    for proc in procs:
        proc.join()
