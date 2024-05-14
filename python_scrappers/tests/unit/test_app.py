import pytest
from src.app import app as flask_app, lambda_handler
from unittest.mock import patch, MagicMock

@pytest.fixture
def app():
    yield flask_app

@pytest.fixture
def client(app):
    return app.test_client()

@pytest.fixture
def mock_boto_client():
    with patch('src.app.boto3.client') as mock:
        yield mock

def test_start_scraping_alcampo(client, mock_boto_client):
    mock_sqs = mock_boto_client.return_value
    mock_sqs.send_message.return_value = {'MessageId': '12345'}

    terms = ['pasta', 'leche']
    response = client.post('/scrape/alcampo', json={'terms': terms})

    assert response.status_code == 200
    assert 'Scraping iniciado' in response.json['message']

    mock_boto_client.assert_called_once_with('sqs')
    mock_sqs.send_message.assert_called_once()
    args, kwargs = mock_sqs.send_message.call_args
    assert kwargs['QueueUrl'] == 'https://sqs.eu-west-1.amazonaws.com/590183922248/MiColaSQS'
    assert 'alcampo' in kwargs['MessageBody']

def test_start_scraping_alcampo_no_terms(client):
    response = client.post('/scrape/alcampo', json={})
    assert response.status_code == 400
    assert 'No se proporcionaron términos' in response.json['error']


# Simulación de un evento y contexto de AWS Lambda
mock_event = {
    'httpMethod': 'GET',
    'path': '/',
    'headers': {},
    'queryStringParameters': {},
    'body': None,
    'isBase64Encoded': False,
}
mock_context = {}

@patch('src.app.awsgi.response')
def test_lambda_handler(mock_awsgi_response):
    """
    Test para verificar que lambda_handler maneja correctamente eventos y contextos de AWS Lambda,
    utilizando awsgi para adaptar la respuesta de una aplicación Flask.
    """
    mock_response = {
        'statusCode': 200,
        'headers': {'Content-Type': 'text/html'},
        'body': 'Hello, World from /!',
        'isBase64Encoded': False,
    }
    mock_awsgi_response.return_value = mock_response
    response = lambda_handler(mock_event, mock_context)
    mock_awsgi_response.assert_called_once()
    assert response == mock_response
