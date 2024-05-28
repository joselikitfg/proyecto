import boto3
import json
from datetime import datetime, timedelta
from decimal import Decimal

dynamodb = boto3.resource('dynamodb', region_name='eu-west-1')
table = dynamodb.Table('ScrappedProductsTable')


def convert_decimals(obj):
    if isinstance(obj, list):
        return [convert_decimals(i) for i in obj]
    elif isinstance(obj, dict):
        return {k: convert_decimals(v) for k, v in obj.items()}
    elif isinstance(obj, Decimal):
        return float(obj)
    return obj


def get_item_by_pname(pname):
    response = table.query(
        IndexName='NameIndex',
        KeyConditionExpression=boto3.dynamodb.conditions.Key('pname').eq(pname)
    )
    items = response.get('Items', [])
    if not items:
        raise ValueError(f"No se encontró ningún ítem con pname: {pname}")
    return items[0]


pname = 'nestlé aquarel  agua mineral garrafa de 5 l.'

def generate_price_history(start_date, num_days, initial_total_price, units):
    price_history = []
    current_total_price = initial_total_price
    current_date = start_date

    for _ in range(num_days):
        price_entry = {
            'timestamp': str(int(current_date.timestamp() * 1000)),
            'total_price': f'{current_total_price:.2f} €',
            'price_per_unit': f'{(current_total_price / units):.2f} €'
        }
        price_history.append(price_entry)


        current_date += timedelta(days=1)

        current_total_price *= 1 + (0.01 * (1 if current_date.day % 2 == 0 else -1))  

    return price_history

start_date = datetime.now() - timedelta(days=90)
price_history = generate_price_history(start_date, 90, 1.38, 5)  

try:
    item_to_update = get_item_by_pname(pname)
except ValueError as e:
    print(e)
    exit(1)


def update_item_price_history(pname, price_history):
    response = table.update_item(
        Key={
            'origin': item_to_update['origin'],  
            'timestamp': item_to_update['timestamp']  
        },
        UpdateExpression="SET price_history = :ph",
        ExpressionAttributeValues={
            ':ph': price_history
        },
        ReturnValues="UPDATED_NEW"
    )
    return response

update_response = update_item_price_history(pname, price_history)

print("UpdateItem succeeded:")
print(json.dumps(update_response, indent=4))


item = get_item_by_pname(pname)


item = convert_decimals(item)

print("Retrieved Item:")
print(json.dumps(item, indent=4))
