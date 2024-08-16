#!/bin/bash

# Set the API URL
API_URL="${SITE_URL}/users"

# Fetch all users
echo "Fetching all users..."
users=$(curl -s -X GET "$API_URL")

# Check if users were fetched successfully
if [ -z "$users" ]; then
  echo "Failed to fetch users."
  exit 1
fi

# Process each user to generate a composite key and update the user
echo "Processing and updating users..."
echo "$users" | jq -c '.[]' | while read -r user; do
  user_id=$(echo "$user" | jq -r '.id')
  first_name=$(echo "$user" | jq -r '.firstName')
  last_name=$(echo "$user" | jq -r '.lastName')
  email=$(echo "$user" | jq -r '.email')
  composite_key=$(echo "${first_name}_${last_name}_${email}" | tr '[:upper:]' '[:lower:]')

  # Update the user with the new composite key
  updated_user=$(echo "$user" | jq --arg compositeKey "$composite_key" '. + {compositeKey: $compositeKey}')
  update_response=$(curl -s -H "Content-Type: application/json" -X PUT -d "$updated_user" "$API_URL/$user_id")

  # Check if the update was successful
  if echo "$update_response" | jq -e 'has("error")' > /dev/null; then
    echo "Failed to update user $user_id: $(echo "$update_response" | jq -r '.error')"
  else
    echo "Successfully updated user $user_id"
  fi
done

echo "All users have been processed."