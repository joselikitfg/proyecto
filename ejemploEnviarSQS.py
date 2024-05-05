# import boto3
# import json

# # Crea una sesión de cliente para SQS
# sqs = boto3.client('sqs')

# # URL de la cola de SQS
# queue_url = 'https://sqs.eu-west-1.amazonaws.com/590183922248/MiColaSQS'

# # Mensaje a enviar
# message = {
#     "scrapper": "alcampo"
# }

# # Envía el mensaje a SQS
# response = sqs.send_message(
#     QueueUrl=queue_url,
#     MessageBody=json.dumps(message)
# )

# print(response)