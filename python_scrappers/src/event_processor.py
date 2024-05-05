import boto3
import time
import json
import logging
from .alcampo.Alcampo_scrapper import scrape_product_details, generate_urls, save_product_to_json

logger = logging.getLogger()
logger.setLevel(logging.INFO)

# def lambda_handler(event, context):
#     # Imprime cada mensaje recibido
#     for record in event['Records']:
#         # Extrae el cuerpo del mensaje
#         message_body = record['body']
        
#         # Imprime el mensaje
#         logger.info(f'Received message: {message_body}')

def alcampo_handler(scrapper_terms):
    url_base = 'https://www.compraonline.alcampo.es/search?q={name}'
    generated_urls = generate_urls(scrapper_terms, url_base)
    all_products = []

    for url in generated_urls:
        products = scrape_product_details(url)
        all_products.extend(products)
    
    dynamodb = boto3.resource('dynamodb')
    table_name = 'ScrappedProductsTable'
    for product in products:
        timestamp = int(time.time() * 1000)
        # Referencia a la tabla
        table = dynamodb.Table(table_name)
        item = {
            'origin': 'alcampo',
            'name': product["name"],
            'total_price': product["total_price"],
            'price_per_unit': product["price_per_unit"],
            'image_url': product["image_url"],
            'timestamp': timestamp
        }
        print("Sending to dynamoDB")
        print(item)
        response = table.put_item(Item=item)
        print(response)

def lambda_handler(event, context):
    for record in event['Records']:
        message_body = record['body']
        data = json.loads(message_body)
        
        logger.info(f'Received message: {message_body}')
        scrapper_type = data["scrapper"]
        scrapper_terms = data["terms"]

        if scrapper_type == "alcampo":
            alcampo_handler(scrapper_terms)
        

# if __name__ == '__main__' :
#     print("Hello world")
#     lambda_handler({},{})
