from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from inventory.models import Store

class Command(BaseCommand):
    help = 'Inicializa o ambiente SaaS com uma Loja Piloto'

    def handle(self, *args, **kwargs):
        # 1. Cria Usuário Admin (se não existir)
        if not User.objects.filter(username='admin').exists():
            user = User.objects.create_superuser('admin', 'admin@example.com', 'admin')
            self.stdout.write(self.style.SUCCESS("👤 Usuário 'admin' criado (senha: admin)"))
        else:
            user = User.objects.get(username='admin')

        # 2. Cria a Loja vinculada a esse usuário
        if not Store.objects.filter(user=user).exists():
            store = Store.objects.create(
                user=user,
                name="Consultoria Natura VIP",
                slug="vip", # Link da vitrine: app.com/vip
                whatsapp="5511999999999"
            )
            self.stdout.write(self.style.SUCCESS(f"🏪 Loja '{store.name}' criada com sucesso!"))
        else:
            self.stdout.write("ℹ️ Loja já existe.")