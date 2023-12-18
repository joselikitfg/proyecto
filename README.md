# proyecto


## V1


### How to run it manually
```
docker pull python:3.11.6 --platform=linux/amd64

docker run --rm -it\
        --net=host \
        -v `pwd`:/home/joseliki \
        --workdir /home/joseliki \
        -e PYTHONPATH="/home/joseliki"\
        python:3.11.6 bash

pip3 install -r requirements.txt
python3 beautifulsoup_scrap.py
```

### One Line Execution
```
docker run --rm -it\
        --net=host \
        -v `pwd`:/home/joseliki \
        --workdir /home/joseliki \
        -e PYTHONPATH="/home/joseliki"\
        python:3.11.6 bash -c "cd v1 && pip3 install -r requirements.txt && python3 beautifulsoup_scrap.py"
```


