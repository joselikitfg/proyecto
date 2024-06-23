import boto3


def get_all_items(table_name):
    dynamodb = boto3.resource('dynamodb', region_name='eu-west-1')
    table = dynamodb.Table(table_name)

    response = table.scan()
    items = response['Items']

    while 'LastEvaluatedKey' in response:
        response = table.scan(ExclusiveStartKey=response['LastEvaluatedKey'])
        items.extend(response['Items'])

    return items


def convert_to_lowercase(item):
    new_item = {}
    for key, value in item.items():
        if isinstance(value, str):
            new_item[key.lower()] = value.lower()
        elif isinstance(value, dict):
            new_item[key.lower()] = convert_to_lowercase(value)
        elif isinstance(value, list):
            new_item[key.lower()] = [convert_to_lowercase(i) if isinstance(i, dict) else i for i in value]
        else:
            new_item[key.lower()] = value
    return new_item


def update_items_to_lowercase(table_name):
    dynamodb = boto3.resource('dynamodb', region_name='eu-west-1')
    table = dynamodb.Table(table_name)
    items = get_all_items(table_name)

    for item in items:
        lower_item = convert_to_lowercase(item)
        response = table.put_item(Item=lower_item)
        print(f'Updated item: {item["pname"]} -> {response}')


if __name__ == '__main__':
    table_name = 'ScrappedProductsTable'
    update_items_to_lowercase(table_name=table_name)
