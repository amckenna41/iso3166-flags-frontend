- [ ] When clicking on an area of the map use reverse geoencoding to get its subdivision code 

    @staticmethod
    def reverse_geocode(lat: float, lon: float) -> Optional[str]:
        """
        Given a latitude and longitude, return the ISO 3166-2 subdivision code using OSM Nominatim.
        Parameters
        ==========
        lat : float
            Latitude
        lon : float
            Longitude
        Returns
        =======
        Optional[str]:
            The ISO 3166-2 subdivision code if found, else None.
        """
        url = "https://nominatim.openstreetmap.org/reverse"
        params = {
            "format": "json",
            "lat": lat,
            "lon": lon,
            "zoom": 10,
            "addressdetails": 1
        }
        headers = {"User-Agent": "iso3166-2-reverse-geocoder/1.0 (contact: you@example.com)"}
        try:
            resp = requests.get(url, params=params, headers=headers, timeout=15)
            resp.raise_for_status()
            data = resp.json()
            # Try to extract ISO 3166-2 code from address or extratags
            code = None
            if "address" in data:
                # Some places have 'ISO3166-2' in extratags, or 'state_code', 'county_code', etc.
                extratags = data.get("extratags", {})
                code = extratags.get("ISO3166-2")
                if not code:
                    # Try state_code, county_code, etc.
                    for k in ["state_code", "county_code", "region_code"]:
                        if k in extratags:
                            code = extratags[k]
                            break
            return code
        except Exception as e:
            print(f"Error in reverse geocoding for lat={lat}, lon={lon}: {e}")
            return None

- [ ] - [ ] In the front-end demo, have a search bar, that uses AI to allow text-like semantic search e.g:
  - "Spanish regions near the coast"
  - "Find subdivisions with 'mountain' in local name"
  - "Regions in Asia with population > 10M"

- [ ] Provide some validation or automation around ensuring the latest version of lipis/flag-icons and REST countries API.
- [x] In the Country card on the top right, add left and right arrows allowing you to filter to the left and right country.
- [ ] When clicking to the right and left within the subdivision cards, the page should go to the top of the subdivision.
- [x] The About button isnt working.
- [x] Clicking on a country should highlght it.
- [ ] Reorder the csv and json export.