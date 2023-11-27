import requests
from bs4 import BeautifulSoup
import json
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from webdriver_manager.chrome import ChromeDriverManager
import time





import requests
from bs4 import BeautifulSoup
import time

def scrap_hipercor(url):
    
    response = requests.get(url)
    
    if response.status_code != 200:
        print("Failed to retrieve the webpage")
        return None, None, None

    soup = BeautifulSoup(response.content, 'html.parser')
    print(response.content)

    product_name_tag = soup.find("h3", class_="product_tile-description")
    product_name = product_name_tag.text.strip() if product_name_tag else "Unknown"


    product_price_tag = soup.find("div", class_="prices-price _current")
    product_price = product_price_tag.text.strip() if product_price_tag else "Unknown"


    product_image_tag = soup.find("img", alt=product_name)
    product_image_url = product_image_tag['src'] if product_image_tag and 'src' in product_image_tag.attrs else "Unknown"


    if product_image_url != "Unknown":
        try:
            image_response = requests.get(product_image_url)
            if image_response.status_code == 200:
                timestamp = int(time.time())
                image_filename = f"product_image_{timestamp}.jpg"
                with open(image_filename, 'wb') as file:
                    file.write(image_response.content)
                print(f"Image saved as {image_filename}")
            else:
                print("Failed to download the image")
        except Exception as e:
            print(f"Error while downloading the image: {e}")

    return product_name, product_price, product_image_url


product_url = "https://www.hipercor.es/supermercado/buscar/?term=Agua&search=text"
product_details = scrap_hipercor(product_url)
print(product_details)
