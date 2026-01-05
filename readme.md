# TASK 2 - API DOCUMENTATION


The Nudge API allows users to create, view, update, and delete nudges related to an event or article.
A nudge is a scheduled prompt containing a title, image, description, and optional icon + short invitation text that can be displayed at specific times or contexts.

Base URL
/api/v1/nudges


Authentication
All endpoints require authentication.
Headers
Authorization: Bearer <access_token>
Content-Type: application/json


Nudge Data Model
Nudge Object
{
  "_id": "string",
  "targetType": "event | article",
  "targetId": "string",
  "title": "string",
  "description": "string",
  "coverImage": "string",
  "icon": "string", 
  "invitationText": "string",
  "scheduleDate": "YYYY-MM-DD",
  "startTime": "HH:mm",
  "endTime": "HH:mm",
  "status": "draft | scheduled | published",
  "createdBy": "string",
  "createdAt": "ISODate",
  "updatedAt": "ISODate"
}


Field Description
FieldTypeDescriptiontargetTypestringevent or articletargetIdstringID of the event/articletitlestringNudge title (max 60 chars)descriptionstringFull description of the nudgecoverImagestringImage URL shown as covericonstringIcon URL (shown when minimized)invitationTextstringOne-line CTA textscheduleDatestringDate when nudge is activestartTimestringStart timeendTimestringEnd timestatusstringCurrent nudge state

API Endpoints

1️⃣ Create a Nudge
Endpoint
POST /api/v1/nudges

Request Body
{
  "targetType": "event",
  "targetId": "event_123",
  "title": "Free Yoga Workshop",
  "description": "Join us for a free yoga session this weekend.",
  "coverImage": "https://cdn.app.com/images/yoga.jpg",
  "icon": "https://cdn.app.com/icons/yoga-icon.png",
  "invitationText": "Tap to join",
  "scheduleDate": "2026-01-10",
  "startTime": "10:00",
  "endTime": "12:00"
}

Validation Rules


title max length: 60 characters


scheduleDate must be ≥ today


startTime < endTime


Response
{
  "success": true,
  "message": "Nudge created successfully",
  "data": {
    "_id": "nudge_456",
    "status": "scheduled"
  }
}


2️⃣ Get All Nudges
Endpoint
GET /api/v1/nudges

Query Parameters (Optional)
ParamDescriptiontargetTypeFilter by event or articlestatusFilter by nudge statuspagePaginationlimitItems per page
Response
{
  "success": true,
  "data": [
    {
      "_id": "nudge_456",
      "title": "Free Yoga Workshop",
      "status": "scheduled"
    }
  ]
}


3️⃣ Get Nudge by ID
Endpoint
GET /api/v1/nudges/:id

Response
{
  "success": true,
  "data": {
    "_id": "nudge_456",
    "title": "Free Yoga Workshop",
    "description": "Join us for a free yoga session this weekend."
  }
}


4️⃣ Update a Nudge
Endpoint
PUT /api/v1/nudges/:id

Request Body (Partial Allowed)
{
  "title": "Updated Yoga Workshop",
  "invitationText": "Register now"
}

Response
{
  "success": true,
  "message": "Nudge updated successfully"
}


5️⃣ Delete a Nudge
Endpoint
DELETE /api/v1/nudges/:id

Response
{
  "success": true,
  "message": "Nudge deleted successfully"
}


6️⃣ Publish a Nudge
Endpoint
PATCH /api/v1/nudges/:id/publish

Response
{
  "success": true,
  "message": "Nudge published"
}


Error Response Format
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    "Title is required",
    "Schedule date cannot be in the past"
  ]
}


Notes


Image and icon uploads can be handled via multer/express-file-upload and stored on S3/Cloudinary.


Nudges appear:


Inline with an article


As minimized icon with invitation text




Scheduling logic should run via a cron or background job.


Below is a production-ready MongoDB (Mongoose) schema for the Nudge feature, mapped exactly to the form fields in your wireframe and the API we documented earlier.

This fits well with your Node.js + Express + MongoDB setup.

📁 models/nudge.model.js
import mongoose from "mongoose";

const nudgeSchema = new mongoose.Schema(
  {
    // Event or Article reference
    targetType: {
      type: String,
      enum: ["event", "article"],
      required: true
    },

    // Nudge basic info
    title: {
      type: String,
      required: true,
      maxlength: 60,
      trim: true
    },

    description: {
      type: String,
      required: true,
      trim: true
    },

    // Images
    coverImage: {
      type: String, // URL
      required: true
    },

    icon: {
      type: String // URL (optional)
    },

    invitationText: {
      type: String,
      maxlength: 100,
      trim: true
    },

    // Scheduling
    scheduleDate: {
      type: Date,
      required: true
    },

    startTime: {
      type: String, // HH:mm
      required: true
    },

    endTime: {
      type: String, // HH:mm
      required: true
    },

    // Status
    status: {
      type: String,
      enum: ["draft", "scheduled", "published"],
      default: "draft"
    },

    // Ownership
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  {
    timestamps: true
  }
);


export const Nudge = mongoose.model("Nudge", nudgeSchema);