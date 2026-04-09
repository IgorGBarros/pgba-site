# inventory/management/commands/cosmos_barcode_finder_fixed.py
from django.core.management.base import BaseCommand
from django.utils import timezone
from django.db.models import Q
from inventory.models import Product, ExternalBarcodeCatalog
from seleniumbase import SB
from bs4 import BeautifulSoup
import re
import time
import random
import unicodedata
from difflib import SequenceMatcher
import logging

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Cosmos Barcode Finder - VERSÃO CORRIGIDA'
    
    def add_arguments(self, parser):
        parser.add_argument('--brand', type=str, default='Natura', help='Marca para processar')
        parser.add_argument('--limit', type=int, default=10, help='Limite de produtos para processar')
        parser.add_argument('--delay', type=float, default=8.0, help='Delay entre buscas')
        parser.add_argument('--dry-run', action='store_true', help='Apenas simular')
        parser.add_argument('--skip-existing', action='store_true', help='Pular produtos que já têm código de barras')
        parser.add_argument('--test-product', type=str, help='Testar com um produto específico (natura_sku)')
    
    def handle(self, *args, **options):
        brand = options['brand']
        limit = options['limit']
        delay = options['delay']
        dry_run = options['dry_run']
        skip_existing = options['skip_existing']
        test_product = options['test_product']
        
        self.stdout.write(self.style.WARNING(f"🔍 Cosmos Barcode Finder - VERSÃO CORRIGIDA"))
        
        # Se for teste de produto específico
        if test_product:
            try:
                product = Product.objects.get(natura_sku=test_product)
                self.test_single_product(product, delay, dry_run)
                return
            except Product.DoesNotExist:
                self.stdout.write(self.style.ERROR(f"❌ Produto {test_product} não encontrado"))
                return
        
        # Buscar produtos
        query = Q(brand__iexact=brand)
        if skip_existing:
            query &= (Q(bar_code__isnull=True) | Q(bar_code=''))
        
        products = Product.objects.filter(query).order_by('id')[:limit]
        
        self.stdout.write(f"📦 Encontrados {products.count()} produtos para processar")
        
        stats = {
            'processed': 0,
            'found_barcodes': 0,
            'cloudflare_blocks': 0,
            'errors': 0,
            'multiple_gtins': 0
        }
        
        with SB(uc=True, headless=True, page_load_strategy="eager") as sb:
            sb.driver.set_page_load_timeout(90)
            
            for product in products:
                try:
                    result = self.search_product_smart(sb, product, delay, dry_run)
                    
                    stats['processed'] += 1
                    
                    if result['cloudflare_blocked']:
                        stats['cloudflare_blocks'] += 1
                        self.stdout.write(self.style.ERROR(
                            f"🛡️ [{stats['processed']}/{limit}] {product.natura_sku} - Bloqueado pelo Cloudflare"
                        ))
                    elif result['found']:
                        stats['found_barcodes'] += 1
                        if result.get('multiple_options'):
                            stats['multiple_gtins'] += 1
                        
                        self.stdout.write(self.style.SUCCESS(
                            f"✅ [{stats['processed']}/{limit}] {product.natura_sku} - "
                            f"GTIN: {result['gtin']} "
                            f"({result.get('confidence', 'N/A')})"
                        ))
                    else:
                        self.stdout.write(
                            f"❌ [{stats['processed']}/{limit}] {product.natura_sku} - "
                            f"Sem GTIN encontrado"
                        )
                    
                    # Delay variável
                    sleep_time = delay + random.uniform(1.0, 3.0)
                    time.sleep(sleep_time)
                    
                except Exception as e:
                    stats['errors'] += 1
                    self.stdout.write(self.style.ERROR(
                        f"❌ [{stats['processed'] + 1}/{limit}] Erro no produto {product.natura_sku}: {e}"
                    ))
                    time.sleep(delay * 1.5)
        
        self.print_stats(stats)
    
    def test_single_product(self, product, delay, dry_run):
        """Testa busca para um produto específico"""
        self.stdout.write(f"🧪 Testando produto: {product.natura_sku} - {product.name}")
        
        with SB(uc=True, headless=False, page_load_strategy="eager") as sb:
            result = self.search_product_smart(sb, product, delay, dry_run, debug=True)
            
            if result['cloudflare_blocked']:
                self.stdout.write(self.style.ERROR("🛡️ Bloqueado pelo Cloudflare"))
            elif result['found']:
                self.stdout.write(self.style.SUCCESS(
                    f"✅ GTIN encontrado: {result['gtin']} (confiança: {result.get('confidence', 'N/A')})"
                ))
                if result.get('all_gtins'):
                    self.stdout.write(f"📋 Todos os GTINs encontrados: {result['all_gtins']}")
            else:
                self.stdout.write(self.style.ERROR("❌ GTIN não encontrado"))
    
    def search_product_smart(self, sb, product, delay, dry_run, debug=False):
        """Busca inteligente com extração melhorada"""
        result = {
            'found': False, 
            'gtin': None, 
            'cloudflare_blocked': False,
            'confidence': None,
            'all_gtins': [],
            'multiple_options': False
        }
        
        try:
            # Acessar página inicial
            sb.open("https://cosmos.bluesoft.com.br/")
            sb.sleep(random.uniform(3.0, 5.0))
            
            # Verificar Cloudflare
            page_title = sb.get_title()
            if "access denied" in page_title.lower() or "cloudflare" in page_title.lower():
                result['cloudflare_blocked'] = True
                return result
            
            # Aguardar carregamento
            sb.sleep(3)
            
            # Preparar busca
            search_term = self.prepare_search_term(product.name)
            
            if debug:
                self.stdout.write(f"   🔍 Termo de busca: '{search_term}'")
            
            # Realizar busca usando o campo correto
            success = self.perform_search(sb, search_term, debug)
            
            if not success:
                return result
            
            # Aguardar resultados
            sb.sleep(random.uniform(4.0, 6.0))
            
            # Verificar se foi bloqueado após busca
            current_title = sb.get_title()
            if "access denied" in current_title.lower() or "cloudflare" in current_title.lower():
                result['cloudflare_blocked'] = True
                return result
            
            # Extrair e analisar GTINs
            page_source = sb.get_page_source()
            
            if debug:
                with open(f"debug_search_{product.natura_sku}.html", "w", encoding="utf-8") as f:
                    f.write(page_source)
                self.stdout.write(f"   💾 HTML salvo para debug")
            
            # Extrair GTINs com contexto
            gtin_analysis = self.extract_gtins_with_context(page_source, product, debug)
            
            if gtin_analysis['gtins']:
                result['found'] = True
                result['gtin'] = gtin_analysis['best_gtin']
                result['confidence'] = gtin_analysis['confidence']
                result['all_gtins'] = gtin_analysis['gtins']
                result['multiple_options'] = len(gtin_analysis['gtins']) > 1
                
                if not dry_run:
                    self.save_barcode_result(product, gtin_analysis['best_gtin'], gtin_analysis['confidence'])
            
        except Exception as e:
            if debug:
                self.stdout.write(f"   ❌ Erro: {e}")
        
        return result
    
    def perform_search(self, sb, search_term, debug=False):
        """Realiza a busca no site"""
        try:
            # Tentar diferentes seletores para o campo de busca
            search_selectors = [
                "#search-input",
                "input[name='q']",
                "input[type='search']",
                "input[placeholder*='Pesquise']"
            ]
            
            search_field = None
            for selector in search_selectors:
                if sb.is_element_present(selector):
                    search_field = selector
                    break
            
            if not search_field:
                if debug:
                    self.stdout.write("   ❌ Campo de busca não encontrado")
                return False
            
            # Realizar busca
            sb.click(search_field)
            sb.sleep(0.5)
            sb.clear(search_field)
            sb.sleep(0.5)
            sb.type(search_field, search_term)
            sb.sleep(1)
            sb.press_keys(search_field, '\n')
            
            if debug:
                self.stdout.write(f"   ✅ Busca realizada com sucesso")
            
            return True
            
        except Exception as e:
            if debug:
                self.stdout.write(f"   ❌ Erro na busca: {e}")
            return False
    
    def extract_gtins_with_context(self, html_content, product, debug=False):
        """Extrai GTINs analisando o contexto para encontrar o mais relevante"""
        analysis = {
            'gtins': [],
            'best_gtin': None,
            'confidence': 'low'
        }
        
        try:
            soup = BeautifulSoup(html_content, 'html.parser')
            
            # Encontrar todos os GTINs na página
            page_text = soup.get_text()
            
            # Padrões para encontrar GTINs
            gtin_patterns = [
                r'GTIN/EAN:\s*(\d{8,14})',  # Padrão específico do Cosmos
                r'GTIN[:\s-]*(\d{8,14})',
                r'EAN[:\s-]*(\d{8,14})',
                r'Código[:\s-]*(\d{8,14})',
                r'\b(\d{13,14})\b'  # GTINs de 13-14 dígitos
            ]
            
            found_gtins = []
            for pattern in gtin_patterns:
                matches = re.findall(pattern, page_text, re.IGNORECASE)
                found_gtins.extend(matches)
            
            # Filtrar GTINs válidos
            valid_gtins = []
            for gtin in found_gtins:
                if (len(gtin) in [8, 12, 13, 14] and 
                    not re.match(r'^(19|20)\d{2}', gtin) and  # Não é ano
                    not re.match(r'^0+$', gtin) and           # Não é só zeros
                    gtin not in ['1234567890123']):           # Não é exemplo
                    valid_gtins.append(gtin)
            
            # Remover duplicatas mantendo ordem
            unique_gtins = list(dict.fromkeys(valid_gtins))
            
            if debug:
                self.stdout.write(f"   🔢 GTINs válidos encontrados: {len(unique_gtins)}")
                if unique_gtins:
                    self.stdout.write(f"   📋 Lista: {unique_gtins[:10]}")  # Mostrar primeiros 10
            
            if not unique_gtins:
                return analysis
            
            # Analisar contexto de cada GTIN para encontrar o mais relevante
            gtin_scores = {}
            product_words = self.normalize_text(product.name).lower().split()
            
            for gtin in unique_gtins:
                score = 0
                
                # Encontrar elementos HTML que contêm este GTIN
                gtin_elements = soup.find_all(text=re.compile(gtin))
                
                for elem_text in gtin_elements:
                    parent = elem_text.parent
                    if not parent:
                        continue
                    
                    # Pegar contexto (elemento pai e irmãos)
                    context_elements = [parent]
                    
                    # Adicionar elementos próximos
                    for sibling in parent.find_next_siblings()[:2]:
                        context_elements.append(sibling)
                    for sibling in parent.find_previous_siblings()[:2]:
                        context_elements.append(sibling)
                    
                    # Analisar contexto
                    context_text = ""
                    for elem in context_elements:
                        context_text += " " + elem.get_text().lower()
                    
                    # Pontuar baseado na similaridade
                    context_words = context_text.split()
                    word_matches = sum(1 for word in product_words if word in context_words)
                    score += word_matches * 2
                    
                    # Pontuar se contém "natura"
                    if "natura" in context_text:
                        score += 10
                    
                    # Pontuar se está em estrutura de produto
                    parent_classes = parent.get('class', [])
                    if any('product' in str(cls).lower() for cls in parent_classes):
                        score += 5
                    
                    # Pontuar se o produto tem nome similar
                    similarity = SequenceMatcher(None, 
                                               self.normalize_text(product.name).lower(),
                                               context_text).ratio()
                    score += similarity * 20
                
                gtin_scores[gtin] = score
            
            if debug and gtin_scores:
                sorted_scores = sorted(gtin_scores.items(), key=lambda x: x[1], reverse=True)
                self.stdout.write(f"   🎯 Top 5 GTINs por score:")
                for i, (gtin, score) in enumerate(sorted_scores[:5]):
                    self.stdout.write(f"      {i+1}. {gtin} (score: {score:.1f})")
            
            # Selecionar melhor GTIN
            if gtin_scores:
                best_gtin = max(gtin_scores, key=gtin_scores.get)
                best_score = gtin_scores[best_gtin]
                
                # Determinar confiança
                if best_score >= 15:
                    confidence = 'high'
                elif best_score >= 5:
                    confidence = 'medium'
                else:
                    confidence = 'low'
                
                analysis['gtins'] = unique_gtins
                analysis['best_gtin'] = best_gtin
                analysis['confidence'] = confidence
            
        except Exception as e:
            if debug:
                self.stdout.write(f"   ❌ Erro na análise de GTINs: {e}")
        
        return analysis
    
    def prepare_search_term(self, product_name):
        """Prepara termo de busca otimizado"""
        term = self.normalize_text(product_name)
        
        # Remover palavras muito comuns
        stop_words = ['produto', 'natura', 'ml', 'g', 'unidade', 'un', 'cx', 'caixa']
        words = term.split()
        filtered_words = [w for w in words if w.lower() not in stop_words and len(w) > 2]
        
        # Pegar palavras mais importantes
        important_words = filtered_words[:3]  # Reduzir para 3 palavras para busca mais específica
        
        return ' '.join(important_words)
    
    def normalize_text(self, text):
        """Normaliza texto"""
        if not text:
            return ""
        
        text = unicodedata.normalize('NFKD', text).encode('ascii', 'ignore').decode()
        text = re.sub(r'[^A-Za-z0-9 ]', ' ', text)
        text = re.sub(r'\s+', ' ', text).strip()
        
        return text
    
    def save_barcode_result(self, product, gtin, confidence):
        """Salva resultado do código de barras"""
        try:
            # Salvar na tabela de staging
            ExternalBarcodeCatalog.objects.get_or_create(
                gtin=gtin,
                defaults={
                    'brand': product.brand,
                    'description': product.name,
                    'source': f'cosmos_smart_search_{confidence}',
                    'matched': True
                }
            )
            
            # Salvar no produto apenas se confiança alta ou média
            if confidence in ['high', 'medium']:
                product.bar_code = gtin
                product.save(update_fields=['bar_code'])
            
        except Exception as e:
            logger.error(f"Erro ao salvar GTIN {gtin} para produto {product.natura_sku}: {e}")
    
    def print_stats(self, stats):
        """Imprime estatísticas"""
        self.stdout.write(self.style.SUCCESS("\n" + "="*60))
        self.stdout.write(self.style.SUCCESS("📊 RELATÓRIO FINAL - COSMOS BARCODE FINDER CORRIGIDO"))
        self.stdout.write(self.style.SUCCESS("="*60))
        self.stdout.write(f"📊 Produtos processados: {stats['processed']}")
        self.stdout.write(f"✅ GTINs encontrados: {stats['found_barcodes']}")
        self.stdout.write(f"🎯 Produtos com múltiplos GTINs: {stats['multiple_gtins']}")
        self.stdout.write(f"🛡️ Bloqueios Cloudflare: {stats['cloudflare_blocks']}")
        self.stdout.write(f"❌ Erros: {stats['errors']}")
        
        if stats['processed'] > 0:
            success_rate = (stats['found_barcodes'] / stats['processed']) * 100
            self.stdout.write(f"📈 Taxa de sucesso: {success_rate:.1f}%")
        
        self.stdout.write(self.style.SUCCESS("="*60))