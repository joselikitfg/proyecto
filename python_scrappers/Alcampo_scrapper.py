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
import sys

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
    start_time = time.time()
    
    options = Options()
    options.add_argument("--headless")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--disable-gpu")
    options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.77 Safari/537.36")
    options.add_argument("window-size=30720x18280")

    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=options)
    driver.get(url)

    time.sleep(2)

    products = []
    scraped_product_names = set()
    prev_len = 0  # Almacenar la longitud de 'products' para comparar después de cada desplazamiento

    while True:
        driver.find_element(By.TAG_NAME, 'body').send_keys(Keys.PAGE_DOWN)
        time.sleep(2)  # Espera para el lazy loading

        WebDriverWait(driver, 20).until(
            EC.presence_of_all_elements_located((By.XPATH, "//img[@data-test='lazy-load-image']"))
        )

        html = driver.page_source
        soup = BeautifulSoup(html, 'html.parser')

        product_containers = soup.find_all('div', {'class': 'components__ProductCardContainer-sc-filq44-2'})

        for container in product_containers:
            product = {}

            title_element = container.find('h3', {'data-test': 'fop-title'})
            if title_element:
                product['name'] = title_element.text

            image_element = container.find('img', {'data-test': 'lazy-load-image'})
            if image_element and 'src' in image_element.attrs:
                product['image_url'] = image_element['src']
            else:
                product_link_element = container.find('a', {'data-test': 'fop-product-link'})
                if product_link_element and 'href' in product_link_element.attrs:
                    full_product_url = "https://www.compraonline.alcampo.es" + product_link_element['href']
                    product['image_url'] = scrap_image(full_product_url)  # Asumiendo que esta función está definida

            price_per_unit_element = container.find('span', {'data-test': 'fop-price-per-unit'})
            if price_per_unit_element:
                product['price_per_unit'] = price_per_unit_element.text

            total_price_element = container.find('span', {'data-test': 'fop-price'})
            if total_price_element:
                product['total_price'] = total_price_element.text

            if product.get('name') and product['name'] not in scraped_product_names:
                products.append(product)
                scraped_product_names.add(product['name'])

        # Si la longitud de 'products' no cambia después de un desplazamiento, se asume que se ha llegado al final
        if prev_len == len(products):
            break
        else:
            prev_len = len(products)

    driver.quit()

    
    end_time = time.time()  # Finalizar el contador de tiempo
    print(f"Tiempo total de scraping: {end_time - start_time} segundos.")
    print(f"Tiempo total de scraping: {end_time - start_time} segundos.", file=sys.stdout)
    sys.stdout.flush() 
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
    


def generate_urls(names, base_url):
    """
    Genera una lista de URLs reemplazando el placeholder de la URL base con cada elemento de la lista
    :param names: Lista de nombres 
    :param base_url: La URL base con {name} listo para ser modificado
    :return: Lista de URLs con los elementos insertados
    """

    urls = [base_url.replace("{name}", name) for name in names]
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


    # if len(sys.argv) < 2:
    #     print("Uso: python script.py termino1 termino2 termino3 ...")
    #     sys.exit(1)
    

    # names = sys.argv[1:]
    # url_base = 'https://www.compraonline.alcampo.es/search?q={name}'
    # generated_urls = generate_urls(names, url_base)
    
    # procs = []
    # for url in generated_urls:
    #     proc = Process(target=scrap_product_by_category, args=(url,))
    #     procs.append(proc)
    #     print("Lanzando proceso para URL:", url)

    # for proc in procs:
    #     proc.start()

    # for proc in procs:
    #     proc.join()