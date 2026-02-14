import json
import os

SCHEMA_FOLDER_PATH = os.path.join(os.path.dirname(__file__), "static/schema/")

def load_json_schema(file_name: str):
    schema_path = os.path.join(SCHEMA_FOLDER_PATH, file_name)
    with open(schema_path) as file:
        return json.load(file)
