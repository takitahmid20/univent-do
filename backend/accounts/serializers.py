# accounts/serializers.py
from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from .models import Profile, UserProfile, Organization
from django.core.validators import EmailValidator

class UserSerializer(serializers.ModelSerializer):
    confirm_password = serializers.CharField(write_only=True)
    userType = serializers.ChoiceField(choices=[('organizer', 'Organizer'), ('attendee', 'Attendee')])
    email = serializers.EmailField(validators=[EmailValidator()], required=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'confirm_password', 'userType']

    def validate(self, data):
        cursor.execute("SELECT password FROM auth_user WHERE username = %s", [data['username']])
        stored_password = cursor.fetchone()
        if stored_password and not check_password(data['password'], stored_password[0]):
            raise serializers.ValidationError({"password": "Incorrect password."})
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError({"password": "Passwords do not match."})
        validate_password(data['password'])
        return data

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("This username is already taken.")
        return value

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("An account with this email already exists.")
        return value

    def create(self, validated_data):
        validated_data.pop('confirm_password')
        
        user_type = validated_data.get('userType')
        print("userType provided:", user_type)  # Debugging line to confirm userType value
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
    )
        profile, created = Profile.objects.get_or_create(user=user)
        if created:
            profile.user_type = user_type  # Set user_type explicitly
            profile.save()  # Save the Profile to update the user_type

        print("Profile created with user_type:", profile.user_type)  # Debugging line to confirm user_type

        return user


class UserProfileSerializer(serializers.ModelSerializer):
    user_type = serializers.CharField(source='user.profile.user_type', read_only=True)
    email = serializers.EmailField(write_only=True)  # For updating email
    username = serializers.CharField(write_only=True)  # For updating username
    current_email = serializers.EmailField(source='user.email', read_only=True)  # To show current email
    current_username = serializers.CharField(source='user.username', read_only=True)  # To show current username

    class Meta:
        model = UserProfile
        fields = ['name', 'current_email', 'phone', 'avatar', 'university', 'department', 'student_id', 'bio', 'user_type', 'username', 'current_username', 'email']  # Ensure email is included here

    def validate_username(self, value):
        # Allow the existing username to pass validation
        if value != self.instance.user.username and User.objects.filter(username=value).exists():
            raise serializers.ValidationError("This username is already taken. Please choose a unique username.")
        return value

    def validate_email(self, value):
        # Allow the existing email to pass validation
        if value != self.instance.user.email and User.objects.filter(email=value).exists():
            raise serializers.ValidationError("This email address is already used.")
        return value

    def update(self, instance, validated_data):
        user = instance.user
        
        # Update username if provided
        username = validated_data.get('username', None)
        if username:
            user.username = username
        
        # Update email if provided
        email = validated_data.get('email', None)
        if email:
            user.email = email

        user.save()  # Save user instance to persist changes

        # Now update the UserProfile fields
        return super().update(instance, validated_data)


class OrganizationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Organization
        fields = ['logo', 'cover_image', 'name', 'email', 'mobile_number', 'website', 'facebook_page', 'category']

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("This email address is already used by another account.")
        return value
