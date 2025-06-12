This file outlines how the authentication changes when integrated.

# Selliko Client 
SELLIKO_API_BASE is available as environemnt variable. Use it. 
|
Thge selliko client has two functions

1. getAuthOTP
2. verifyAuthOTP
3. getCurrentUser

## getAuthOTP
this accepts { mobile_number}
makes a call to POST /functions/v1/auth
with {instance_id (get fromn local store),mobile_number}}
api will return {otp,user_id,otp_id}

retrun the reponse of the format below.


----------
On success the below format will be served 
{
  "success": true,
  "otp": "838499",
  "otp_id":"545sd4f4-5df4s6f-6s54f6",
  "user_id": "97e88075-4957-410b-b1bb-008aa4d8c74b",
  "user_details": {
    "id": "97e88075-4957-410b-b1bb-008aa4d8c74b",
    "name": null,
    "phone_number": "+1234567890",
    "user_role": "anon",
    "created_at": "2025-06-12T16:50:19.311911+00:00",
    "updated_at": "2025-06-12T16:50:19.311911+00:00"
  },
  "listing_count": 0,
  "message": "Authentication successful"
}

## verifyAuthOTP
this accepts (otp,otp_id,mobile)
call to  POST /functions/v1/auth-verify

make the call and return the values.


## getCurrentUser

this fucntion calls the default supabase end point to get current user from the JWT token in the rerquest.


## /login page

import  selliko-client 
on click of button in mobile input form send OTP using  `sendAuthOTP`,
if success, load the verify-otp page with correct local storage and auth management.


## /verify-otp page

otp is collected and submitted to the verifyAuthOTP function from client. 
if succesful a sample response of the below format is returned
```
{
  "success": true,
  "user": {
    "id": "97e88075-4957-410b-b1bb-008aa4d8c74b",
    "name": null,
    "phone_number": "+1234567890",
    "user_role": "client",
    "created_at": "2025-06-12T16:50:19.311911+00:00",
    "updated_at": "2025-06-12T17:03:08.394659+00:00"
  },
  "session": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwOi8vMTI3LjAuMC4xOjU0MzIxL2F1dGgvdjEiLCJzdWIiOiI5N2U4ODA3NS00OTU3LTQxMGItYjFiYi0wMDhhYTRkOGM3NGIiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzQ5NzUxMzg4LCJpYXQiOjE3NDk3NDc3ODgsImVtYWlsIjoiMDFiMzA3YWNiYTRmNTRmNTVhYWZjMzNiYjA2YmJiZjZjYTgwM2U5YUBmYWlydHJlZXoubG9jYWwiLCJwaG9uZSI6IjEyMzQ1Njc4OTAiLCJhcHBfbWV0YWRhdGEiOnsicHJvdmlkZXIiOiJlbWFpbCIsInByb3ZpZGVycyI6WyJlbWFpbCIsInBob25lIl19LCJ1c2VyX21ldGFkYXRhIjp7ImF1dGhfbWV0aG9kIjoicGhvbmUiLCJjcmVhdGVkX3ZpYSI6Im1vYmlsZV9hdXRoIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBob25lX251bWJlciI6IisxMjM0NTY3ODkwIn0sInJvbGUiOiJhdXRoZW50aWNhdGVkIiwiYWFsIjoiYWFsMSIsImFtciI6W3sibWV0aG9kIjoib3RwIiwidGltZXN0YW1wIjoxNzQ5NzQ3Nzg4fV0sInNlc3Npb25faWQiOiIzNDUyMTk4OC1mZDlhLTQzNWQtYjk4Ny1jODI1YzAxYWZmZGUiLCJpc19hbm9ueW1vdXMiOmZhbHNlfQ.CyJhHfBAq5ucHiT44AetdNlNTyWPRo-E4FHKMozDUU4",
    "refresh_token": "TI5Vw0tCZpyMv1p__4efbg",
    "expires_in": 3600,
    "token_type": "bearer",
    "user": {
      "id": "97e88075-4957-410b-b1bb-008aa4d8c74b",
      "phone": "+1234567890",
      "email": "01b307acba4f54f55aafc33bb06bbbf6ca803e9a@fairtreez.local",
      "user_metadata": {
        "user_role": "client"
      }
    }
  },
  "message": "Authentication successful"
}
````

update the local storage and auth sysystem to make use of this token and values 


## Refresh token

the backend does not support refresh tokens, disable refresh tokens and related calls. 

## Routing on succesful auth
the user shall be routed from the verify_otp section to /{user_role}
{user role shall eb what decides if a user is admin,client,vendor,agent}



