# How to run the auxiliary service

```bash
pip install ./issue_api/
cd ./auxiliary_service/
python server.py
```

This will start the service on port 50051. It must be running on the same machine as the API, as the connection uses `localhost` as address.
