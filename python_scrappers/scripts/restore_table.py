import boto3
import json
from decimal import Decimal

class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            return float(obj)
        return super(DecimalEncoder, self).default(obj)

def restore_table_data(table_name, backup_file):
    dynamodb = boto3.resource('dynamodb', region_name='eu-west-1')
    table = dynamodb.Table(table_name)

    with open(backup_file, 'r') as file:
        items = json.load(file, parse_float=Decimal)

    with table.batch_writer() as batch:
        for item in items:
            batch.put_item(Item=item)

    print(f'Restoration of {len(items)} items from {backup_file} to table {table_name} completed.')

# Ejemplo de uso
restore_table_data('ScrappedProductsTable', 'backup.json')