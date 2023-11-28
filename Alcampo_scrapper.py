import requests
from bs4 import BeautifulSoup
import json
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from webdriver_manager.chrome import ChromeDriverManager
import time


def scrap_alcampo(url):
    # Realiza la solicitud y obtén el contenido de la página
    response = requests.get(url)
    cookies = response.cookies

    soup = BeautifulSoup(response.content, 'html.parser')
    print(response.content)
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
        image_filename = f'./images/imagen_descargada_{int(time.time())}.jpg'
        # Escribe el contenido de la respuesta (la imagen) a un archivo
        with open(image_filename, 'wb') as f:
            f.write(response_imagen.content)
        print(f"Imagen descargada con éxito y guardada como {image_filename}.")
    else:
        print("Error al descargar la imagen.")

    return product_name, product_price, product_image_url
       
def captura_urls_alcampo(url):
    # Inicia el navegador 
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service)

    
    driver.get(url)

    # sleep para cargar
    time.sleep(2)
    
    # Inicializa un set para almacenar URLs

    urls = set()  
    # Scroll gradual
    for i in range(20):  # 20 parametro de configuracion dependiendo de la pagina
        driver.find_element(By.TAG_NAME, 'body').send_keys(Keys.PAGE_DOWN)
        time.sleep(1)  # sleep para carga de objetos dinamico
        # Find todos los elementos
        links = driver.find_elements(By.TAG_NAME, "a")

        # Extrae urls y las almacena
        for link in links:
            href = link.get_attribute("href")
            if href and not href.startswith("javascript:"):  # Ignora los links 'javascript:' 
                urls.add(href)
    driver.quit()            
    return urls     




def save_product_to_json(product_name, product_price, product_image_url, json_file='products.json'):
    product_data = {
        'name': product_name,
        'price': product_price,
        'image_url': product_image_url
    }

    data = []  # Inicializa la lista

    # Si ya contiene algo intenta leerlo
    try:
        with open(json_file, 'r',encoding='utf-8') as file:
            # Carga los datos si no esta vacio
            file_contents = file.read()
            if file_contents:  # Comprueba si no esta vacio
                data = json.loads(file_contents)
    except FileNotFoundError:
        # Si no existe lo crea
        pass
    except json.JSONDecodeError:
        # Si el JSON no es valido
        print(f"Warning: {json_file} contains invalid JSON. Overwriting with new data.")

    # Append los nuevos datos
    data.append(product_data)

    # Actualizar los datos nuevos
    with open(json_file, 'w') as file:
        json.dump(data, file, indent=4)

    print(f"Product '{product_name}' saved to {json_file}")

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
        urlsd = captura_urls_alcampo(url)
        for url in urlsd:
            try:
                product_name, product_price, product_image_url = scrap_alcampo(url)
                print(f'Nombre del Producto: {product_name}')
                print(f'Precio: {product_price}')
                print(f'URL de la Imagen: {product_image_url}')
            except Exception as e:
                print(f"Error al procesar la URL {url}: {e}")
                continue  # Continua con la siguiente URL en caso de fallo

            if product_name is not None and product_price is not None and product_image_url is not None:
                save_product_to_json(product_name, product_price, product_image_url)
            else:
                print(f"Datos no válidos para la URL {url}, omitiendo...")      

