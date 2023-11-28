from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from bs4 import BeautifulSoup
import time
import requests
import json

def scrap_alcampo_image(url):
    # Realiza la solicitud y obtén el contenido de la página
    response = requests.get(url)

    soup = BeautifulSoup(response.content, 'html.parser')
    # Encuentra la etiqueta script con los datos estructurados de producto
    script = soup.find('script', {'type': 'application/ld+json'})

    # Si encontramos la etiqueta script, cargamos el JSON
    if script:
        data = json.loads(script.string)
        product_image_url = data.get('image', [])[0]  # Tomamos la primera imagen

    else:
        print('Datos del producto no encontrados.')
        return None,

    return product_image_url

def scrap_image(product):

    img_url = scrap_alcampo_image(product)
    return img_url

def scrape_product_details(url):
    # Inicia el navegador
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service)
    driver.get(url)
    time.sleep(2)

    products = []
    scraped_product_names = set() 
    for i in range(20):  
        driver.find_element(By.TAG_NAME, 'body').send_keys(Keys.PAGE_DOWN)
        time.sleep(2)  
        # Espera para cargar las imagenes lazy
        WebDriverWait(driver, 20).until(
        EC.presence_of_all_elements_located((By.XPATH, "//img[@data-test='lazy-load-image']"))
        )

        html = driver.page_source
        soup = BeautifulSoup(html, 'html.parser')


        product_containers = soup.find_all('div', {'class': 'components__ProductCardContainer-sc-filq44-2'})

        for container in product_containers:
            product = {}

            # Extracting product details
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
                    product['image_url'] = scrap_image(full_product_url)


            price_per_unit_element = container.find('span', {'data-test': 'fop-price-per-unit'})
            if price_per_unit_element:
                product['price_per_unit'] = price_per_unit_element.text

            total_price_element = container.find('span', {'data-test': 'fop-price'})
            if total_price_element:
                product['total_price'] = total_price_element.text
            
            if product.get('name') and product['name'] not in scraped_product_names:
                products.append(product)
                scraped_product_names.add(product['name'])

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
    


def generate_urls(names, base_url):
    """
    Genera una lista de URLs reemplazando el placeholder de la URL base con cada elemento de la lista
    :param names: Lista de nombres 
    :param base_url: La URL base con {name} listo para ser modificado
    :return: Lista de URLs con los elementos insertados
    """
    # Modifica {name} en base_url con cada elemento de la lista
    urls = [base_url.replace("{name}", name) for name in names]
    return urls

#Listado 
names = ["Leche","Huevos","Frutas","Verduras","Pan","Cereales","Tubérculos","Harina","Quesos","Legumbres","Pasta","Aceite"]
# URL del producto
url_base = 'https://www.compraonline.alcampo.es/search?q={name}'
generated_urls = generate_urls(names, url_base)
for url in generated_urls:
            try:
                products = scrape_product_details(url)
            except Exception as e:
                print(f"Error al procesar la URL {url}: {e}")
                continue  # Continua con la siguiente URL en caso de fallo
            if products is not None:
                for product in products:
                    save_product_to_json(product)
            else:
                print(f"Datos no válidos para la URL {url}, omitiendo...")      

            

