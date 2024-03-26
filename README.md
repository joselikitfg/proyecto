# Sistema de Información de productos de primera necesidad.

This TFG proposses the development of a digital platform to facilitate the comparison
and monitoring of prices of essential products. To do this, it proposes to address
problems such as access to price information available on different websites that can be
difficult and the ineffectiveness of current systems in price monitoring

## Features
    - Performs web scraping using Selenium
    - Loads scraped data into MongoDB for storage and further analysis
    - RESTful API implemented with Flask for scraped data manipulation
    - Easy to deploy with Docker

## Prerequisites
    - Docker and Docker compose installed locally

## Local Configuration
    1. Clone Repository
        git clone https://github.com/joselikitfg/proyecto
        cd proyecto
    2.  Build and Run Docker
        docker compose up --build
## Usage
    Once initialized in order to start scraping you only have to enter either one or more search
    terms in the Scraping box. In case that there are several terms, separate them by commas;
    For example: Milk, Water, Cereals.
    The scraping will start and once the first term is finished, the scraping will be automatically entered into the database by reloading the page you will 
    see the scrape of those terms.
    There is also a form to enter items manually.
    This form will only accept url images in the typical image formats [.jpg, .jpeg, 
    .png, .gif]

----------------------------------------------------------------------------------------------------

# Sistema de Información de productos de primera necesidad.

Este TFG propone el desarrollo de una plataforma digital para facilitar la comparación y monitorización de precios de productos esenciales. Para ello, se propone abordar problemas como el acceso a información de precios disponible en diferentes webs y que puede ser dificultoso y la ineficacia de los sistemas actuales en el monitoreo de precios.

## Características
    - Realiza web scraping utilizando Selenium
    - Carga los datos scrapeados en MongoDB para su almacenamiento y posterior analisis
    - API RESTful implementado con Flask para la manipulación de datos scrapeados
    - Fácil de desplegar con Docker

## Requisitos Previos
    - Docker y Docker compose instalados localmente

## Configuración Local
    1. Clonar Repositorio
        git clone https://github.com/joselikitfg/proyecto
        cd proyecto
    2. Construir y Ejecutar don Docker
        docker compose up --build
## Uso
    Una vez iniciado para comenzar a scrapear sólo tienes que introducir uno o varios 
    terminos de búsqueda en el recuadro Scraping
    En caso de ser varios términos separalos por comas; Por ejemplo: Leche, Agua, Cereales
    El scrapeo se iniciará y una vez termine el primer término se irá introduciendo el scrapeo
    automáticamente en la base de datos y recargando la página se verá el scrapeo de dichos términos.
    También se cuenta con un formulario para introducir items de forma manual.
    Este formulario solo aceptará url de imágenes en los formatos típicos de imagen [.jpg, .jpeg, 
    .png, .gif]
# Video demostración
https://youtu.be/BJahiwIQeV4
