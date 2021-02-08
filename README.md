
# SENTINEL5P API
Sentinel API permette di ricevere da Sentinel HUB dati da [Sentinel-5P by ESA](http://www.tropomi.eu/data-products/level-2-products), satellite per misurare la qualità dell'aria dallo spazio.

## INSTALLATION
```
    git clone https://github.com/gzileni/sentinelAPI.git
    cd sentinelAPI
    yarn install
```

### CREATE .ENV FILE
```
    cd sentinelAPI
    nano .env    
```

## INSTANCE ID
by [SENTINEL HUB DASHBOARD](https://services.sentinel-hub.com/)

![dashboard1](./docs/img/dashboard1.png)

- INSTANCE_ID     =   YOUR INSTANCE ID

## AUTHENTICATION
![dashboard2](./docs/img/dashboard2.png)

- CLIENT_ID       =   YOUR CLIENT ID
- CLIENT_SECRET   =   YOUR CLIENT SECRET

## RUN
```
yarn start
```

## DOCKER

## GET TOKEN

**POST /api/v1/auth**

#### Parametri
```
clientID        // 
clientSecret    //
```

## Get Image S5P
Restituisce l'immagine del satellite Sentinel da visualizzare sul client in formato PNG

**POST /api/v1/process**

#### Parametri
```
clientID        // 
clientSecret    // 
base64          // (True or False) for client image or false to only buffer data to display image on PostMan
width           // 512px default
height          // 512px default
fromUTC         // from date format UTC (2018-12-28T00:00:00Z)
toUTC           // to date format UTC
evalscript      // evalscript data
```

## Get EvalScript
Restituisce lo script personalizzato per l'elaborazione dei dati satellitari
```
GET /api/v1/process?evalscript=
```

## Evalscipts
Gli script personalizzati [EVALSCRPT V3](https://docs.sentinel-hub.com/api/latest/evalscript/v3/) sono codici Javascript richiesti per elaborare i dati satellitari da Sentinel Hub e quali valori il servizio restituirà.
Nei parametri dei metodi delle richieste HTTP si possono specificare una serie di script come i seguenti:

- NO2      [Nitrogen Dioxide](http://www.tropomi.eu/data-products/nitrogen-dioxide)
- NO22     [Nitrogen Dioxide (NO2) script by Annamaria Luongo](https://custom-scripts.sentinel-hub.com/sentinel-5p/nitrogen_dioxide_tropospheric_column/)
- SO2      [Sulfur Dioxide](http://www.tropomi.eu/data-products/sulphur-dioxide)
- HCHO     [Formaldehyde](http://www.tropomi.eu/data-products/formaldehyde)
- O3       [Ozone](http://www.tropomi.eu/data-products/total-ozone-column)
- CH4      [Methane](http://www.tropomi.eu/data-products/methane)
- AS1      [UV (Ultraviolet) Aerosol Index calculated based on wavelengths of 340 nm and 380 nm](http://www.tropomi.eu/data-products/uv-aerosol-index)
- AS2      [UV (Ultraviolet) Aerosol Index calculated based on wavelengths of 354 nm and 388 nm](http://www.tropomi.eu/data-products/uv-aerosol-index)
- CLOUD1   [Cloud base height](http://www.tropomi.eu/data-products/carbon-monoxide)
- CLOUD2   [Cloud base pressure](http://www.tropomi.eu/data-products/carbon-monoxide)
- CLOUD3   [Cloud optical thickness](http://www.tropomi.eu/data-products/carbon-monoxide)
- CLOUD4   [Cloud top height](http://www.tropomi.eu/data-products/carbon-monoxide)
- CLOUD5   [Cloud top pressure](http://www.tropomi.eu/data-products/carbon-monoxide)
- CLOUD6   [Effective radiometric cloud fraction](http://www.tropomi.eu/data-products/carbon-monoxide)
- CO        (default) [CARBON Monoxide](http://www.tropomi.eu/data-products/carbon-monoxide)

## Error Codes
...