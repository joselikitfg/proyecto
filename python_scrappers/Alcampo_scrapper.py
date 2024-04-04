from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

from tempfile import mkdtemp
from bs4 import BeautifulSoup
import time
import requests
import json
from functools import wraps
from aws_lambda_powertools import Logger

logger = Logger(service="tu_servicio", level="INFO")


def timeit(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        start_time = time.time()
        result = func(*args, **kwargs)
        end_time = time.time()
        logger.info(f"{func.__name__} took {end_time - start_time} seconds to run.")
        return result

    return wrapper


@timeit
def scrap_alcampo_image(url):
    response = requests.get(url)

    soup = BeautifulSoup(response.content, "html.parser")

    script = soup.find("script", {"type": "application/ld+json"})

    if script:
        data = json.loads(script.string)
        if "image" in data and data["image"]:
            product_image_url = data["image"][0]
        else:
            product_image_url = None

    else:
        logger.info("Datos del producto no encontrados.")
        return (None,)

    return product_image_url


@timeit
def scrap_image(product):
    img_url = scrap_alcampo_image(product)
    return img_url


@timeit
def get_driver():
    option = webdriver.ChromeOptions()
    service = webdriver.ChromeService()
    # service = webdriver.ChromeService("/opt/chromedriver")
    # option.binary_location = '/opt/chrome/chrome'
    option.add_argument("--headless")
    option.add_argument(f"--window-size={1920*64},{1080*64}")
    option.add_argument("--start-maximized")
    option.add_argument("--disable-dev-tools")
    option.add_argument("--no-sandbox")
    option.add_argument("--disable-dev-shm-usage")
    option.add_argument("--disable-gpu")
    option.add_argument("--no-zygote")
    option.add_argument("--single-process")
    option.add_argument("--ignore-ssl-errors=yes")
    option.add_argument("--ignore-certificate-errors")
    option.add_argument("window-size=2560x1440")
    option.add_argument("--enable-logging")
    option.add_argument("enable-automation")
    option.add_argument(f"--user-data-dir={mkdtemp()}")
    option.add_argument(f"--data-path={mkdtemp()}")
    option.add_argument(f"--disk-cache-dir={mkdtemp()}")
    option.add_argument(
        "user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.77 Safari/537.36"
    )
    
    driver = webdriver.Chrome(options=option, service=service)
    driver.maximize_window()
    return driver


@timeit
def scrape_product_details(url):
    driver = get_driver()
    driver.get(url)
    logger.info(f"Obtuvimos el driver, y la url {url}")
    products = []
    scraped_product_names = set()
    scrap_product_list(driver, products, scraped_product_names)
    driver.quit()
    print(f"Scrapped: {json.dumps(products,indent=3)}")
    return products


@timeit
def scrap_product_list(driver, products, scraped_product_names):
    driver.find_element(By.TAG_NAME, "body").send_keys(Keys.PAGE_DOWN)
    driver.implicitly_wait(1)

    WebDriverWait(driver, 20).until(
        EC.presence_of_all_elements_located(
            (By.XPATH, "//img[@data-test='lazy-load-image']")
        )
    )

    html = driver.page_source
    soup = BeautifulSoup(html, "html.parser")

    product_containers = soup.find_all(
        "div", {"class": "components__ProductCardContainer-sc-filq44-2"}
    )
    logger.info(
        f"Products to be scrapped in this driver session: {product_containers.__len__()}"
    )
    for container in product_containers:
        scrap_one_product(
            product_containers, container, scraped_product_names, products
        )


@timeit
def scrap_one_product(product_containers, container, scraped_product_names, products):
    product = {}

    title_element = container.find("h3", {"data-test": "fop-title"})
    if title_element:
        product["name"] = title_element.text

    image_element = container.find("img", {"data-test": "lazy-load-image"})
    if image_element and "src" in image_element.attrs:
        product["image_url"] = image_element["src"]
    else:
        product_link_element = container.find("a", {"data-test": "fop-product-link"})
        if product_link_element and "href" in product_link_element.attrs:
            full_product_url = (
                "https://www.compraonline.alcampo.es" + product_link_element["href"]
            )
            product["image_url"] = scrap_image(full_product_url)

    price_per_unit_element = container.find("span", {"data-test": "fop-price-per-unit"})
    if price_per_unit_element:
        product["price_per_unit"] = price_per_unit_element.text

    total_price_element = container.find("span", {"data-test": "fop-price"})
    if total_price_element:
        product["total_price"] = total_price_element.text

    if product.get("name") and product["name"] not in scraped_product_names:
        products.append(product)
        scraped_product_names.add(product["name"])


@timeit
def save_product_to_json(product, json_file="products2.json"):
    data = []
    try:
        with open(json_file, "r", encoding="utf-8") as file:
            file_contents = file.read()
            if file_contents:
                data = json.loads(file_contents)
    except FileNotFoundError:
        pass
    except json.JSONDecodeError:
        logger.exception(
            f"Warning: {json_file} contains invalid JSON. Overwriting with new data."
        )

    data.append(product)

    with open(json_file, "w", encoding="utf-8") as file:
        json.dump(data, file, indent=4)

    logger.info(f"Product '{product['name']}' saved to {json_file}")


@timeit
def generate_urls(names, base_url):
    """
    Genera una lista de URLs reemplazando el placeholder de la URL base con cada elemento de la lista
    :param names: Lista de nombres
    :param base_url: La URL base con {name} listo para ser modificado
    :return: Lista de URLs con los elementos insertados
    """

    urls = [base_url.replace("{name}", name) for name in names]
    return urls


@timeit
def scrap_product_by_category(url):
    products = None
    try:
        products = scrape_product_details(url)
    except Exception as e:
        logger.exception(f"Error al procesar la URL {url}: {e}")
        import traceback

        traceback.print_exc()
    if products is not None:
        for product in products:
            save_product_to_json(product)
    else:
        logger.error(f"Datos no válidos para la URL {url}, omitiendo...")


@timeit
def lambda_handler(event=None, context=None):
    logger = Logger(service="tu_servicio", level="INFO")
    url_base = "https://www.compraonline.alcampo.es/search?q={name}"
    generated_urls = generate_urls(names=["pasta"], base_url=url_base)
    all_products = []

    for url in generated_urls:
        products = scrape_product_details(url)
        all_products.extend(products)


if __name__ == "__main__":
    lambda_handler()
