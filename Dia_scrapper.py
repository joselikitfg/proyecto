from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import NoSuchElementException

from bs4 import BeautifulSoup
import time
import requests
import json
from multiprocessing import Process
import multiprocessing
import urllib.parse

def scrap_alcampo_image(url):

    response = requests.get(url)

    soup = BeautifulSoup(response.content, 'html.parser')

    script = soup.find('script', {'type': 'application/ld+json'})


    if script:
        data = json.loads(script.string)
        if 'image' in data and data['image']:
            product_image_url = data['image'][0]
        else:
            product_image_url = None

    else:
        print('Datos del producto no encontrados.')
        return None,

    return product_image_url

def scrap_image(product):

    img_url = scrap_alcampo_image(product)
    return img_url

def modify_url_image(url, new_width):
    parsed_url = urllib.parse.urlparse(url)
    query_params = urllib.parse.parse_qs(parsed_url.query)
    query_params['imwidth'] = [new_width]  
    new_query = urllib.parse.urlencode(query_params, doseq=True)
    new_url = parsed_url._replace(query=new_query)
    return urllib.parse.urlunparse(new_url)

def scrape_product_details(url):
    options = Options()
    options.add_argument("--headless")
    options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.77 Safari/537.36")
    options.add_argument("--window-size=30720x18280")

    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=options)
    driver.get(url)
    time.sleep(1)
    product_elements = driver.find_elements(By.CSS_SELECTOR, "[data-test-id='search-product-card-list-item']")
    products = []

    for product_element in product_elements:
        try:
            image_url = product_element.find_element(By.CSS_SELECTOR, ".search-product-card__product-image").get_attribute('src')
            modified_image_url = modify_url_image(image_url, '300')
            name = product_element.find_element(By.CSS_SELECTOR, ".search-product-card__product-name").text
            try:
                precio_anterior = product_element.find_element(By.CSS_SELECTOR, ".product-special-offer__strikethrough-price").text
            except:
                precio_anterior = None  
            precio_actual = product_element.find_element(By.CSS_SELECTOR, ".search-product-card__active-price").text
            product_info = {'image': modified_image_url, 'name': name, 'precio_anterior': precio_anterior, 'precio_actual': precio_actual}
            products.append(product_info)
        except NoSuchElementException:
            print(f"Error procesando el producto {name}")
    print(len(products))
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

        print(f"Warning: {json_file} contains invalid JSON. Overwriting with new data.")


    data.append(product)


    with open(json_file, 'w', encoding='utf-8') as file:
        json.dump(data, file, indent=4)

    print(f"Product '{product['name']}' saved to {json_file}")
    


def generate_urls(categories, base_url="https://www.dia.es/search?q={category}"):
    """
    Genera una lista de URLs para las categorías dadas.
    :param categories: Lista de categorías (números al final de la URL).
    :return: Lista de URLs completas.
    """
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

names = ["Aceitunas"]#,"Frutas","Verduras","Pan","Cereales","Hortalizas","Harina","Quesos","Legumbres","Pasta","Aceite"]

url_base = "https://www.dia.es/search?q={category}"
generated_urls = generate_urls(names, url_base)
for url in generated_urls:
    #scrap_product_by_category(url)
    # print(url)
    proc = Process(target=scrap_product_by_category, args=(url,))
    procs.append(proc)


for proc in procs:
    print("Lanzando proceso")
    proc.start()

for proc in procs:
    proc.join()
            


