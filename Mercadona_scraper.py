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

def scrape_product_details(url):
    options = Options()
    options.add_argument("--headless")
    options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.77 Safari/537.36")
    options.add_argument("--window-size=30720x18280")

    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=options)
    driver.get(url)

    WebDriverWait(driver, 10).until(EC.presence_of_all_elements_located((By.CSS_SELECTOR, "[data-testid='product-cell']")))
    time.sleep(2)
    product_elements = driver.find_elements(By.CSS_SELECTOR, "[data-testid='product-cell']")
    products = []

    for product_element in product_elements:
        product_info = {
            'image': product_element.find_element(By.CSS_SELECTOR, ".product-cell__image-wrapper img").get_attribute('src'),
            'name': product_element.find_element(By.CSS_SELECTOR, "[data-testid='product-cell-name']").text,
            
        }

        
        try:
            product_info['precio_anterior'] = product_element.find_element(By.CSS_SELECTOR, ".product-price__previous-unit-price").text
            product_info['precio_actual'] = product_element.find_element(By.CSS_SELECTOR, ".product-price__unit-price--discount").text
        except NoSuchElementException:
            product_info['precio_anterior'] = None
            product_info['precio_actual'] = product_element.find_element(By.CSS_SELECTOR, "[data-testid='product-price']").text

        products.append(product_info)

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
    


def generate_urls(categories, base_url="https://tienda.mercadona.es/categories/{category}"):
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

names = ["201"]#,"Huevos"]#,"Frutas","Verduras","Pan","Cereales","Hortalizas","Harina","Quesos","Legumbres","Pasta","Aceite"]

url_base = "https://tienda.mercadona.es/categories/{category}"
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
            


