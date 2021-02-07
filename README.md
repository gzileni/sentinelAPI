
POST /api/v1/auth
POST /api/v1/process  

clientID        // 
clientSecret    //
base64          // (True or False) for client image or false to only buffer data to display image on PostMan
width           // 512px default
height          // 512px default
fromUTC         // from date format UTC (2018-12-28T00:00:00Z)
toUTC           // to date format UTC
data            // evalscript data

GET /api/v1/process/:data

## EVALSCRIPTS DATA

NO2         // S5P Nitrogen Dioxide (NO2)
NO22        // S5P Nitrogen Dioxide (NO2) script by Annamaria Luongo
SO2         // S5P Sulfur Dioxide (SO2)
HCHO        // S5P Formaldehyde (HCHO)
O3          // S5P Ozone (O3)
CH4         // S5P Methane (CH4)
AS1         // S5P Aerosol Index 340 and 380
AS2         // S5P Aerosol Index 354 and 388
CLOUD1      // S5P Cloud Base Height
CLOUD2      // S5P Cloud Base Pressure
CLOUD3      // S5P Cloud Optical Thickness
CLOUD4      // S5P Cloud Top Height
CLOUD5      // S5P Cloud Top Pressure
CLOUD6      // S5P Effective radiometric cloud fraction
CO          // (default) S5P CARBON Monoxide 