import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ScanBarcode, Save, Loader2, Search, Calendar, Package } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { Product, productService, LookupData } from "../lib/productService";
import BarcodeScanner from "../components/BarcodeScanner";
import { useToast } from "../hooks/use-toast";
import { api } from "../services/api";

const CATEGORIES = ["Perfumaria", "Corpo", "Rosto", "Cabelos", "Maquiagem", "Infantil", "Casa", "Outro"];

const emptyProduct: Product = {
  name: "",
  bar_code: "",
  natura_sku: "", // Campo SKU
  category: "Perfumaria",
  price: 0,
  sale_price: 0,
  cost_price: 0,
  quantity: 0,
  min_quantity: 5,
  description: "",
  batch_code: "",
  expiration_date: ""
};

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEditing = Boolean(id);

  const [form, setForm] = useState<Product>(emptyProduct);
  const [showScanner, setShowScanner] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (id) {
      productService.get(Number(id)).then(setForm);
    }
  }, [id]);

  const handleChange = (field: keyof Product, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  // --- BUSCA POR NOME ---
  const handleNameChange = async (val: string) => {
    handleChange("name", val);
    
    if (val.length > 2) {
      try {
        const { data } = await api.get(`/products/lookup/?q=${val}`);
        if (data.candidates && data.candidates.length > 0) {
          setSuggestions(data.candidates);
          setShowSuggestions(true);
        } else {
          setShowSuggestions(false);
        }
      } catch {
        setShowSuggestions(false);
      }
    } else {
      setShowSuggestions(false);
    }
  };

  const selectSuggestion = (suggestion: any) => {
    setForm(prev => ({
      ...prev,
      name: suggestion.name,
      price: suggestion.official_price || prev.price, 
      natura_sku: suggestion.natura_sku, // Preenche o SKU
      description: suggestion.description,
    }));
    setShowSuggestions(false);
    toast({ title: "Produto Vinculado!", description: `SKU ${suggestion.natura_sku} carregado.` });
  };

  // --- BUSCA POR CÓDIGO (EAN) ---
  const handleLookup = async (ean: string) => {
    if (!ean) return;
    setSearching(true);
    try {
      const result = await productService.lookupByEan(ean);
      
      if (result.found) {
        const data = result.data as any; 
        const { local, remote, price_diff, msg, source, candidates, google_name } = { ...data, source: result.source };

        if (source === 'local' && local) {
           if (price_diff) {
              toast({ title: "Preço Mudou!", description: msg, className: "bg-yellow-100 text-yellow-800" });
           }
           if (!isEditing && local.id) navigate(`/products/${local.id}/edit`);
           
        } else if (source === 'suggestion' && candidates) {
           // IMPLEMENTAÇÃO DO MODO SUGESTÃO (LISTA)
           setSuggestions(candidates);
           setShowSuggestions(true);
           setForm(prev => ({ ...prev, name: google_name || prev.name, bar_code: ean }));
           toast({ 
             title: "Nome Encontrado!", 
             description: `Parece ser '${google_name}'. Selecione abaixo.` 
           });

        } else if (source === 'remote' || source === 'remote_learned' || source === 'remote_partial') {
           setForm(prev => ({
             ...prev,
             name: remote?.name || data.name,
             price: remote?.sale_price || data.sale_price || 0,
             natura_sku: remote?.natura_sku || data.natura_sku, // Preenche SKU se vier
             description: remote?.description || data.description,
             bar_code: ean
           }));
           toast({ title: "Encontrado!", description: "Dados carregados." });
        }
      } else {
        toast({ title: "Novo Código", description: "Preencha os dados manualmente." });
      }
    } catch {
      toast({ title: "Erro", description: "Falha na busca." });
    } finally {
      setSearching(false);
    }
  };

  const handleScan = (code: string) => {
    setShowScanner(false);
    handleChange("bar_code", code);
    handleLookup(code);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEditing) await productService.update(Number(id), form);
      else await productService.create(form);
      
      toast({ title: "Sucesso!", description: "Salvo com sucesso." });
      navigate("/products");
    } catch {
      toast({ title: "Erro", description: "Falha ao salvar." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-10 border-b bg-card px-6 py-4 flex items-center gap-3">
        <button onClick={() => navigate("/products")}><ArrowLeft /></button>
        <h1 className="font-bold text-lg">{isEditing ? "Editar" : "Novo"} Produto</h1>
      </header>

      <main className="max-w-2xl mx-auto p-6 space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* BLOCO IDENTIFICAÇÃO */}
          <div className="bg-card p-4 rounded-xl border space-y-4">
            
            {/* EAN */}
            <div>
                <label className="text-sm font-medium">Código de Barras (EAN)</label>
                <div className="flex gap-2 relative mt-1">
                  <input 
                    value={form.bar_code}
                    onChange={e => handleChange("bar_code", e.target.value)}
                    onBlur={() => handleLookup(form.bar_code)}
                    placeholder="Escaneie ou digite..."
                    className="w-full border rounded-lg px-3 py-2"
                  />
                  <button type="button" onClick={() => setShowScanner(true)} className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2">
                    <ScanBarcode size={18} /> <span className="hidden sm:block">Scan</span>
                  </button>
                  {searching && <Loader2 className="absolute right-24 top-3 animate-spin text-muted-foreground" size={18} />}
                </div>
            </div>

            {/* SKU NATURA */}
            <div>
                <label className="text-sm text-muted-foreground">Código Natura (SKU)</label>
                <div className="flex gap-2 items-center mt-1">
                    <input
                      type="text"
                      value={form.natura_sku || ''}
                      onChange={(e) => handleChange("natura_sku", e.target.value)}
                      placeholder="Ex: 38854"
                      className="w-1/3 rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                    />
                    <span className="text-xs text-muted-foreground">
                        (Preenchido automaticamente se encontrado)
                    </span>
                </div>
            </div>

          </div>

          {/* DADOS DO PRODUTO */}
          <div className="bg-card p-4 rounded-xl border space-y-4">
             <h2 className="font-bold text-sm flex gap-2"><Package size={16}/> Detalhes</h2>
             
             {/* NOME + AUTOCOMPLETE */}
             <div className="relative">
                <label className="text-sm text-muted-foreground">Nome</label>
                <input 
                  required 
                  value={form.name} 
                  onChange={e => handleNameChange(e.target.value)} 
                  className="w-full border rounded-lg px-3 py-2 mt-1" 
                  placeholder="Digite para buscar..."
                />
                
                {showSuggestions && (
                  <div className="absolute z-20 w-full bg-white border rounded-lg shadow-xl mt-1 max-h-60 overflow-y-auto">
                    {suggestions.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => selectSuggestion(s)}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b last:border-0 transition-colors group"
                      >
                        <p className="font-medium text-sm text-gray-800 group-hover:text-primary">{s.name}</p>
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>SKU: {s.natura_sku}</span>
                          <span>Ref: R$ {s.official_price}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
             </div>

             <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">Preço Venda</label>
                  <input type="number" step="0.01" value={form.price} onChange={e => handleChange("price", parseFloat(e.target.value))} className="w-full border rounded-lg px-3 py-2 mt-1" />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Preço Custo</label>
                  <input type="number" step="0.01" value={form.cost_price} onChange={e => handleChange("cost_price", parseFloat(e.target.value))} className="w-full border rounded-lg px-3 py-2 mt-1" />
                </div>
             </div>
             <div>
                <label className="text-sm text-muted-foreground">Categoria</label>
                <select value={form.category} onChange={e => handleChange("category", e.target.value)} className="w-full border rounded-lg px-3 py-2 mt-1">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
             </div>
          </div>

          {/* LOTE */}
          {!isEditing && (
            <div className="bg-card p-4 rounded-xl border space-y-4 border-l-4 border-l-primary">
               <h2 className="font-bold text-sm flex gap-2"><Calendar size={16}/> Entrada de Estoque</h2>
               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground">Qtd *</label>
                    <input type="number" required value={form.quantity} onChange={e => handleChange("quantity", parseInt(e.target.value))} className="w-full border rounded-lg px-3 py-2 mt-1" />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Lote</label>
                    <input value={form.batch_code || ''} onChange={e => handleChange("batch_code", e.target.value)} className="w-full border rounded-lg px-3 py-2 mt-1" />
                  </div>
                  <div className="col-span-2">
                    <label className="text-sm text-muted-foreground">Validade</label>
                    <input type="date" value={form.expiration_date || ''} onChange={e => handleChange("expiration_date", e.target.value)} className="w-full border rounded-lg px-3 py-2 mt-1" />
                  </div>
               </div>
            </div>
          )}

          <button disabled={loading} type="submit" className="w-full bg-primary text-white font-bold py-4 rounded-xl shadow-lg hover:scale-[1.02] transition-transform">
             {loading ? "Salvando..." : "Salvar Produto"}
          </button>
        </form>
      </main>

      <AnimatePresence>
        {showScanner && <BarcodeScanner onScan={handleScan} onClose={() => setShowScanner(false)} />}
      </AnimatePresence>
    </div>
  );
}