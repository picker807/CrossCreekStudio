import os
import json

def generate_json(root_directory, output_file):
    items = []
    item_id = 1  # Initialize ID counter
    
    for subdir, dirs, files in os.walk(root_directory, followlinks=True):
        for filename in files:
            # Construct the file path
            file_path = os.path.join(subdir, filename)
            if os.path.isfile(file_path):
                # Remove file extension
                name_without_extension, _ = os.path.splitext(filename)
                # Replace underscores with spaces and capitalize each word
                formatted_name = ' '.join(word.capitalize() for word in name_without_extension.split('_'))
                
                # Extract relative path of file to use in imageUrl
                relative_path = os.path.relpath(file_path, root_directory)
                # Get the parent folder name, capitalize it, and prepend with "GalleryCategory."
                parent_folder = os.path.basename(os.path.dirname(file_path)).capitalize()
                #category = f"GalleryCategory.{parent_folder}"
                item = {
                    "id": str(item_id),  # Convert ID to string
                    "name": formatted_name,
                    "description": "A description here",  # Static or generate based on file
                    "imageUrl": os.path.join("../../assets/images", relative_path.replace("\\", "/")),
                    "category": parent_folder  # Dynamically set based on parent folder
                }
                items.append(item)
                item_id += 1  # Increment ID for the next item
    
    with open(output_file, 'w') as f:
        json.dump(items, f, indent=4)

# Use the provided directory path from the user input
root_directory_path = '/Users/thor/Documents/GitHub/CrossCreekCreates/src/assets/images'
output_json_file = 'MOCK_GALLERY_DATA.json'

generate_json(root_directory_path, output_json_file)

