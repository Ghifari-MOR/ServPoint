from django.core.management.base import BaseCommand
from account.models import User


class Command(BaseCommand):
    help = 'Fix permissions for users with ADMIN role'

    def handle(self, *args, **options):
        # Find all users with ADMIN role
        admin_users = User.objects.filter(role='ADMIN')
        
        updated_count = 0
        for admin in admin_users:
            if not admin.is_staff or not admin.is_superuser:
                admin.is_staff = True
                admin.is_superuser = True
                admin.save()
                updated_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'Updated permissions for: {admin.email}')
                )
        
        if updated_count == 0:
            self.stdout.write(
                self.style.WARNING('No admin users needed updating.')
            )
        else:
            self.stdout.write(
                self.style.SUCCESS(f'\nTotal: {updated_count} admin users updated.')
            )
