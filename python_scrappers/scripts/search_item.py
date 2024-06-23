import boto3
import json
from decimal import Decimal
from boto3.dynamodb.conditions import Key, Attr


def search_item_scan(table_name):
    dynamodb = boto3.resource('dynamodb', region_name='eu-west-1')
    table = dynamodb.Table(table_name)

    response = table.scan()
    response = table.scan(
        FilterExpression=Attr('origin').eq('alcampo')
        & Attr('name').eq('HENO DE PRAVIA Agua fresca de colonia HENO DE PRAVIA Original 780 ml.')
    )
    items = response['Items']
    print(items)


def search_item_eficient(table_name):
    dynamodb = boto3.resource('dynamodb', region_name='eu-west-1')
    table = dynamodb.Table(table_name)
    response = table.query(
        TableName='ScrappedProductsTable',
        IndexName='NameIndex',
        KeyConditionExpression='#keyname = :compared_value',
        ExpressionAttributeNames={'#keyname': 'pname'},
        ExpressionAttributeValues={':compared_value': 'NESTLÉ AQUAREL  Agua mineral garrafa de 5 l.'},
    )

    items = response.get('Items', [])
    for item in items:
        print(item)
    # dynamodb = boto3.resource('dynamodb', region_name='eu-west-1')
    # table = dynamodb.Table(table_name)

    # # response = table.scan()
    # response = table.query(
    #     IndexName='NameIndex',  # Nombre del índice secundario global
    #     KeyConditionExpression=Key('origin').eq('alcampo') & Key('name').eq('HENO DE PRAVIA Agua fresca de colonia HENO DE PRAVIA Original 780 ml.')
    # )
    # # response = table.query(
    # # IndexName='NameIndex',  # Nombre del índice secundario global
    # #     KeyConditionExpression=Key('origin').eq('alcampo') & Key('name').eq('HENO DE PRAVIA Agua fresca de colonia HENO DE PRAVIA Original 780 ml.')
    # # )
    # items = response['Items']
    # print(items)


if __name__ == '__main__':
    table_name = 'ScrappedProductsTable'
    # search_item_scan(table_name=table_name)
    search_item_eficient(table_name=table_name)
