FROM python:3.13-alpine
WORKDIR /opt/app

COPY issue_api/ ./issue_api/

RUN pip install --no-cache-dir ./issue_api/

COPY protos/ ./protos/
COPY auxiliary_service/ ./auxiliary_service/

CMD ["python", "auxiliary_service/server.py"]
