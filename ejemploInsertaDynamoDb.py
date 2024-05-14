import boto3
from datetime import datetime

# Inicializa el cliente de DynamoDB
dynamodb = boto3.resource('dynamodb')

# Especifica el nombre de tu tabla
table_name = 'ProductPrices'
table = dynamodb.Table(table_name)

# Datos del producto a insertar
product_name = 'PULEVA Bebida láctea con extractos vegetales y triptófano, sin lactosa, Buenas Noches 1 l.'
source = 'alcampo'
timestamp = int(datetime.now().timestamp())  # Genera un timestamp actual
price_per_unit = '1,50 € por litro'
total_price = '1,50 €'
image_url = 'https://www.compraonline.alcampo.es/images-v3/37ea0506-72ec-4543-93c8-a77bb916ec12/d43e2a3e-8d2e-4560-b865-44fdfe3350d1/300x300.jpg'

# Clave de ordenación combinada
source_timestamp = f"{source}_{timestamp}"

# Inserta el registro en la tabla
response = table.put_item(
    Item={
        'ProductName': product_name,
        'Source_Timestamp': source_timestamp,
        'ImageURL': image_url,
        'PricePerUnit': price_per_unit,
        'TotalPrice': total_price
    }
)

print("Item inserted successfully:", response)