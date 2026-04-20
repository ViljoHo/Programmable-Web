FROM python:3.13-alpine
WORKDIR /opt/issueapi
COPY . .
RUN pip install ./issue_api/
RUN pip install gunicorn
CMD ["gunicorn", "-w", "3", "-b", "0.0.0.0", "issue_api:create_app()"]