# Vendor Creation API - Complete Guide

## ❌ Common Mistake: Sending Form Data Instead of JSON

Many developers make the mistake of sending data as **multipart form data** instead of **JSON**. This causes validation errors.

## ✅ Correct Approach: Send JSON Data

### Key Requirements:
1. **Content-Type**: `application/json` (NOT `multipart/form-data`)
2. **Request Body**: JSON object (NOT form fields)
3. **Authentication**: Valid JWT token required
4. **Required Fields**: `categoryId`, `name`, `title`, `formData`

---

## 📋 Complete Request Examples

### 1. Using cURL (Command Line)

```bash
curl -X POST "http://localhost:10030/api/v1/vendors" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "categoryId": "507f1f77bcf86cd799439011",
    "name": "Elite Wedding Photographers",
    "title": "Professional Photography Services",
    "description": "Professional wedding photography services with years of experience",
    "imageUrl": "/uploads/vendors/vendor_1234567890_abc123.jpg",
    "formData": {
      "location": "Mumbai, Maharashtra",
      "experience": 5,
      "pricing": {
        "starting": 25000,
        "premium": 75000
      },
      "services": [
        "Wedding Photography",
        "Pre-wedding Shoot",
        "Candid Photography"
      ],
      "equipment": [
        "DSLR Camera",
        "Drone",
        "Lighting Equipment"
      ],
      "contactDetails": {
        "phone": "+91-9876543210",
        "email": "contact@elitephotographers.com",
        "website": "www.elitephotographers.com"
      },
      "availability": {
        "weekdays": true,
        "weekends": true,
        "advance_booking_days": 30
      },
      "portfolio": [
        "image1.jpg",
        "image2.jpg",
        "video1.mp4"
      ],
      "packages": [
        {
          "name": "Basic Package",
          "price": 25000,
          "description": "4-hour photography session",
          "features": [
            "200 edited photos",
            "Online gallery",
            "Basic album"
          ]
        },
        {
          "name": "Premium Package",
          "price": 75000,
          "description": "Full day photography with videography",
          "features": [
            "500 edited photos",
            "Cinematic video",
            "Premium album",
            "Online gallery"
          ]
        }
      ],
      "certifications": [
        "Professional Photography Diploma"
      ],
      "languages": [
        "Hindi",
        "English",
        "Marathi"
      ],
      "coverage_areas": [
        "Mumbai",
        "Pune",
        "Nashik"
      ],
      "business_hours": {
        "start": "09:00",
        "end": "21:00"
      },
      "team_size": 3,
      "years_in_business": 8
    },
    "enterpriseId": "507f1f77bcf86cd799439012",
    "enterpriseName": "Acme Corporation"
  }'
```

### 2. Using Postman/Insomnia

**Headers:**
```
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN
```

**Body (Raw JSON):**
```json
{
  "categoryId": "507f1f77bcf86cd799439011",
  "name": "Elite Wedding Photographers",
  "title": "Professional Photography Services",
  "description": "Professional wedding photography services with years of experience",
  "imageUrl": "/uploads/vendors/vendor_1234567890_abc123.jpg",
  "formData": {
    "location": "Mumbai, Maharashtra",
    "experience": 5,
    "pricing": {
      "starting": 25000,
      "premium": 75000
    },
    "services": [
      "Wedding Photography",
      "Pre-wedding Shoot",
      "Candid Photography"
    ],
    "equipment": [
      "DSLR Camera",
      "Drone",
      "Lighting Equipment"
    ],
    "contactDetails": {
      "phone": "+91-9876543210",
      "email": "contact@elitephotographers.com",
      "website": "www.elitephotographers.com"
    },
    "availability": {
      "weekdays": true,
      "weekends": true,
      "advance_booking_days": 30
    },
    "portfolio": [
      "image1.jpg",
      "image2.jpg",
      "video1.mp4"
    ],
    "packages": [
      {
        "name": "Basic Package",
        "price": 25000,
        "description": "4-hour photography session",
        "features": [
          "200 edited photos",
          "Online gallery",
          "Basic album"
        ]
      },
      {
        "name": "Premium Package",
        "price": 75000,
        "description": "Full day photography with videography",
        "features": [
          "500 edited photos",
          "Cinematic video",
          "Premium album",
          "Online gallery"
        ]
      }
    ],
    "certifications": [
      "Professional Photography Diploma"
    ],
    "languages": [
      "Hindi",
      "English",
      "Marathi"
    ],
    "coverage_areas": [
      "Mumbai",
      "Pune",
      "Nashik"
    ],
    "business_hours": {
      "start": "09:00",
      "end": "21:00"
    },
    "team_size": 3,
    "years_in_business": 8
  },
  "enterpriseId": "507f1f77bcf86cd799439012",
  "enterpriseName": "Acme Corporation"
}
```

### 3. Using JavaScript/Fetch

```javascript
const vendorData = {
  categoryId: "507f1f77bcf86cd799439011",
  name: "Elite Wedding Photographers",
  title: "Professional Photography Services",
  description: "Professional wedding photography services with years of experience",
  imageUrl: "/uploads/vendors/vendor_1234567890_abc123.jpg",
  formData: {
    location: "Mumbai, Maharashtra",
    experience: 5,
    pricing: {
      starting: 25000,
      premium: 75000
    },
    services: [
      "Wedding Photography",
      "Pre-wedding Shoot",
      "Candid Photography"
    ],
    equipment: [
      "DSLR Camera",
      "Drone",
      "Lighting Equipment"
    ],
    contactDetails: {
      phone: "+91-9876543210",
      email: "contact@elitephotographers.com",
      website: "www.elitephotographers.com"
    },
    availability: {
      weekdays: true,
      weekends: true,
      advance_booking_days: 30
    },
    portfolio: [
      "image1.jpg",
      "image2.jpg",
      "video1.mp4"
    ],
    packages: [
      {
        name: "Basic Package",
        price: 25000,
        description: "4-hour photography session",
        features: [
          "200 edited photos",
          "Online gallery",
          "Basic album"
        ]
      },
      {
        name: "Premium Package",
        price: 75000,
        description: "Full day photography with videography",
        features: [
          "500 edited photos",
          "Cinematic video",
          "Premium album",
          "Online gallery"
        ]
      }
    ],
    certifications: [
      "Professional Photography Diploma"
    ],
    languages: [
      "Hindi",
      "English",
      "Marathi"
    ],
    coverage_areas: [
      "Mumbai",
      "Pune",
      "Nashik"
    ],
    business_hours: {
      start: "09:00",
      end: "21:00"
    },
    team_size: 3,
    years_in_business: 8
  },
  enterpriseId: "507f1f77bcf86cd799439012",
  enterpriseName: "Acme Corporation"
};

fetch('http://localhost:10030/api/v1/vendors', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_JWT_TOKEN'
  },
  body: JSON.stringify(vendorData)
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));
```

---

## 🖼️ Image Upload Process

If you want to include images, follow this two-step process:

### Step 1: Upload Image (Uses Form Data)
```bash
curl -X POST "http://localhost:10030/api/v1/vendors/upload-image" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@/path/to/your/image.jpg"
```

**Response:**
```json
{
  "status": "OK",
  "data": "/uploads/vendors/vendor_1234567890_abc123.jpg"
}
```

### Step 2: Create Vendor with Image URL (Uses JSON)
Use the returned URL in the `imageUrl` field of your vendor creation request.

---

## ❌ What NOT to Do

### Wrong: Sending Form Data
```bash
# ❌ WRONG - This will cause validation errors
curl -X POST "http://localhost:10030/api/v1/vendors" \
  -H "Content-Type: multipart/form-data" \
  -F "categoryId=507f1f77bcf86cd799439011" \
  -F "name=Elite Wedding Photographers" \
  -F "title=Professional Photography Services"
```

### Wrong: Missing Required Fields
```json
// ❌ WRONG - Missing required fields
{
  "name": "Elite Wedding Photographers"
  // Missing: categoryId, title, formData
}
```

---

## ✅ What TO Do

### Correct: Send JSON with All Required Fields
```bash
# ✅ CORRECT - JSON with proper headers
curl -X POST "http://localhost:10030/api/v1/vendors" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"categoryId": "...", "name": "...", "title": "...", "formData": {...}}'
```

---

## 🔧 Troubleshooting

### Common Error Messages and Solutions:

1. **"categoryId should not be empty"**
   - ✅ Solution: Include `categoryId` field in JSON

2. **"name should not be empty"**
   - ✅ Solution: Include `name` field in JSON

3. **"title should not be empty"**
   - ✅ Solution: Include `title` field in JSON

4. **"formData should not be empty"**
   - ✅ Solution: Include `formData` object in JSON

5. **"Unauthorized"**
   - ✅ Solution: Include valid JWT token in Authorization header

---

## 📝 Field Descriptions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `categoryId` | string | ✅ | Category ObjectId |
| `name` | string | ✅ | Vendor name |
| `title` | string | ✅ | Vendor title |
| `description` | string | ❌ | Vendor description |
| `imageUrl` | string | ❌ | Image URL (from upload endpoint) |
| `formData` | object | ✅ | Dynamic form data |
| `enterpriseId` | string | ❌ | Enterprise ID (auto-populated for enterprise users) |
| `enterpriseName` | string | ❌ | Enterprise name (auto-populated for enterprise users) |

---

## 🚀 Quick Test

Use the provided test scripts:
- `test-vendor-creation.js` (Node.js)
- `test-vendor-creation.ps1` (PowerShell)
- `test-vendor-creation.sh` (Bash)

Remember to replace `YOUR_JWT_TOKEN_HERE` with your actual JWT token!
