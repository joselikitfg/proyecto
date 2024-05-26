import boto3
import json
from decimal import Decimal
from botocore.exceptions import ClientError
from boto3.dynamodb.conditions import Key
from time import sleep


class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            return float(obj)
        return super(DecimalEncoder, self).default(obj)


def backup_and_delete_table_data(table_name):
    dynamodb = boto3.resource('dynamodb', region_name='eu-west-1')
    table = dynamodb.Table(table_name)

    response = table.scan()
    items = response['Items']

    with open('backup.json', 'w') as backup_file:
        json.dump(items, backup_file, cls=DecimalEncoder, indent=4)

    # with table.batch_writer() as batch:
    #     for item in items:
    #         attempts = 0
    #         while attempts < 10:
    #             try:
    #                 batch.delete_item(Key={'origin': item['origin'], 'timestamp': item['timestamp']})
    #                 break  # Salir del bucle si la operación es exitosa
    #             except ClientError as e:
    #                 if e.response['Error']['Code'] == 'ProvisionedThroughputExceededException':
    #                     # Esperar y reintentar
    #                     wait_time = 2**attempts
    #                     print(f'Throughput limit exceeded, retrying in {wait_time} seconds...')
    #                     sleep(wait_time)
    #                     attempts += 1
    #                 else:
    #                     # Si es otro error, salir del bucle y dejar que falle
    #                     raise e
    #         else:
    #             print(f'Failed to delete item {item} after 10 attempts.')

    print(f'Backup complete and all items deleted from {table_name}')


if __name__ == '__main__':
    table_name = 'ScrappedProductsTable'
    backup_and_delete_table_data(table_name)
