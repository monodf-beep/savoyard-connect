UPDATE community_settings 
SET value = '"pk.eyJ1IjoiZnJhbmNrMjUiLCJhIjoiY21rZ29vejhoMDdldTNlcW12M3B1bDd4MCJ9.nAw7nwyUsx9swHRBS8o4rQ"'::jsonb,
    updated_at = now()
WHERE key = 'mapbox_token';