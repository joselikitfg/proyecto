import requests
from bs4 import BeautifulSoup
import json
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from webdriver_manager.chrome import ChromeDriverManager
import time

# URL del producto
url = 'https://www.compraonline.alcampo.es/categories'

def scrap_alcampo(url):
    # Realiza la solicitud y obtén el contenido de la página
    response = requests.get(url)
    cookies = response.cookies

    soup = BeautifulSoup(response.content, 'html.parser')

    # Encuentra la etiqueta script con los datos estructurados de producto
    script = soup.find('script', {'type': 'application/ld+json'})

    # Si encontramos la etiqueta script, cargamos el JSON
    if script:
        data = json.loads(script.string)
        product_name = data.get('name')
        product_price = data.get('offers', {}).get('price')
        product_image_url = data.get('image', [])[0]  # Tomamos la primera imagen

    else:
        print('Datos del producto no encontrados.')
        return None, None, None

    # Ahora usa las cookies para descargar la imagen
    response_imagen = requests.get(product_image_url, cookies=cookies)

    # Verificar que la solicitud tuvo exito
    if response_imagen.status_code == 200:
        # Genera un nombre de archivo único basado en el tiempo actual
        image_filename = f'imagen_descargada_{int(time.time())}.jpg'
        # Escribe el contenido de la respuesta (la imagen) a un archivo
        with open(image_filename, 'wb') as f:
            f.write(response_imagen.content)
        print(f"Imagen descargada con éxito y guardada como {image_filename}.")
    else:
        print("Error al descargar la imagen.")

    return product_name, product_price, product_image_url
       
def captura_urls_alcampo(url):
    # Initialize the browser
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service)

    # Navigate to the website
    driver.get(url)

    # Pause for initial loading
    time.sleep(2)

    urls = set()  # Initialize a set to store unique URLs

    # Scroll through the page gradually and scrape URLs at each step
    for i in range(20):  # Adjust this range as per the length of the page
        driver.find_element(By.TAG_NAME, 'body').send_keys(Keys.PAGE_DOWN)
        time.sleep(1)  # Wait between scrolls to allow data to load

        # Find all links on the page after each scroll
        links = driver.find_elements(By.TAG_NAME, "a")

        # Extract the URLs and add them to the set
        for link in links:
            href = link.get_attribute("href")
            if href and not href.startswith("javascript:"):  # Ignore 'javascript:' links
                urls.add(href)
    driver.quit()            
    return urls     




def save_product_to_json(product_name, product_price, product_image_url, json_file='products.json'):
    product_data = {
        'name': product_name,
        'price': product_price,
        'image_url': product_image_url
    }

    data = []  # Initialize data as an empty list

    # Try to read existing data from the file
    try:
        with open(json_file, 'r',encoding='utf-8') as file:
            # Load the data if the file is not empty
            file_contents = file.read()
            if file_contents:  # Check if file is not empty
                data = json.loads(file_contents)
    except FileNotFoundError:
        # If the file does not exist, it's fine - we'll create it
        pass
    except json.JSONDecodeError:
        # Handle the case where the file content is not valid JSON
        print(f"Warning: {json_file} contains invalid JSON. Overwriting with new data.")

    # Append new product data
    data.append(product_data)

    # Write updated data back to the file
    with open(json_file, 'w') as file:
        json.dump(data, file, indent=4)

    print(f"Product '{product_name}' saved to {json_file}")


urlsd = captura_urls_alcampo(url)
for url in urlsd:
    try:
        product_name, product_price, product_image_url = scrap_alcampo(url)
        print(f'Nombre del Producto: {product_name}')
        print(f'Precio: {product_price}')
        print(f'URL de la Imagen: {product_image_url}')
    except Exception as e:
        print(f"Error al procesar la URL {url}: {e}")
        continue  # Continues with the next URL in case of an error

    if product_name is not None and product_price is not None and product_image_url is not None:
        save_product_to_json(product_name, product_price, product_image_url)
    else:
        print(f"Datos no válidos para la URL {url}, omitiendo...")      

