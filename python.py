import requests
import json
# Replace with your IBM API Key
API_KEY = "tLVVR7ZZd4TvXn7GHLvpIvZVLA19V9KY7XtjSamSSjm"
# Watsonx.ai Endpoint (Dallas → us-south)
URL = "https://eu-gb.ml.cloud.ibm.com/ml/v1/text/generation?version=2023-05-29"

# Step 1: Get IAM Token
def get_iam_token(api_key):
    iam_url = "https://iam.cloud.ibm.com/identity/token"
    headers = {"Content-Type": "application/x-www-form-urlencoded"}
    data = {
        "grant_type": "urn:ibm:params:oauth:grant-type:apikey",
        "apikey": api_key
    }
    response = requests.post(iam_url, headers=headers, data=data)
    response.raise_for_status()
    return response.json()["access_token"]

# Step 2: Generate Email Draft
def generate_email(prompt):
    token = get_iam_token(API_KEY)
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {token}"
    }
    payload = {
        "input": prompt,
        "parameters": {
            "decoding_method": "greedy",
            "max_new_tokens": 300,
            "repetition_penalty": 1.1
        },
        "model_id": "ibm/granite-13b-instruct-v2",   # updated model
        "project_id": "575716e1-6d87-4500-8aa0-8561883ab5f0"  # Replace with your Watsonx.ai Project ID
    }
    response = requests.post(URL, headers=headers, json=payload)
    response.raise_for_status()  # helps debug if API errors out
    return response.json()

# Example: Drafting an email
if __name__ == "__main__":
    prompt = "Draft a professional email to inform students about assignment submission deadlines."
    result = generate_email(prompt)

    print("Generated Email Draft:\n")
    # Watsonx.ai responses are inside result["results"][0]["generated_text"]
    if "results" in result:
        print(result["results"][0]["generated_text"])
    else:
        print(json.dumps(result, indent=2))
