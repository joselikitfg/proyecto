#Diferentes pruebas de scrapeo en la web del alcampo con beautifulSoup


#Vamos a dividir por funciones el scrapeo como primer concepto

from bs4 import BeautifulSoup
import requests

#Esta funcion nos devuelve el titulo del producto
def scrapear_producto(url):
    headers = {"User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36","Accept-Encoding": "gzip, deflate, br","Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7","DNT":"1","Connection":"close","Upgrade-Insecure-Requests": "1"}
    page = requests.get(url,headers=headers)
    soup1 = BeautifulSoup(page.content, "html.parser")
    soup2 = BeautifulSoup(soup1.prettify(), "html.parser")
    
    title = soup2.find(class_ = '_display_v8p4a_1 _display--m_v8p4a_10 heading__Heading-sc-q2s63n-0 ezjVUk').get_text()
    title = title.strip()
    return title



#Esta funcion nos devuelve el precio del producto
def scrapear_precio(url):
    headers = {
        "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
        "Accept-Encoding": "gzip, deflate, br",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "DNT": "1",
        "Connection": "close",
        "Upgrade-Insecure-Requests": "1"
    }

    page = requests.get(url, headers=headers)
    soup1 = BeautifulSoup(page.content, "html.parser")
    soup2 = BeautifulSoup(soup1.prettify(), "html.parser")
    
    price = soup2.find(class_='_text_w6v0v_1 _text--bold_w6v0v_7 _text--xl_w6v0v_31 price__StyledText-sc-1om5bl6-0 igGbbW').get_text()
    price = price.strip()
    
    return price

# Como ejemplo de uso

URL = 'https://www.compraonline.alcampo.es/products/NESTL%C3%89-Agua-mineral-NESTL%C3%89-AQUAREL-garrafa-de-5-l/36177'
title = scrapear_producto(URL)
price = scrapear_precio(URL)
print(title)
print(price)