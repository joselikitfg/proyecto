import boto3
import time
import json
import logging
from .alcampo.Alcampo_scrapper import scrape_product_details, generate_urls, save_product_to_json
from boto3.dynamodb.conditions import Key, Attr
from .dia.Dia_scrapper import scrape_product_details_dia, generate_urls, save_product_to_json
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
    table = dynamodb.Table(table_name)
    
    for product in all_products:
        timestamp = int(time.time() * 1000)
        item = {
            'origin': 'alcampo',
            'pname': product["name"].lower(),
            'total_price': product["total_price"],
            'price_per_unit': product["price_per_unit"],
            'image_url': product["image_url"],
            'timestamp': timestamp
        }

        response = table.query(
            IndexName='NameIndex',
            KeyConditionExpression=Key('pname').eq(product['name'].lower())
        )

        items = [item for item in response.get('Items', []) if item['origin'] == 'alcampo']
        if items:
            existing_item = items[0]
            if existing_item['total_price'] != product['total_price']:
                if 'price_history' not in existing_item:
                    existing_item['price_history'] = []

                price_entry = {
                    'price': existing_item['total_price'],
                    'timestamp': existing_item['timestamp']
                }
                existing_item['price_history'].append(price_entry)

                table.update_item(
                    Key={'origin': existing_item['origin'], 'timestamp': existing_item['timestamp']},
                    UpdateExpression="""
                        SET total_price = :new_total_price,
                            price_per_unit = :new_price_per_unit,
                            timestamp = :new_timestamp,
                            price_history = :price_history
                    """,
                    ExpressionAttributeValues={
                        ':new_total_price': product['total_price'],
                        ':new_price_per_unit': product['price_per_unit'],
                        ':new_timestamp': timestamp,
                        ':price_history': existing_item['price_history']
                    }
                )
                logger.info("Updated item in DynamoDB with new price and price history")
            else:
                logger.info("Price is the same, no update needed")
        else:
            item['price_history'] = []
            response = table.put_item(Item=item)
            logger.info("Inserted new item in DynamoDB")

            
            
        
        # search_item_in_dynamodb = table.scan(
        #     FilterExpression=Attr('origin').eq(item['origin']) & Attr('name').eq(item['name'])
        # )
        # print("SCAN")
        # print(search_item_in_dynamodb)
        # if 'Items' in search_item_in_dynamodb and len(search_item_in_dynamodb['Items']) == 0:
        #     print("Sending to dynamoDB because item is not saved on dynamodb or its price has changed")
        #     print(item)
        #     response = table.put_item(Item=item)
        #     # print(response)

        # if 'Items' in search_item_in_dynamodb and len(search_item_in_dynamodb['Items']) > 0:
        #     existing_item = search_item_in_dynamodb['Items'][0]
        #     print(existing_item['total_price'])
        #     print(item['total_price'])
        #     if existing_item['total_price'] != item['total_price']:
        #         response = table.put_item(Item=item)
        #         print(response)
        #         print("Sending to dynamoDB because item is not saved on dynamodb or its price has changed")
        #         print(item)
        # else:
        #     print("Not sending to dynamoDB because item is already saved and price is the same")
        #     print(item)
        

def dia_handler(scrapper_terms):
    url_base = 'https://www.dia.es/search?q={name}'
    generated_urls = generate_urls(scrapper_terms, url_base)
    all_products = []

    for url in generated_urls:
        products = scrape_product_details_dia(url)
        all_products.extend(products)
    
    dynamodb = boto3.resource('dynamodb')
    table_name = 'ScrappedProductsTable'
    table = dynamodb.Table(table_name)
    
    for product in all_products:
        timestamp = int(time.time() * 1000)
        item = {
            'origin': 'dia',
            'pname': product["name"].lower(),
            'total_price': product["total_price"],
            'price_per_unit': product["price_per_unit"],
            'image_url': product["image_url"],
            'timestamp': timestamp
        }

        logger.info(f"Consultando DynamoDB con el nombre del producto: {product['name']}")
        response = table.query(
            IndexName='NameIndex',
            KeyConditionExpression=Key('pname').eq(product['name'].lower())
        )
        
        items = [item for item in response.get('Items', []) if item['origin'] == 'dia']
        logger.info(f"Estos son los items que hay con el mismo nombre: {items}")
        logger.info(f"NAME DEL PRODUCTO: {product['name']}")

        if items:
            existing_item = items[0]
            if existing_item['total_price'] != product['total_price']:
                if 'price_history' not in existing_item:
                    existing_item['price_history'] = []

                price_entry = {
                    'price': existing_item['total_price'],
                    'timestamp': existing_item['timestamp']
                }
                existing_item['price_history'].append(price_entry)

                table.update_item(
                    Key={'origin': existing_item['origin'], 'timestamp': existing_item['timestamp']},
                    UpdateExpression="""
                        SET total_price = :new_total_price,
                            price_per_unit = :new_price_per_unit,
                            timestamp = :new_timestamp,
                            price_history = :price_history
                    """,
                    ExpressionAttributeValues={
                        ':new_total_price': product['total_price'],
                        ':new_price_per_unit': product['price_per_unit'],
                        ':new_timestamp': timestamp,
                        ':price_history': existing_item['price_history']
                    }
                )
                logger.info("Updated item in DynamoDB with new price and price history")
            else:
                logger.info("Price is the same, no update needed")
        else:
            item['price_history'] = []
            response = table.put_item(Item=item)
            logger.info("Inserted new item in DynamoDB")


        

def lambda_handler(event, context):
    for record in event['Records']:
        message_body = record['body']
        data = json.loads(message_body)
        
        logger.info(f'Received message: {message_body}')
        scrapper_type = data["scrapper"]
        scrapper_terms = data["terms"]

        if scrapper_type == "alcampo":
            alcampo_handler(scrapper_terms)
        elif scrapper_type == "dia":
            dia_handler(scrapper_terms)
        

# if __name__ == '__main__' :
#     print("Hello world")
#     lambda_handler({},{})
