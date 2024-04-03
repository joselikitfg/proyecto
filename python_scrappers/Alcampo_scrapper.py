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



import time
from functools import wraps

def timeit(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        start_time = time.time()
        result = func(*args, **kwargs)
        end_time = time.time()
        print(f"{func.__name__} took {end_time - start_time} seconds to run.")
        return result
    return wrapper

@timeit
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
    # option.add_argument("--start-maximized")
    option.add_argument("--disable-dev-tools")
    option.add_argument("--no-sandbox")
    option.add_argument("--disable-dev-shm-usage")
    option.add_argument("--disable-gpu")
    option.add_argument("--no-zygote")
    option.add_argument("--single-process")
    
    option.add_argument('--ignore-ssl-errors=yes')
    option.add_argument('--ignore-certificate-errors')
    option.add_argument("window-size=2560x1440")
    option.add_argument('--enable-logging')
    option.add_argument("enable-automation")
    option.add_argument(f"--user-data-dir={mkdtemp()}")
    option.add_argument(f"--data-path={mkdtemp()}")
    option.add_argument(f"--disk-cache-dir={mkdtemp()}")
    option.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.77 Safari/537.36")
    # option.add_argument("--window-size=1920,1080")
    option.add_argument("--window-size=61400,34560")
    
    driver = webdriver.Chrome(options=option, service=service)
    driver.maximize_window()
    return driver

@timeit
def scrape_product_details(url):
    driver = get_driver()
    driver.get(url)
    print(f"Obtuvimos el driver, y la url {url}")

    # time.sleep(2)

    products = []
    scraped_product_names = set() 
    for i in range(1): 
        # process_one_product(driver, products, scraped_product_names) 
        driver.find_element(By.TAG_NAME, 'body').send_keys(Keys.PAGE_DOWN)
        # time.sleep(0.2)  

        WebDriverWait(driver, 20).until(
            EC.presence_of_all_elements_located((By.XPATH, "//img[@data-test='lazy-load-image']"))
        )
        
        html = driver.page_source
        soup = BeautifulSoup(html, 'html.parser')


        product_containers = soup.find_all('div', {'class': 'components__ProductCardContainer-sc-filq44-2'})

        for container in product_containers:
            print(f"Elementos: {product_containers.__len__()}")
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
    print(f"Scrapped: {json.dumps(products,indent=3)}")
    return products


@timeit
def process_one_product(driver, products, scraped_product_names):
    # driver.find_element(By.TAG_NAME, 'body').send_keys(Keys.PAGE_DOWN)

    driver.implicitly_wait(3)

    # WebDriverWait(driver, 20).until(
    #     EC.presence_of_all_elements_located((By.XPATH, "//img[@data-test='lazy-load-image']"))
    # )

    # html = driver.page_source
    # soup = BeautifulSoup(html, 'html.parser')

    # # elementos = driver.find_elements_by_css_selector('layout__Container-sc-nb1ebc-0')
    # elementos = driver.find_element(By.XPATH("//div[@class='layout__Container-sc-nb1ebc-0']"))
    # elementos = driver.find_element_by_css_selector('div[data-synthetics="product-list"]')
    # product_list = driver.find_element(by=By.XPATH, value='//div[@data-synthetics="product-list"]')
    # print(product_list.get_attribute('innerHTML'))
    # items = driver.find_elements(by=By.XPATH, value='//div[@data-synthetics="product-list"]//*')
    # items = product_list.find_elements(by=By.XPATH, value='//div[@class="base__Wrapper-sc-1mnb0pd-6"]')

    # items = driver.find_elements(by=By.XPATH, value="//div[starts-with(@class, 'base__Wrapper-sc-1mnb0pd-6')]//ancestor::div[@data-synthetics='product-list']")
    product_list_one_item = driver.find_element(by=By.XPATH, value="//div[@data-synthetics='product-list']")
    # //*[@id="product-page"]/div/div/div[2]/div/div/div[3]/div/div[2]/div[2]
    # 
    # itemBody = items.find_elements(by=By.XPATH, value= "//div[starts-with(@class, 'components__OuterContainer-sc-filq44-0 MObvm')])")
    print("xxxxxx")
    print(product_list_one_item.get_attribute('innerHTML'))
    print("HAY")
    mis_elementos = product_list_one_item.find_elements(by=By.XPATH, value="//*/span[@data-test='fop-price']")
    # # <h3 class="_text_f6lbl_1 _text--m_f6lbl_23" data-test="fop-title">Bobina de hilo color vaquero naranja, 100 metros, STYLE.</h3>
    print("YYYYYYYYYYY")
    # print(mis_elementos[0].get_attribute('innerHTML'))
    print(f"Elementos {mis_elementos.__len__()}")
    for producto in mis_elementos:
        print(producto.get_attribute('innerHTML'))
    
    # for i in mis_elementos:
        # print(i.get_attribute('innerHTML'))   
        # arriba = i.find_element(by=By.XPATH, value="./div")
        # print(arriba.get_attribute('innerHTML'))
        # abajo = i.find_element(by=By.XPATH, value="./div/div[1]")
        # precio = abajo.find_element(by=By.XPATH, value="./div/div")
        # print(precio.get_attribute('innerHTML'))
    # for i in items:
    #     algo = i.find_element(by=By.XPATH, value="//div")
    #     print(algo.get_attribute('innerHTML'))
        # print(i.get_attribute(''))
    


    # product_containers = soup.find_all('div', {'class': 'components__ProductCardContainer-sc-filq44-2'})

    # for container in product_containers:
    #     product = {}


    #     title_element = container.find('h3', {'data-test': 'fop-title'})
    #     if title_element:
    #         product['name'] = title_element.text



        
    #     image_element = container.find('img', {'data-test': 'lazy-load-image'})
    #     if image_element and 'src' in image_element.attrs:
    #         product['image_url'] = image_element['src']
    #     else:
    #         product_link_element = container.find('a', {'data-test': 'fop-product-link'})
    #         if product_link_element and 'href' in product_link_element.attrs:
    #             full_product_url = "https://www.compraonline.alcampo.es" + product_link_element['href']
    #             product['image_url'] = scrap_image(full_product_url)


    #     price_per_unit_element = container.find('span', {'data-test': 'fop-price-per-unit'})
    #     if price_per_unit_element:
    #         product['price_per_unit'] = price_per_unit_element.text

    #     total_price_element = container.find('span', {'data-test': 'fop-price'})
    #     if total_price_element:
    #         product['total_price'] = total_price_element.text
        
    #     if product.get('name') and product['name'] not in scraped_product_names:
    #         products.append(product)
    #         scraped_product_names.add(product['name'])



@timeit
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

@timeit
def lambda_handler(event=None, context=None):
    url_base = 'https://www.compraonline.alcampo.es/search?q={name}'
    generated_urls = generate_urls(names=["pasta"], base_url=url_base)
    all_products = []

    for url in generated_urls:
        products = scrape_product_details(url)
        all_products.extend(products)


if __name__ == '__main__':
    lambda_handler()