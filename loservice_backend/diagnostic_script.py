#!/usr/bin/env python
"""
Quick diagnostic script to check user and review data integrity.
Run this in Django shell to identify issues.

Usage in Django shell:
    python manage.py shell
    exec(open('diagnostic_script.py').read())
"""

from account.models import User, UMKMReview, UMKM
from django.db.models import Count

print("=" * 80)
print("USER & REVIEW DATA DIAGNOSTIC")
print("=" * 80)

# Check for duplicate emails
print("\n1. Checking for users with duplicate emails...")
duplicate_emails = User.objects.values('email').annotate(count=Count('email')).filter(count__gt=1)
if duplicate_emails.exists():
    print(f"   ⚠️  WARNING: Found {duplicate_emails.count()} duplicate emails:")
    for dup in duplicate_emails:
        users = User.objects.filter(email=dup['email'])
        for u in users:
            print(f"      - {u.email} (ID: {u.user_id}, Role: {u.role})")
else:
    print("   ✓ No duplicate emails found")

# Check specific user
print("\n2. Checking syahri user accounts...")
syahri_users = User.objects.filter(email='syahri@gmail.com')
if syahri_users.exists():
    print(f"   Found {syahri_users.count()} account(s) with syahri@gmail.com:")
    for user in syahri_users:
        print(f"      - ID: {user.user_id}")
        print(f"        Email: {user.email}")
        print(f"        Name: {user.name}")
        print(f"        Role: {user.role}")
        print(f"        Created: {user.created_at}")
else:
    print("   ✗ No syahri@gmail.com account found")

# Check specific owner
print("\n3. Checking servisnih user accounts...")
owner_users = User.objects.filter(email='servisnih@gmail.com')
if owner_users.exists():
    print(f"   Found {owner_users.count()} account(s) with servisnih@gmail.com:")
    for user in owner_users:
        print(f"      - ID: {user.user_id}")
        print(f"        Email: {user.email}")
        print(f"        Name: {user.name}")
        print(f"        Role: {user.role}")
        print(f"        Created: {user.created_at}")
        # Check UMKM owned by this user
        umkms = UMKM.objects.filter(user=user)
        print(f"        UMKMs: {umkms.count()}")
else:
    print("   ✗ No servisnih@gmail.com account found")

# Check reviews by syahri
print("\n4. Checking reviews created by syahri...")
syahri_reviews = UMKMReview.objects.filter(user__email='syahri@gmail.com')
if syahri_reviews.exists():
    print(f"   Found {syahri_reviews.count()} review(s) by syahri:")
    for review in syahri_reviews[:5]:  # Show first 5
        print(f"      - Review ID: {review.review_id}")
        print(f"        User: {review.user.email} (Role: {review.user.role})")
        print(f"        UMKM: {review.umkm.nama_umkm}")
        print(f"        Created: {review.created_at}")
else:
    print("   ✗ No reviews found by syahri")

# Check reviews in general
print("\n5. Total reviews statistics:")
total_reviews = UMKMReview.objects.count()
reviews_by_role = UMKMReview.objects.values('user__role').annotate(count=Count('review_id'))
print(f"   Total reviews: {total_reviews}")
for stat in reviews_by_role:
    print(f"   By {stat['user__role']}: {stat['count']}")

print("\n" + "=" * 80)
print("END DIAGNOSTIC")
print("=" * 80)
