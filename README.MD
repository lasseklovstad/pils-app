## Fly 
### Config
[See config at](https://fly.io/docs/reference/configuration/)
## Setup
````bash
fly login
fly status
fly apps create pils-app
## Create volume where sqlite db is persisted
fly volumes create data
## Configure fly app
fly launch --no-deploy
## Deploy fly app
fly deploy

# https://fly.io/docs/networking/custom-domain/
## Add domains
fly certs add pils.gataersamla.no

# I domeneshop A record: pils.gataersamla.no -> ipv4
# I domeneshop AAAA record: pils.gataersamla.no -> ipv6
```