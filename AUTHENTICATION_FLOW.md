# Authentication Flow - Current Implementation

## Overview
Your VoterAuthentication component implements a **liveness detection system** with 3 sequential challenges before face verification.

---

## Flow Steps

### 1. LOOKUP
- User enters Voter ID or Aadhaar
- System queries database via `/api/find-voter`
- If found, proceeds to camera initialization

### 2. CAMERA_INIT
- Requests camera access
- Initializes video stream
- Moves to PRE_LIVENESS step

### 3. PRE_LIVENESS
- Shows "Camera Synchronized" screen
- Displays "I am Ready" button
- User clicks button to start liveness challenges
- **User controls when to start** (not automatic)

### 4. LIVENESS (3 Challenges)
Each challenge lasts 5 seconds with countdown timer:

**Challenge 1: BLINK**
- Instruction: "Perform a natural blink to verify liveness"
- Timer: 5 seconds
- Auto-advances when timer reaches 0

**Challenge 2: TURN_LEFT**
- Instruction: "Slowly rotate your head 45 degrees to the left"
- Timer: 5 seconds
- Auto-advances when timer reaches 0

**Challenge 3: TURN_RIGHT**
- Instruction: "Slowly rotate your head 45 degrees to the right"
- Timer: 5 seconds
- When complete, moves to ANALYZING

### 5. ANALYZING
- Captures live image from camera
- Calls `api.authenticateVoter(voterId, liveImage, [])`
- Backend runs DeepFace verification
- Shows animated loading screen (2.5 seconds)

### 6. RESULT
- **SUCCESS**: Shows green screen, redirects to voting panel after 2 seconds
- **FAIL**: Shows red screen with error message, option to return to lookup

---

## Backend Integration

### Current Backend Status
```python
# backend/app.py - Line ~260
face_verified = True  # TESTING MODE - ALWAYS PASS
```

**Backend is set to ALWAYS PASS for testing purposes.**

### API Call
```typescript
api.authenticateVoter(voterId, liveImage, [])
```

Parameters:
- `voterId`: Voter ID from database
- `liveImage`: Base64 encoded JPEG from camera
- `[]`: Empty liveness frames array (not used currently)

---

## UI Components

### Main View
- **Left side**: Registered photo from database (grayscale)
- **Right side**: Live camera feed with overlays

### Overlays
- **PRE_LIVENESS**: "I am Ready" button
- **LIVENESS**: Challenge instructions + countdown timer
- **ANALYZING**: Spinning loader with progress bar
- **RESULT**: Success (green) or Failure (red) screen

### Sidebar (Right)
- **Security Protocol** section with 3 items:
  - Anti-Spoofing
  - Vector Matching
  - Encrypted Exit
- **Authorized Terminology** section with 3 terms:
  - EPIC
  - DeepFace
  - Ledger

---

## Key Features

✅ **User-controlled start** - "I am Ready" button  
✅ **3 liveness challenges** - Blink, Turn Left, Turn Right  
✅ **Countdown timers** - 5 seconds per challenge  
✅ **Auto-progression** - Moves through challenges automatically  
✅ **Live camera feed** - User can see themselves throughout  
✅ **Visual feedback** - Clear instructions and progress indicators  
✅ **Error handling** - Shows error messages on failure  

---

## Alignment Issues Fixed

1. ✅ Removed invalid first line ("voterauthentication.tsx")
2. ✅ Removed unused `Search` import
3. ✅ Fixed `authenticateVoter` call to include 3rd parameter (empty array)
4. ✅ Added error message to FAIL state
5. ✅ Fixed TypeScript types for timer callbacks

---

## Testing Notes

**Backend is in TESTING MODE:**
- All authentication attempts will PASS
- Face matching is bypassed
- Threshold check is disabled

To enable real face verification:
```python
# backend/app.py - Change line ~260 from:
face_verified = True

# To:
face_verified = result["verified"] or result["distance"] < 1.20
```

---

## Progress Calculation

```typescript
LOOKUP: 15%
CAMERA_INIT/PRE_LIVENESS: 35%
LIVENESS Challenge 1: 40%
LIVENESS Challenge 2: 55%
LIVENESS Challenge 3: 70%
ANALYZING: 90%
RESULT: 100%
```

---

## Summary

Your implementation adds a **professional liveness detection flow** with:
- 3 sequential challenges (blink, turn left, turn right)
- User-controlled start with "I am Ready" button
- Automatic progression through challenges
- Clear visual feedback and instructions
- Integration with DeepFace backend verification

The system is currently in **testing mode** (always passes) for development purposes.
