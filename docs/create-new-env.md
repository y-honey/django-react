# Create new environment stage

## Variables:
- `<ENV_STAGE_NAME>` – change this to the name of your environment (e.g. `dev`, `staging`, `qa`)

## Create a new env configuration file
```sh
make create-env
```

This command will create following file named `.awsboilerplate.<ENV_STAGE_NAME>.json`:
```json
{
  "hostedZone": {
    "id": "<HOSTED_ZONE_ID>",
    "name": "<HOSTED_ZONE_NAME>"
  },
  "domains": {
    "adminPanel": "admin.<DOMAIN_NAME>",
    "api": "api.<DOMAIN_NAME>",
    "webApp": "app.<DOMAIN_NAME>",
    "www": "www.<DOMAIN_NAME>"
  }
}
```

## Deploy infrastructure of the new environment

```shell script
make deploy-stage-infra ENV_STAGE=<ENV_STAGE_NAME>
```

This command will deploy
* Main CDK stack
* CI CDK stack
* Helper functions
