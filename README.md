# PWP SPRING 2026
# PROJECT NAME
# Group information
* Student 1. Viljo Holma, Viljo.Holma@student.oulu.fi
* Student 2. Kasperi Ervasti, Kasperi.Ervasti@student.oulu.fi
* Student 3. Heikki Sulin, Heikki.Sulin@student.oulu.fi
* Student 4. Kimmo Leukkunen, Kimmo.Leukkunen@student.oulu.fi

__Remember to include all required documentation and HOWTOs, including how to create and populate the database, how to run and test the API, the url to the entrypoint, instructions on how to setup and run the client, instructions on how to setup and run the axiliary service and instructions on how to deploy the api in a production environment__


## Application setup


**Note:** All commands below should be run from the project root folder.


## Installation
All dependencies are listed in `pyproject.toml`. The database is a SQLite database (version 3.43.1).

**Note:** All commands below should be run from the project root folder.
### Production
```
# Install production dependencies
pip install -e .

# Reset database if needed
flask --app=issue_api reset-db

# Run the app
flask --app=issue_api run

# Run the app in debug mode
flask --app=issue_api --debug run
```

### Tests
```
# Install additional test dependencies
pip install -e .[test]

# Run tests
pytest
```

### Testing skip
