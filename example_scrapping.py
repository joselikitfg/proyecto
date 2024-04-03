from selenium import webdriver
from bs4 import BeautifulSoup
import time

# Configura el WebDriver de Selenium
# Asegúrate de tener el ChromeDriver descargado y especifica su ubicación aquí
driver_path = '/Applications/Google Chrome.app' # Cambia esto por tu ruta a chromedriver
option = webdriver.ChromeOptions()
option.add_argument("--headless")
option.add_argument("--no-sandbox")
option.add_argument("--disable-dev-shm-usage")
option.add_argument("--disable-gpu")
option.add_argument("--disable-dev-tools")
option.add_argument("--no-zygote")
option.add_argument("--single-process")
option.add_argument("--disable-dev-tools")
option.add_argument('--ignore-ssl-errors=yes')
option.add_argument('--ignore-certificate-errors')
option.add_argument("window-size=2560x1440")
option.add_argument('--enable-logging')
option.add_argument("enable-automation")
# option.add_argument(f"--user-data-dir={mkdtemp()}")
# option.add_argument(f"--data-path={mkdtemp()}")
# option.add_argument(f"--disk-cache-dir={mkdtemp()}")
option.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.77 Safari/537.36")
option.add_argument("--window-size=1920,1080")
driver = webdriver.Chrome(options=option)

try:
    # Define la URL de la página que quieres scrapear
    url = 'https://www.compraonline.alcampo.es/'
    
    # Selenium abre la página web
    driver.get(url)
    
    # Espera unos segundos para que la página se cargue completamente
    time.sleep(3)
    
    # Obtén el HTML de la página
    html = driver.page_source
    
    # Usa BeautifulSoup para analizar el HTML
    soup = BeautifulSoup(html, 'html.parser')
    
    # Encuentra los elementos que quieres extraer
    # Por ejemplo, extrayendo todos los títulos de los artículos en un blog ficticio
    article_titles = soup.find_all('h2', class_='article-title') # Cambia 'h2' y 'article-title' según sea necesario
    
    # Imprime los títulos encontrados
    for title in article_titles:
        print(title.text.strip())

finally:
    # Cierra el navegador al finalizar
    driver.quit()