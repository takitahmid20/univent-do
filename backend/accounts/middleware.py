import jwt
from django.conf import settings
from django.http import JsonResponse
from django.db import connection
from datetime import datetime, timezone
from functools import wraps
import logging

logger = logging.getLogger(__name__)

def token_required(view_func):
    @wraps(view_func)
    def wrapper(self, request, *args, **kwargs):
        auth_header = request.headers.get('Authorization')
        
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({
                'error': 'No token provided'
            }, status=401)
        
        token = auth_header.split(' ')[1]
        
        try:
            # Check if token is in invalid_tokens table
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT EXISTS(
                        SELECT 1 FROM invalid_tokens 
                        WHERE token = %s AND expires_at > %s
                    )
                """, [token, datetime.now(timezone.utc)])
                
                is_invalid = cursor.fetchone()[0]
                
                if is_invalid:
                    return JsonResponse({
                        'error': 'Token has been invalidated'
                    }, status=401)
            
            # Verify token
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
            
            # Check token expiration
            exp_timestamp = payload.get('exp')
            if not exp_timestamp:
                return JsonResponse({
                    'error': 'Token is missing expiration'
                }, status=401)
            
            exp_datetime = datetime.fromtimestamp(exp_timestamp, timezone.utc)
            if exp_datetime < datetime.now(timezone.utc):
                return JsonResponse({
                    'error': 'Token has expired'
                }, status=401)
            
            # Add user info to request
            request.user_type = payload['user_type']  # Add user_type directly
            
            # Only add user details if not admin
            if payload['user_type'] != 'admin':
                request.user = {
                    'user_id': payload['user_id'],
                    'email': payload['email'],
                    'username': payload['username'],
                    'user_type': payload['user_type']
                }
            
            return view_func(self, request, *args, **kwargs)
            
        except jwt.ExpiredSignatureError:
            return JsonResponse({
                'error': 'Token has expired'
            }, status=401)
        except jwt.InvalidTokenError:
            return JsonResponse({
                'error': 'Invalid token'
            }, status=401)
        except Exception as e:
            return JsonResponse({
                'error': str(e)
            }, status=401)
    
    return wrapper
