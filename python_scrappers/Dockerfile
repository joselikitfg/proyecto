FROM public.ecr.aws/lambda/python:3.12 AS builder_stage

# Chrome version from: https://chromereleases.googleblog.com/
ENV CHROME_VERSION 124.0.6367.95
ENV CHROME_DRIVER_VERION 124.0.6367.95

RUN dnf install -y unzip && \
    curl -Lo "/tmp/chromedriver-linux64.zip" "https://storage.googleapis.com/chrome-for-testing-public/${CHROME_VERSION}/linux64/chromedriver-linux64.zip" && \
    curl -Lo "/tmp/chrome-linux64.zip" "https://storage.googleapis.com/chrome-for-testing-public/${CHROME_DRIVER_VERION}/linux64/chrome-linux64.zip" && \
    unzip /tmp/chromedriver-linux64.zip -d /opt/ && \
    unzip /tmp/chrome-linux64.zip -d /opt/


FROM public.ecr.aws/lambda/python:3.12 AS executable_stage


WORKDIR ${LAMBDA_TASK_ROOT}
COPY . .

RUN dnf install -y atk cups-libs gtk3 libXcomposite alsa-lib \
    libXcursor libXdamage libXext libXi libXrandr libXScrnSaver \
    libXtst pango at-spi2-atk libXt xorg-x11-server-Xvfb \
    xorg-x11-xauth dbus-glib dbus-glib-devel nss mesa-libgbm \
    && dnf clean all \
    && pip install --no-cache-dir -r requirements.txt

COPY --from=builder_stage /opt/chrome-linux64 /opt/chrome
COPY --from=builder_stage /opt/chromedriver-linux64 /opt/

CMD [ "src.app.lambda_handler" ]
