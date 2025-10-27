# 🚨 FIX: Form Data Issue - Step by Step Solution

## ❌ Your Current Problem
You're getting this error because you're sending **form data** instead of **JSON**:
```json
{
    "statusCode": 400,
    "message": [
        "categoryId should not be empty",
        "categoryId must be a string",
        "name should not be empty",
        "name must be a string",
        "title should not be empty",
        "title must be a string",
        "description must be a string",
        "formData should not be empty",
        "formData must be an object"
    ],
    "error": "Bad Request",
    "path": "/api/v1/vendors"
}
```

## ✅ Solution: Send JSON Instead of Form Data

### Step 1: Check Your Current Request Format

**❌ WRONG (What you're probably doing):**
```bash
# This sends form data - WRONG!
curl -X POST "http://localhost:10030/api/v1/vendors" \
  -H "Content-Type: multipart/form-data" \
  -F "categoryId=507f1f77bcf86cd799439011" \
  -F "name=Elite Wedding Photographers" \
  -F "title=Professional Photography Services"
```

**✅ CORRECT (What you should do):**
```bash
# This sends JSON - CORRECT!
curl -X POST "http://localhost:10030/api/v1/vendors" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "categoryId": "507f1f77bcf86cd799439011",
    "name": "Elite Wedding Photographers",
    "title": "Professional Photography Services",
    "description": "Professional wedding photography services",
    "formData": {
      "location": "Mumbai, Maharashtra",
      "pricing": {
        "starting": 25000,
        "premium": 75000
      }
    }
  }'
```

### Step 2: If Using Postman/Insomnia

**❌ WRONG Settings:**
- Body Type: `form-data` or `x-www-form-urlencoded`
- Content-Type: `multipart/form-data`

**✅ CORRECT Settings:**
- Body Type: `raw` → `JSON`
- Content-Type: `application/json`
- Headers: `Authorization: Bearer YOUR_JWT_TOKEN`

### Step 3: If Using JavaScript/Fetch

**❌ WRONG:**
```javascript
// This sends form data - WRONG!
const formData = new FormData();
formData.append('categoryId', '507f1f77bcf86cd799439011');
formData.append('name', 'Elite Wedding Photographers');

fetch('http://localhost:10030/api/v1/vendors', {
  method: 'POST',
  body: formData  // ❌ This sends form data
});
```

**✅ CORRECT:**
```javascript
// This sends JSON - CORRECT!
const vendorData = {
  categoryId: "507f1f77bcf86cd799439011",
  name: "Elite Wedding Photographers",
  title: "Professional Photography Services",
  description: "Professional wedding photography services",
  formData: {
    location: "Mumbai, Maharashtra",
    pricing: {
      starting: 25000,
      premium: 75000
    }
  }
};

fetch('http://localhost:10030/api/v1/vendors', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',  // ✅ JSON content type
    'Authorization': 'Bearer YOUR_JWT_TOKEN'
  },
  body: JSON.stringify(vendorData)  // ✅ JSON stringified body
});
```

### Step 4: If Using Python/Requests

**❌ WRONG:**
```python
# This sends form data - WRONG!
data = {
    'categoryId': '507f1f77bcf86cd799439011',
    'name': 'Elite Wedding Photographers'
}
response = requests.post('http://localhost:10030/api/v1/vendors', data=data)
```

**✅ CORRECT:**
```python
# This sends JSON - CORRECT!
import json

data = {
    'categoryId': '507f1f77bcf86cd799439011',
    'name': 'Elite Wedding Photographers',
    'title': 'Professional Photography Services',
    'description': 'Professional wedding photography services',
    'formData': {
        'location': 'Mumbai, Maharashtra',
        'pricing': {
            'starting': 25000,
            'premium': 75000
        }
    }
}

headers = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_JWT_TOKEN'
}

response = requests.post(
    'http://localhost:10030/api/v1/vendors', 
    data=json.dumps(data),  # ✅ JSON stringified
    headers=headers
)
```

## 🔍 How to Verify You're Sending JSON

### Test 1: Check Response Status
- **Form Data**: You get `400 Bad Request` with validation errors
- **JSON**: You get `401 Unauthorized` (validation passes, only JWT needed)

### Test 2: Check Request Headers
Make sure your request includes:
```
Content-Type: application/json
```

### Test 3: Check Request Body
Your body should look like this:
```json
{
  "categoryId": "507f1f77bcf86cd799439011",
  "name": "Elite Wedding Photographers",
  "title": "Professional Photography Services",
  "formData": {
    "location": "Mumbai, Maharashtra"
  }
}
```

**NOT like this:**
```
categoryId=507f1f77bcf86cd799439011&name=Elite Wedding Photographers&title=Professional Photography Services
```

## 🚀 Quick Test Command

Run this command to test if your setup is correct:

```bash
curl -X POST "http://localhost:10030/api/v1/vendors" \
  -H "Content-Type: application/json" \
  -d '{
    "categoryId": "507f1f77bcf86cd799439011",
    "name": "Test Vendor",
    "title": "Test Title",
    "formData": {
      "location": "Test Location"
    }
  }'
```

**Expected Result:**
```json
{"statusCode":401,"message":"Unauthorized","error":"Bad Request","path":"/api/v1/vendors"}
```

If you get this response, your JSON format is correct! You just need to add a valid JWT token.

## 🎯 Summary

The key issue is:
1. **You're sending form data** (multipart/form-data)
2. **API expects JSON** (application/json)
3. **Change your request format** to send JSON instead of form data
4. **Add JWT token** for authentication

Once you make these changes, the validation errors will disappear!
