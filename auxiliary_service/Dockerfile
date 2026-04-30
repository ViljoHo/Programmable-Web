FROM python:3.13-alpine
WORKDIR /opt/app

COPY protos/ ./protos/

COPY report_ranker/ ./report_ranker/

RUN pip install --no-cache-dir ./report_ranker/

CMD ["python", "-m", "report_ranker.server"]
