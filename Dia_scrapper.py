from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import NoSuchElementException, TimeoutException
from webdriver_manager.chrome import ChromeDriverManager
from bs4 import BeautifulSoup
import time
import requests
import json
from multiprocessing import Process
import multiprocessing
import urllib.parse

def modify_url_image(url, new_width):
    parsed_url = urllib.parse.urlparse(url)
    query_params = urllib.parse.parse_qs(parsed_url.query)
    query_params['imwidth'] = [new_width]  
    new_query = urllib.parse.urlencode(query_params, doseq=True)
    new_url = parsed_url._replace(query=new_query)
    return urllib.parse.urlunparse(new_url)

def scrap_product_list(driver, products, scraped_product_names):
    driver.find_element(By.TAG_NAME, 'body').send_keys(Keys.PAGE_DOWN)
    driver.implicitly_wait(1)

    try:
        WebDriverWait(driver, 30).until(
            EC.presence_of_all_elements_located((By.XPATH, "//li[@data-test-id='search-product-card-list-item']"))
        )
    except TimeoutException:
        print("TimeoutException: No se pudieron cargar los elementos en el tiempo especificado.")
        return

    html = driver.page_source
    soup = BeautifulSoup(html, 'html.parser')
    product_containers = soup.find_all('li', {'data-test-id': 'search-product-card-list-item'})

    print(f'Products to be scrapped in this driver session: {len(product_containers)}')

    for container in product_containers:
        scrap_one_product(container, scraped_product_names, products)

def scrape_product_details(url):
    options = Options()
    options.add_argument("--headless")
    options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.77 Safari/537.36")
    options.add_argument("--window-size=1920x1080")
    options.add_argument("--disable-gpu")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")

    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=options)
    
    driver.get(url)
    try:
        # Aceptar cookies si hay un banner
        WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Aceptar')]"))
        ).click()
    except (TimeoutException, NoSuchElementException):
        pass  # Si no hay un banner de cookies, continuar

    scraped_product_names = set()
    products = []
    scrap_product_list(driver, products, scraped_product_names)
    driver.quit()
    print(f'Scrapped Total Items: {len(products)}')
    print(f'Scrapped: {json.dumps(products, indent=3)}')
    return products

def scrap_one_product(container, scraped_product_names, products):
    product = {}
    
    title_element = container.find('a', {'data-test-id': 'search-product-card-name'})
    if title_element:
        product['name'] = title_element.text.strip()

    image_element = container.find('img', {'data-test-id': 'search-product-card-image'})
    if image_element and 'src' in image_element.attrs:
        good_image = modify_url_image(image_element['src'], 500)
        if not good_image.startswith('http'):
            good_image = 'https://www.dia.es' + good_image
        if "iso_0_es.jpg" in good_image:
            print(f"Warning: default image detected for product '{product['name']}'. Skipping.")
            product['image_url'] = ''
        else:
            product['image_url'] = good_image
    else:
        product['image_url'] = ''
    
    price_per_unit_element = container.find('p', {'data-test-id': 'search-product-card-kilo-price'})
    if price_per_unit_element:
        product['price_per_unit'] = price_per_unit_element.text.strip()

    total_price_element = container.find('p', {'data-test-id': 'search-product-card-unit-price'})
    if total_price_element:
        product['total_price'] = total_price_element.text.strip()

    if product.get('name') and product['name'] not in scraped_product_names:
        products.append(product)
        scraped_product_names.add(product['name'])

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
        print(f"Warning: {json_file} contains invalid JSON. Overwriting with new data.")

    data.append(product)

    with open(json_file, 'w', encoding='utf-8') as file:
        json.dump(data, file, indent=4)

    print(f"Product '{product['name']}' saved to {json_file}")

def generate_urls(categories, base_url="https://www.dia.es/search?q={category}"):
    urls = [base_url.replace("{category}", str(category)) for category in categories]
    return urls

def scrap_product_by_category(url):
    products = None
    try:
        products = scrape_product_details(url)
    except Exception as e:
        print(f"Error al procesar la URL {url}: {e}")
        import traceback
        traceback.print_exc() 
    if products is not None:
        for product in products:
            save_product_to_json(product)
    else:
        print(f"Datos no válidos para la URL {url}, omitiendo...")         

procs = [] 
names = ["Aceitunas"]
url_base = "https://www.dia.es/search?q={category}"
generated_urls = generate_urls(names, url_base)
for url in generated_urls:
    proc = Process(target=scrap_product_by_category, args=(url,))
    procs.append(proc)

for proc in procs:
    print("Lanzando proceso")
    proc.start()

for proc in procs:
    proc.join()
