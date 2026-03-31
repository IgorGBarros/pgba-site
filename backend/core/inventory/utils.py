# inventory/utils.py - NOVA VERSÃO ROBUSTA
from django.utils.text import slugify
import uuid
from .models import Store

def get_current_store(user):
    """
    Obtém ou cria a loja do usuário atual de forma robusta
    """
    try:
        # Tentar buscar loja existente primeiro
        store = Store.objects.get(user=user)
        return store
        
    except Store.DoesNotExist:
        # Criar nova loja com slug único
        base_slug = slugify(user.email.split('@')[0])
        unique_slug = base_slug
        
        # ✅ CORREÇÃO: Garantir slug único
        counter = 1
        while Store.objects.filter(slug=unique_slug).exists():
            unique_slug = f"{base_slug}-{counter}"
            counter += 1
        
        # ✅ CORREÇÃO: Nome mais amigável
        store_name = getattr(user, 'name', None) or user.email.split('@')[0]
        
        store = Store.objects.create(
            user=user,
            name=f'Loja {store_name.title()}',
            slug=unique_slug,
            storefront_enabled=True,
            plan='free'  # ✅ Plano padrão
        )
        
        return store
        
    except Exception as e:
        # ✅ CORREÇÃO: Log mais detalhado
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Erro ao obter/criar loja para usuário {user.id}: {e}")
        raise