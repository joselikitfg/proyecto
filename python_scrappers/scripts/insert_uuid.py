import uuid
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


def add_uuid_to_item(item):
    new_item = item
    new_uuid = str(uuid.uuid4())
    print(new_uuid)
    new_item['pid'] = new_uuid
    return new_item


def update_items_with_uuid(table_name):
    dynamodb = boto3.resource('dynamodb', region_name='eu-west-1')
    table = dynamodb.Table(table_name)
    items = get_all_items(table_name)

    for item in items:
        new_item = add_uuid_to_item(item)
        response = table.put_item(Item=new_item)
        print(f'Updated item: {item["pname"]} -> {response}')


if __name__ == '__main__':
    table_name = 'ScrappedProductsTable'
    update_items_with_uuid(table_name=table_name)
