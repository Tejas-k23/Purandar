# Add Property & Add Project Form Fields

This document lists the fields present in the Add Property and Add Project forms in the current frontend codebase.

## Add Property Form

Source: `src/pages/public/PostPropertyForm.jsx` and step components under `src/components/forms/post-property/`.

### Property Types

Residential types:
- Flat / Apartment
- Independent House / Villa
- Builder Floor
- Plot / Land
- 1 RK / Studio Apartment
- Serviced Apartment
- PG / Hostel
- Farmhouse
- Other

Commercial types:
- Office Space
- Shop / Showroom
- Commercial Land
- Warehouse / Godown
- Industrial Building
- Other

### Step 1: Basic Details

- intent (Sell, Rent / Lease, PG)
- category (Residential, Commercial)
- propertyType
- title
- contactDisplayMode (original, company, custom)
- useOriginalSellerContact
- displaySellerName (custom contact)
- displaySellerPhone (custom contact)
- displaySellerEmail (custom contact)
- whatsappNumber
- showWhatsappButton (true/false)
- responseTime
- whatsappDisplayMode (original, company, custom)
- useCustomWhatsappDetails
- customWhatsappNumber (custom WhatsApp)

### Step 2: Location Details

- city
- locality
- subLocality
- landmark
- flatNo (residential only)
- totalFloors (not for plots)
- floorNo (not for plots or independent house)
- latitude (via map picker)
- longitude (via map picker)

### Step 3: Property Profile

Shared pricing fields:
- price (sell / rent / pg)
- priceNegotiable
- securityDeposit (rent / pg)
- maintenance (rent)
- mealsIncluded (pg)

Flat / Apartment / Builder Floor / House:
- bedrooms
- bathrooms
- balconies
- totalArea
- carpetArea
- areaUnit
- furnishing
- availability
- possessionMonth (if under construction)
- possessionYear (if under construction)
- propertyAge
- ownership
- tenantPreference (rent + apartment types)

House specific:
- plotArea
- floorsInProperty

Builder Floor specific:
- plotArea

Plot / Land or Commercial Land:
- plotArea
- plotLength
- plotWidth
- ownership
- boundaryWall
- openSides
- constructionDone
- areaUnit

Commercial (Office Space, Shop / Showroom):
- carpetArea
- superBuiltUpArea
- areaUnit
- furnishing
- washroom
- personalWashroom
- pantry
- maintenance
- coveredParking
- openParking

Warehouse / Industrial:
- plotArea
- floorArea
- areaUnit
- warehouseHeight
- loadingUnloading

### Step 4: Photos & Media

- photos (up to 5, JPG/PNG/WebP)
- videoFile (optional)
- videoUrl (YouTube link, optional)

### Step 5: Amenities & Description

- societyAmenities
- flatAmenities
- facing
- overlooking
- waterSupply
- gatedCommunity
- description

## Add Project Form

Source: `src/pages/public/AddProjectForm.jsx` and `src/utils/projectTypeConfig.js`.

### Project Types

- Residential
- Commercial
- Mixed Use
- Plots

### Section 1: Basic Details

- projectName
- slug (auto-generated from projectName)
- projectType
- developerName
- reraNumber
- projectStatus
- launchDate
- possessionDate

### Section 2: Location Details

- address
- city
- area
- pincode
- mapLink (URL or coordinates)
- latitude (via map picker)
- longitude (via map picker)

### Section 3: Pricing & Configurations

- startingPrice
- endingPrice
- priceUnit (Lakh, Crore)
- configurationTypes (from project type profile)
- extraConfigurations (custom entries)
- areaRange
- pricePerSqFt (Plots)
- plotUnit (Plots)
- minPlotSize (Plots)
- maxPlotSize (Plots)
- totalPlots (Plots, optional)

### Section 4: Amenities

- amenities (from project type profile)

### Section 5: Project Media

- projectImages (up to 5)
- brochure (PDF)
- videoFile (optional upload)
- videoUrl (YouTube URL)

### Section 6: Description

- shortDescription
- detailedDescription

### Section 7: Additional Details

- totalTowers
- totalUnits
- totalFloors
- openSpace
- approvalAuthority

### Section 8: Contact Details

- contactPersonName
- phoneNumber
- email
- contactDisplayMode (original, company, custom)
- useCustomContactDetails
- customContactName (if custom)
- customContactPhone (if custom)
- customContactEmail (if custom)
- whatsappNumber
- showWhatsappButton (true/false)
- responseTime
- whatsappDisplayMode (original, company, custom)
- useCustomWhatsappDetails
- customWhatsappNumber (if custom)

### Other Project Fields in State

- tags
- visible
- featuredOnHome
