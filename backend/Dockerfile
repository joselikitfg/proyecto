FROM python:3.11

WORKDIR /app

COPY src/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY src/ .

CMD [ "python3", "-m" , "flask", "run", "--host=0.0.0.0"]
