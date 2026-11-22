# Autofunds feed corrections (2026-11-22)

The website never guesses a specification. When the Autofunds feed
contradicts the vehicle's own data (VIN-decoded options list, model name or
trim), that field is left blank on the vehicle page and recorded in
`inventory.specs->'conflicts'`. Fixing the entry in Autofunds fills it in on
the next nightly sync (07:00 UTC); nothing needs to change on the website.

Generated from the live inventory (83 active vehicles). Re-run the query at
the bottom to get the current list.

## Transmission: feed says Automatic, options list says 6-speed manual (6)

Check the vehicle; if it is a manual, set Transmission to manual in Autofunds.

| Vehicle | Stock # | VIN | Evidence |
|---|---|---|---|
| 2018 Dodge Challenger T/A Plus RWD | MZR192711 | 2C3CDZBT5JH192711 | options: 6-Speed Manual |
| 2020 Honda Civic Si Coupe Manual | MZR752575 | 2HGFC3A58LH752575 | trim "Manual"; options: 6-Speed Manual |
| 2022 Jeep Gladiator Willys 4x4 | MZR117512 | 1C6HJTAG4NL117512 | options: 6-Speed Manual |
| 2022 Jeep Wrangler Unlimited Rubicon 4x4 | MZR248575 | 1C4HJXFN6NW248575 | options: 6-Speed Manual |
| 2012 Jeep Wrangler Unlimited 4WD 4dr Sport | MZR174156 | 1C4HJWDG3CL174156 | options: 6-Speed Manual |
| 2020 Jeep Wrangler Unlimited Willys Sport 4x4 | MZR243894 | 1C4HJXDG7LW243984 | options: 6-Speed Manual |

## Fuel: feed says Diesel, options list says Gasoline (2)

| Vehicle | Stock # | VIN | Evidence |
|---|---|---|---|
| 2021 GMC Yukon 4WD 4dr Denali | MZR290552 | 1GKS2DKL7MR290552 | options: Gasoline (6.2L V8) |
| 2022 Jeep Gladiator Willys 4x4 | MZR117512 | 1C6HJTAG4NL117512 | options: Gasoline (3.6L V6) |

## Body style: feed contradicts the model/trim name (3)

| Vehicle | Stock # | VIN | Feed | Trim says |
|---|---|---|---|---|
| 2023 Honda Accord Hybrid Sport-L Sedan | MZR049083 | 1HGCY2F74PA049083 | SUV | Sedan |
| 2018 Mercedes-Benz CLA 250 4MATIC Coupe | MZR630736 | WDDSJ4GBXJN630736 | Sedan | Coupe |
| 2022 Porsche Cayenne Platinum Edition Coupe AWD | MZRA49575 | WP1BA2AY2NDA49575 | SUV | Coupe |

The Accord Hybrid is currently left out of the SUV filter because of this.
(The Cayenne Coupe and the CLA are marketed as coupes but are an SUV and a
four-door sedan respectively — pick the body style you want shoppers to
filter by; either fixes the conflict.)

## Possible typo: stock number vs VIN (1)

Stock numbers follow `MZR` + the VIN's last six characters for 82 of 83
vehicles. One does not — digits look transposed in one of the two:

| Vehicle | Stock # | VIN (last 6) |
|---|---|---|
| 2020 Jeep Wrangler Unlimited Willys Sport 4x4 | MZR24**38**94 | 1C4HJXDG7LW24**39**84 |

Check the VIN on the vehicle (windshield/door jamb). A wrong VIN also breaks
history-report links and the listing's structured data.

## Query

```sql
SELECT year, make, model, trim, stock_number, vin, c->>'field' AS field, c->'values' AS sources
  FROM public.inventory, jsonb_array_elements(coalesce(specs->'conflicts', '[]'::jsonb)) c
 WHERE status = 'active' AND NOT is_sold
 ORDER BY c->>'field', make, model, year;
```
