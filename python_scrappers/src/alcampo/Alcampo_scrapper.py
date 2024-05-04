# -*- coding: utf-8 -*-
import json
import os
import time
from functools import wraps
from tempfile import mkdtemp
from typing import Any, Callable, Dict, List, Optional, Set, TypeVar

from aws_lambda_powertools import Logger
from bs4 import BeautifulSoup, Tag
import requests
from selenium import webdriver
from selenium.webdriver.chrome.options import Options as ChromeOptions
from selenium.webdriver.chrome.service import Service as ChromeService
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.remote.webdriver import WebDriver
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait

import concurrent.futures

logger = Logger(service='python-alcampo-scrapper', level='INFO')

## @todo: añadir typing :CHECK
## @todo: docstrings para los comentarios de las funciones :CHECK
## @todo: unit test
## @todo: coverage unit test
# ENVIRONMENT="local" python src/alcampo/Alcampo_scrapper.py


T = TypeVar('T')


def timeit(func: Callable[..., T]) -> Callable[..., T]:
    """
    Un decorador que mide y registra el tiempo de ejecución de la función decorada. Utiliza el módulo de
    logging para registrar el tiempo que toma ejecutar la función. Este decorador es agnóstico respecto al
    tipo y número de argumentos que la función decorada acepta, así como su valor de retorno.

    Args:
        func (Callable[..., T]): La función a decorar, que puede aceptar cualquier combinación de argumentos
                                 posicionales y nombrados, y puede retornar cualquier tipo.

    Returns:
        Callable[..., T]: Una función wrapper que, cuando se llama, ejecuta `func` y registra su tiempo de
                          ejecución, retornando el mismo valor que `func`.
    """

    @wraps(func)
    def wrapper(*args, **kwargs) -> T:
        start_time = time.time()
        result = func(*args, **kwargs)
        end_time = time.time()
        logger.info(f'{func.__name__} took {end_time - start_time} seconds to run.')
        return result

    return wrapper


# @timeit
def scrap_alcampo_image(url: str) -> Optional[str]:
    """
    Raspa la URL de la imagen de un producto desde una página web específica, dada la URL de la página.
    La función hace una solicitud HTTP a la URL proporcionada, analiza el HTML de la respuesta para encontrar
    un elemento <script> que contiene datos estructurados en formato JSON, y extrae la URL de la imagen del
    producto de estos datos si está disponible.

    Args:
        url (str): La URL de la página web del producto desde donde se desea extraer la URL de la imagen.

    Returns:
        Optional[str]: La URL de la imagen del producto si se encuentra disponible; de lo contrario, None.
    """
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
        logger.info('Datos del producto no encontrados.')
        product_image_url = None

    return product_image_url


# @timeit
def scrap_image(product: Any) -> str:
    """
    Extrae la URL de la imagen de un producto específico utilizando la función `scrap_alcampo_image`.
    Esta función sirve como un wrapper o una capa de abstracción alrededor de `scrap_alcampo_image`,
    permitiendo cambiar fácilmente la implementación de extracción de imágenes sin modificar
    las funciones que dependen de `scrap_image`.

    Args:
        product (Any): El producto del cual se desea extraer la URL de la imagen. La especificación
                       exacta de este argumento depende de la implementación de `scrap_alcampo_image`.

    Returns:
        str: La URL de la imagen del producto especificado.
    """
    img_url = scrap_alcampo_image(product)
    return img_url


# @timeit
def get_driver() -> Any:
    """
    Configura y retorna una instancia de Selenium WebDriver para Google Chrome. La configuración se ajusta
    según si la ejecución es local o en un entorno de producción, modificando la ubicación del binario de Chrome
    y el driver de Chrome según sea necesario. Se configura para ejecutarse en modo headless con varias opciones
    adicionales para optimizar el rendimiento y evitar problemas comunes en entornos sin servidor.

    Returns:
        Any: Una instancia configurada de Selenium WebDriver para Google Chrome. Se retorna como 'Any' debido a
             la falta de especificación exacta del tipo sin importaciones explícitas de tipado para Selenium WebDriver.
    """
    option = ChromeOptions()
    service = ChromeService()

    if os.getenv('ENVIRONMENT') != 'local':
        service = ChromeService(executable_path='/opt/chromedriver')
        option.binary_location = '/opt/chrome/chrome'

    # option.add_argument("--headless=new")
    option.add_argument("--headless")
    option.add_argument('--no-sandbox')
    option.add_argument("--disable-gpu")
    option.add_argument(f'--window-size={1920*64},{1080*64}')
    option.add_argument("--single-process")
    option.add_argument("--disable-dev-shm-usage")
    option.add_argument("--disable-dev-tools")
    option.add_argument("--no-zygote")
    option.add_argument(f"--user-data-dir={mkdtemp()}")
    option.add_argument(f"--data-path={mkdtemp()}")
    option.add_argument(f"--disk-cache-dir={mkdtemp()}")
    option.add_argument("--remote-debugging-port=9222")
    option.add_argument(
        'user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.77 Safari/537.36'
    )

    driver = webdriver.Chrome(options=option, service=service)
    driver.maximize_window()

    return driver


# @timeit
def scrape_product_details(url: str) -> List[Dict[str, Any]]:
    """
    Navega a una URL dada con un navegador controlado por Selenium, extrae detalles de los productos
    presentes en la página y retorna una lista de diccionarios con los detalles de cada producto.
    Utiliza una función auxiliar para realizar el raspado específico de los productos en la página.

    Args:
        url (str): La URL de la página web de donde se quieren raspar los detalles de los productos.

    Returns:
        List[Dict[str, Any]]: Una lista de diccionarios, cada uno conteniendo detalles de un producto.
    """
    driver = get_driver()
    driver.get(url)
    logger.info(f'Driver got url={url}')
    products = []
    scraped_product_names = set()
    scrap_product_list(driver, products, scraped_product_names)
    driver.quit()
    logger.info(f'Scrapped Total Items: {len(products)}')
    # logger.info(f'Scrapped: {json.dumps(products, indent=3)}')
    logger.info(f'First 3 Scrapped elements: {json.dumps(products[0:3], indent=3)}')
    return products


# @timeit
def scrap_product_list(driver: WebDriver, products: List[Dict[str, Any]], scraped_product_names: Set[str]) -> None:
    """
    Navega en una página web utilizando Selenium WebDriver y raspa una lista de productos
    utilizando BeautifulSoup para analizar el HTML obtenido. La función busca contenedores de
    productos en la página, extrayendo detalles específicos de cada producto y agregándolos a una
    lista de productos, evitando duplicados basados en los nombres de los productos ya raspados.

    Args:
        driver (WebDriver): Instancia del WebDriver de Selenium utilizada para navegar.
        products (List[Dict[str, Any]]): Lista donde se almacenarán los detalles de los productos raspados.
        scraped_product_names (Set[str]): Conjunto de nombres de productos ya raspados para evitar duplicados.

    Returns:
        None: Esta función modifica directamente la lista `products` y el conjunto `scraped_product_names`.
    """
    driver.find_element(By.TAG_NAME, 'body').send_keys(Keys.PAGE_DOWN)
    driver.implicitly_wait(1)

    WebDriverWait(driver, 20).until(
        EC.presence_of_all_elements_located((By.XPATH, "//img[@data-test='lazy-load-image']"))
    )

    html = driver.page_source
    soup = BeautifulSoup(html, 'html.parser')
    product_containers = soup.find_all('div', {'class': 'product-card-container'})
    product_containers = product_containers[:int(len(product_containers)/5)]

    logger.info(f'Products to be scrapped in this driver session: {len(product_containers)}')

    for container in product_containers:
        scrap_one_product(product_containers, container, scraped_product_names, products)

# @timeit
def scrap_one_product(
    product_containers: List[Tag], container: Tag, scraped_product_names: Set[str], products: List[Dict[str, Any]]
) -> None:
    """
    Raspado de los detalles de un único producto desde un contenedor HTML. Extrae información como el nombre,
    URL de la imagen, precio por unidad y precio total del producto, y lo agrega a la lista de productos si el
    nombre del producto aún no ha sido raspado.

    Args:
        product_containers (List[Tag]): Lista de contenedores de productos (no utilizado en esta versión).
        container (Tag): El contenedor BeautifulSoup del producto actual a raspar.
        scraped_product_names (Set[str]): Conjunto de nombres de productos ya raspados, para evitar duplicados.
        products (List[Dict[str, Any]]): Lista de productos raspados, cada uno representado como un diccionario.

    Returns:
        None: Esta función modifica las listas y el conjunto proporcionados directamente, no tiene retorno.
    """
    product = {}

    mi_contenedor = container.find('div', {'data-test': 'fop-body'})
    title_element = mi_contenedor.find('h3', {'data-test': 'fop-title'})
    # title_element = container.find('a', {'data-test': 'fop-product-link'})
    if title_element:
        product['name'] = title_element.text

    image_element = container.find('img', {'data-test': 'lazy-load-image'})
    if image_element and 'src' in image_element.attrs:
        product['image_url'] = image_element['src']
    else:
        product_link_element = container.find('a', {'data-test': 'fop-product-link'})
        if product_link_element and 'href' in product_link_element.attrs:
            full_product_url = 'https://www.compraonline.alcampo.es' + product_link_element['href']
            product['image_url'] = scrap_image(full_product_url)

    price_per_unit_element = container.find('span', {'data-test': 'fop-price-per-unit'})
    if price_per_unit_element:
        product['price_per_unit'] = price_per_unit_element.text.strip()

    total_price_element = container.find('span', {'data-test': 'fop-price'})
    if total_price_element:
        product['total_price'] = total_price_element.text.strip()

    if product.get('name') and product['name'] not in scraped_product_names:
        products.append(product)
        scraped_product_names.add(product['name'])


# @timeit
def save_product_to_json(product: Dict[str, Any], json_file: str = 'products2.json') -> None:
    """
    Guarda los detalles de un producto en un archivo JSON. Si el archivo ya existe, añade el producto a la lista
    de productos en el archivo. Si el archivo no existe, lo crea. Si hay un error en la decodificación del JSON
    existente, registra una advertencia y sobrescribe el archivo con los nuevos datos.

    Args:
        product (Dict[str, Any]): Un diccionario con los detalles del producto a guardar.
        json_file (str, opcional): El nombre del archivo JSON donde se guardará el producto. Por defecto es "products2.json".

    Returns:
        None
    """
    data = []
    try:
        with open(json_file, 'r', encoding='utf-8') as file:
            file_contents = file.read()
            if file_contents:
                data = json.loads(file_contents)
    except FileNotFoundError:
        pass
    except json.JSONDecodeError:
        logger.exception(f'Warning: {json_file} contains invalid JSON. Overwriting with new data.')

    data.append(product)

    with open(json_file, 'w', encoding='utf-8') as file:
        json.dump(data, file, indent=4)

    logger.info(f"Product '{product['name']}' saved to {json_file}")


# @timeit
def generate_urls(names: List[str], base_url: str) -> List[str]:
    """
    Genera una lista de URLs reemplazando el placeholder de la URL base con cada elemento de la lista.

    Args:
        names (List[str]): Lista de nombres a insertar en la URL base.
        base_url (str): La URL base con "{name}" listo para ser reemplazado por cada nombre en `names`.

    Returns:
        List[str]: Lista de URLs con los elementos de `names` insertados.
    """

    urls = [base_url.replace('{name}', name) for name in names]
    return urls


# @timeit
def scrap_product_by_category(url: str) -> Optional[List[Dict[str, Any]]]:
    """
    Obtiene los detalles de los productos de una categoría específica a partir de la URL dada,
    luego guarda estos detalles en formato JSON. Si ocurre un error durante la obtención de los
    detalles del producto, el error se registra y se muestra la traza de la pila.

    Args:
        url (str): La URL de la categoría de productos a procesar.

    Returns:
        Optional[List[Dict[str, Any]]]: Una lista de diccionarios con los detalles de los productos
        obtenidos y procesados, o None si no se pudo obtener o procesar los productos.
    """
    products = None
    try:
        products = scrape_product_details(url)
    except Exception as e:
        logger.exception(f'Error al procesar la URL {url}: {e}')
        import traceback

        traceback.print_exc()

    if products is not None:
        for product in products:
            save_product_to_json(product)
        return products
    else:
        logger.error(f'Datos no válidos para la URL {url}, omitiendo...')
        return None


# @timeit
# @logger.inject_lambda_context
def lambda_handler(event: Optional[dict] = None, context: Optional[object] = None) -> List[Dict[str, any]]:
    """
    Función principal para el manejo de eventos de AWS Lambda que genera URLs basadas en una lista de nombres y
    la URL base de un sitio de comercio electrónico. Luego, raspa los detalles de los productos de cada URL generada
    y agrega todos los productos encontrados a una lista.

    Args:
        event (Optional[dict]): Objeto de evento proporcionado por AWS Lambda, no utilizado en esta función.
        context (Optional[object]): Objeto de contexto proporcionado por AWS Lambda con información sobre la ejecución,
                                     no utilizado en esta función.

    Returns:
        List[Dict[str, any]]: Una lista de diccionarios, donde cada diccionario contiene detalles de un producto.
    """
    url_base = 'https://www.compraonline.alcampo.es/search?q={name}'
    generated_urls = generate_urls(names=['leche'], base_url=url_base)
    all_products = []

    for url in generated_urls:
        products = scrape_product_details(url)
        all_products.extend(products)

    return all_products


if __name__ == '__main__':
    lambda_handler()
