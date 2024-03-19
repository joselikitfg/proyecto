# Usar Ubuntu 22.04 como imagen base
FROM --platform=linux/amd64 ubuntu:22.04

# Definir argumentos para las versiones de Python y Chrome
ARG PYTHON_VERSION=3.11.6
ARG CHROME_VERSION=latest

# Configurar la zona horaria
ENV DEBIAN_FRONTEND=noninteractive
ENV TZ=Europe/Madrid
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# Instalar dependencias necesarias para Chrome y Python
RUN apt-get update -y && apt-get install -y \
    wget \
    gnupg \
    software-properties-common \
    python3-pip \
    curl \
    build-essential \
    libssl-dev \
    zlib1g-dev \
    libbz2-dev \
    libreadline-dev \
    libsqlite3-dev \
    llvm \
    libncurses5-dev \
    libncursesw5-dev \
    xz-utils \
    tk-dev \
    libffi-dev \
    liblzma-dev 

# Instalar Python
RUN curl -O https://www.python.org/ftp/python/${PYTHON_VERSION}/Python-${PYTHON_VERSION}.tar.xz \
    && tar -xf Python-${PYTHON_VERSION}.tar.xz \
    && cd Python-${PYTHON_VERSION} \
    && ./configure --enable-optimizations \
    && make -j 8 \
    && make altinstall

# Instalar Google Chrome
RUN wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && echo 'deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main' > /etc/apt/sources.list.d/google-chrome.list \
    && apt-get update && apt-get install -y google-chrome-stable

# Limpiar archivos temporales y cachés
RUN apt-get clean \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/* Python-${PYTHON_VERSION}.tar.xz

# Copiar el script de Python y el archivo de requisitos al contenedor
WORKDIR /app
COPY . .

# Instalar las dependencias de Python
RUN pip3 install --no-cache-dir -r requirements.txt
ENTRYPOINT ["python", "./Alcampo_scrapper.py"]
