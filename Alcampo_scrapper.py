import requests
from bs4 import BeautifulSoup
import json

# URL del producto
url = 'https://www.compraonline.alcampo.es/products/Banana-a-granel/59772'

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

        # Imprime la informacion
    else:
        print('Datos del producto no encontrados.')


    # Ahora usa las cookies para descargar la imagen
    response_imagen = requests.get(product_image_url, cookies=cookies)

    # Verificar que la solicitud tuvo exito
    if response_imagen.status_code == 200:
        # Escribe el contenido de la respuesta (la imagen) a un archivo
        with open('imagen_descargada.jpg', 'wb') as f:
            f.write(response_imagen.content)
        print("Imagen descargada con éxito.")
    else:
        print("Error al descargar la imagen.")
    
    return product_name, product_price, product_image_url
       
       
       
product_name,product_price, product_image_url= scrap_alcampo(url)
print(f'Nombre del Producto: {product_name}')
print(f'Precio: {product_price}')
print(f'URL de la Imagen: {product_image_url}')
