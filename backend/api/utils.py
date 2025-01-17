# import os
# import uuid
# import logging
# from supabase import create_client, Client
# from django.conf import settings
# from django.core.exceptions import ImproperlyConfigured

# logger = logging.getLogger(__name__)

# def get_supabase() -> Client:
#     """Get Supabase client instance"""
#     try:
#         url = settings.SUPABASE_URL
#         key = settings.SUPABASE_SERVICE_ROLE_KEY
        
#         logger.info(f"Initializing Supabase client with URL: {url}")
        
#         if not url or not key:
#             raise ImproperlyConfigured(
#                 "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in environment variables"
#             )
        
#         client = create_client(url, key)
#         logger.info("Supabase client initialized successfully")
#         return client
        
#     except Exception as e:
#         logger.error(f"Failed to initialize Supabase client: {str(e)}")
#         raise

# def upload_to_supabase(file, bucket: str = 'events', folder: str = None) -> str:
#     """
#     Upload a file to Supabase Storage and return the public URL
    
#     Args:
#         file: UploadedFile object
#         bucket: Supabase storage bucket name
#         folder: Optional folder path within the bucket
        
#     Returns:
#         str: Public URL of the uploaded file or None if upload fails
#     """
#     try:
#         logger.info(f"Starting file upload process for {file.name}")
#         logger.debug(f"File details - Size: {file.size} bytes, Type: {file.content_type}")
        
#         supabase = get_supabase()
        
#         # Generate unique filename
#         ext = file.name.split('.')[-1].lower()
#         filename = f"{uuid.uuid4()}.{ext}"
#         filepath = f"{folder}/{filename}" if folder else filename
        
#         logger.info(f"Generated filepath: {filepath}")
        
#         # Check if bucket exists
#         try:
#             buckets = supabase.storage.list_buckets()
#             logger.debug(f"Available buckets: {buckets}")
            
#             bucket_exists = any(b['name'] == bucket for b in buckets)
#             if not bucket_exists:
#                 logger.warning(f"Bucket '{bucket}' does not exist. Creating...")
#                 supabase.storage.create_bucket(bucket, {'public': True})
#         except Exception as e:
#             logger.error(f"Error checking/creating bucket: {str(e)}")
#             raise
        
#         # Read and upload file
#         try:
#             file_content = file.read()
#             logger.debug(f"Read {len(file_content)} bytes from file")
            
#             result = supabase.storage.from_(bucket).upload(
#                 path=filepath,
#                 file=file_content,
#                 file_options={"contentType": file.content_type}
#             )
#             logger.info(f"Upload result: {result}")
            
#         except Exception as e:
#             logger.error(f"Error during file upload: {str(e)}")
#             return None
        
#         # Get public URL
#         try:
#             public_url = supabase.storage.from_(bucket).get_public_url(filepath)
#             logger.info(f"Generated public URL: {public_url}")
#             return public_url
            
#         except Exception as e:
#             logger.error(f"Error getting public URL: {str(e)}")
#             return None
            
#     except Exception as e:
#         logger.error(f"Unexpected error in upload process: {str(e)}")
#         return None