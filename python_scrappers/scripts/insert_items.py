import boto3
import json
from decimal import Decimal
from boto3.dynamodb.conditions import Key, Attr


def insert_items(table_name):
    dynamodb = boto3.resource('dynamodb', region_name='eu-west-1')
    table = dynamodb.Table(table_name)
    to_insert = {
        'origin': 'alcampo',
        'pname': 'NESTLÉ AQUAREL  Agua mineral garrafa de 5 l.',
        'price_per_unit': '(0,29\xa0€ por litro)',
        'total_price': '1,45\xa0€',
        'image_url': 'https://www.compraonline.alcampo.es/images-v3/37ea0506-72ec-4543-93c8-a77bb916ec12/9cc3cc78-053b-495d-9bb3-7d49ce6aaace/300x300.jpg',
        'timestamp': Decimal('1715782898552'),
    }
    response = table.put_item(Item=to_insert)
    print(response)


def simulate_insert_lambda(table_name):
    dynamodb = boto3.resource('dynamodb', region_name='eu-west-1')
    table = dynamodb.Table(table_name)
    response = table.query(
        TableName='ScrappedProductsTable',
        IndexName='NameIndex',
        KeyConditionExpression='#keyname = :compared_value',
        ExpressionAttributeNames={'#keyname': 'pname'},
        ExpressionAttributeValues={':compared_value': 'NESTLÉ AQUAREL  Agua mineral garrafa de 5 l.'},
    )

    # scrapped
    to_insert = {
        'origin': 'alcampo',
        'pname': 'NESTLÉ AQUAREL  Agua mineral garrafa de 5 l.',
        'price_per_unit': '(0,29\xa0€ por litro)',
        'total_price': '1,44\xa0€',
        'image_url': 'https://www.compraonline.alcampo.es/images-v3/37ea0506-72ec-4543-93c8-a77bb916ec12/9cc3cc78-053b-495d-9bb3-7d49ce6aaace/300x300.jpg',
        'timestamp': Decimal('1715782898550'),
    }

    items = response.get('Items', [])
    # for item in items:
    #     should_insert = False
    #     print(item)
    #     if(item['total_price'] != to_insert['total_price']):
    #         should_insert=True
    exists_any = any((item['total_price'] == to_insert['total_price']) for item in items)
        
    if not exists_any:
        print("Se debe insertar")
    else:
        print("No se debe insertar")

if __name__ == '__main__':
    table_name = 'ScrappedProductsTable'
    # search_item_scan(table_name=table_name)
    # insert_items(table_name=table_name)
    simulate_insert_lambda(table_name=table_name)
