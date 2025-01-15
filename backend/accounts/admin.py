# from django.contrib import admin
# from .models import Profile, UserProfile, Organization

# class ProfileAdmin(admin.ModelAdmin):
#     list_display = ('user', 'user_type')
#     search_fields = ('user__username',)
#     list_filter = ('user_type',)

# class UserProfileAdmin(admin.ModelAdmin):
#     list_display = ('user', 'name', 'email', 'university')
#     search_fields = ('user__username', 'name', 'email')
#     list_filter = ('university',)

# class OrganizationAdmin(admin.ModelAdmin):
#     list_display = ('name', 'user', 'email', 'category')
#     search_fields = ('name', 'user__username', 'email')
#     list_filter = ('category',)

# admin.site.register(Profile, ProfileAdmin)
# admin.site.register(UserProfile, UserProfileAdmin)
# admin.site.register(Organization, OrganizationAdmin)