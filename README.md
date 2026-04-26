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
pip install -e ./issue_api/

# Initialize database (creates tables and adds default report types)
flask --app=issue_api init-db

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
pip install -e ./issue_api/[test]

# Run tests
pytest

# Run test coverage
pytest --cov=issue_api

# Run linter
pylint issue_api
pylint report_ranker
```

## Deployment

### Environment
For environment some linux based server is needed. We are using Hetzeners VPS and for OS Ubuntu server 24.04

Prerequisites:
- Docker/Docker compose
- venv
- own domain

### How to the setup environment
```
# Clone the source code
cd /opt
git clone https://github.com/ViljoHo/Programmable-Web.git

# Create venv
cd /opt/Programmable-Web
python3 -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install ./issue_api/

# Initialize database
flask --app=issue_api init-db

# Create admin user. The api key is shown only one time so save it carefully
flask --app=issue_api create-admin-user

```

### Certificates
This project uses a pre-built *[Certbot](https://hub.docker.com/r/certbot/certbot)* Docker image for certificate management.

#### First-Time Deployment
Since Nginx cannot start if it points to non-existent SSL certificates, it has to be created manually

1. **Start Nginx in setup mode:**
   ```bash
   docker compose -f docker-compose.yml -f docker-compose.setup.yml up -d nginx
   ```

2. **Request the certificate:**
   Replace the email and domain with correct ones.
   ```bash
   docker run --rm \
     -v "$(pwd)/certbot/conf:/etc/letsencrypt" \
     -v "$(pwd)/certbot/www:/var/www/certbot" \
     certbot/certbot certonly --webroot --webroot-path=/var/www/certbot \
     -d domain.fi --email example@email.com --agree-tos --no-eff-email
   ```

3. **Switch to Production mode:**
   Stop the setup container and start whole stack.
   ```bash
   docker compose down
   docker compose up -d
   ```

### Running and stopping the application
```
# Start the app on the projects root folder
docker compose up -d

# Stop the app
docker compose down
```

## API Verification
Once the application is running, you can verify it by visiting the Swagger UI (API Documentation) at the /apidocs/ endpoint. In our case:
- **URL:** `https://projects.issueapi.viljoholma.fi/apidocs/`
