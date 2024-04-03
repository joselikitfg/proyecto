ARG PYTHON_VERSION=3.11
ARG DEBIAN_VERSION=bookworm
ARG CHROME_VERSION=latest

# Usar Ubuntu 22.04 como imagen base
FROM --platform=amd64 python:${PYTHON_VERSION}-${DEBIAN_VERSION}
# Definir argumentos para las versiones de Python y Chrome


# Configurar la zona horaria
ENV DEBIAN_FRONTEND=noninteractive
ENV DEBCONF_NONINTERACTIVE_SEEN=true
ENV TZ=Europe/Madrid
# RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone


RUN apt update -y && apt-get install -y \
    wget gnupg2
#     gnupg \
#     software-properties-common \
#     python3-pip \
#     curl \
#     build-essential \
#     libssl-dev \
#     zlib1g-dev \
#     libbz2-dev \
#     libreadline-dev \
#     libsqlite3-dev \
#     llvm \
#     libncurses5-dev \
#     libncursesw5-dev \
#     xz-utils \
#     tk-dev \
#     libffi-dev \
#     liblzma-dev 


# RUN curl -O https://www.python.org/ftp/python/${PYTHON_VERSION}/Python-${PYTHON_VERSION}.tar.xz \
#     && tar -xf Python-${PYTHON_VERSION}.tar.xz \
#     && cd Python-${PYTHON_VERSION} \
#     && ./configure --enable-optimizations \
#     && make -j 8 \
#     && make altinstall


# RUN wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | apt-key add - \
#     && echo 'deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main' > /etc/apt/sources.list.d/google-chrome.list \
#     && apt-get update && apt-get install -y google-chrome-stable

# RUN CHROME_VERSION=google-chrome-stable /bin/sh -c wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add -   && echo "deb http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google-chrome.list   && apt-get update -qqy   && apt-get -qqy install     ${CHROME_VERSION:-google-chrome-stable}   && rm /etc/apt/sources.list.d/google-chrome.list   && rm -rf /var/lib/apt/lists/* /var/cache/apt/*


# RUN apt-get clean \
#     && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/* Python-${PYTHON_VERSION}.tar.xz

# RUN apt-get update && apt-get install -y wget gnupg2 \
#     && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | gpg --dearmor -o /usr/share/keyrings/google-chrome-archive-keyring.gpg \
#     && echo "deb [signed-by=/usr/share/keyrings/google-chrome-archive-keyring.gpg] http://dl.google.com/linux/chrome/deb/ stable main" | tee /etc/apt/sources.list.d/google-chrome.list \
#     && apt-get update && apt-get install -y google-chrome-stable \
#     && rm /etc/apt/sources.list.d/google-chrome.list \
#     && rm -rf /var/lib/apt/lists/* /var/cache/apt/*

RUN apt-get update 
RUN apt-get install -y wget gnupg2 unzip
# RUN echo $(dpkg --print-architecture)
# RUN curl -sSL https://dl.google.com/linux/direct/google-chrome-stable_current_$(dpkg --print-architecture).deb -o /tmp/chrome.deb
# RUN apt-get -y install /tmp/chrome.deb
ENV CHROMIUM_VERSION 1002910
RUN curl "https://www.googleapis.com/download/storage/v1/b/chromium-browser-snapshots/o/Linux_x64%2F$CHROMIUM_VERSION%2Fchrome-linux.zip?generation=1652397748160413&alt=media" > /tmp/chromium.zip 
RUN unzip /tmp/chromium.zip -d /tmp/
RUN mv /tmp/chrome-linux/ /opt/chrome 
RUN curl "https://www.googleapis.com/download/storage/v1/b/chromium-browser-snapshots/o/Linux_x64%2F$CHROMIUM_VERSION%2Fchromedriver_linux64.zip?generation=1652397753719852&alt=media" > /tmp/chromedriver_linux64.zip 
RUN unzip /tmp/chromedriver_linux64.zip -d /tmp/ 
RUN mv /tmp/chromedriver_linux64/chromedriver /opt/chromedriver

WORKDIR /app
COPY . .


RUN pip3 install --no-cache-dir -r requirements.txt
CMD [ "python", "Alcampo_scrapper.py"]  
# CMD [ "python3", "-m" , "flask", "run", "--host=0.0.0.0"]  



FROM public.ecr.aws/lambda/python:3.12 as builder_stage

# Chrome version from: https://chromereleases.googleblog.com/
ENV CHROMIUM_VERSION 124.0.6367.18
ENV CHROME_DRIVER_VERION 124.0.6367.18

RUN dnf install -y unzip && \
    curl -Lo "/tmp/chromedriver-linux64.zip" "https://storage.googleapis.com/chrome-for-testing-public/123.0.6312.86/linux64/chromedriver-linux64.zip" && \
    curl -Lo "/tmp/chrome-linux64.zip" "https://storage.googleapis.com/chrome-for-testing-public/123.0.6312.86/linux64/chrome-linux64.zip" && \
    unzip /tmp/chromedriver-linux64.zip -d /opt/ && \
    unzip /tmp/chrome-linux64.zip -d /opt/


FROM public.ecr.aws/lambda/python:3.12

RUN dnf install -y atk cups-libs gtk3 libXcomposite alsa-lib \
    libXcursor libXdamage libXext libXi libXrandr libXScrnSaver \
    libXtst pango at-spi2-atk libXt xorg-x11-server-Xvfb \
    xorg-x11-xauth dbus-glib dbus-glib-devel nss mesa-libgbm
COPY . .

RUN pip install --no-cache-dir -r requirements.txt
COPY --from=builder_stage /opt/chrome-linux64 /opt/chrome
COPY --from=builder_stage /opt/chromedriver-linux64 /opt/

# RUN mv Alcampo_scrapper.py main.py
# CMD [ "app.lambda_handler" ]
CMD [ "newapp.lambda_handler" ]
