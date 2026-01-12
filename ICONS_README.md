# 🌙 Ícones PWA do SONINHO

## Como gerar os ícones PNG

1. **Abra o gerador de ícones:**
   - Navegue até: `http://localhost:3000/generate-icons.html`
   - Ou abra o arquivo `/public/generate-icons.html` diretamente no navegador

2. **Clique em "Gerar Todos os Ícones"**
   - Os seguintes arquivos serão baixados automaticamente:
     - `icon-192.png` (192x192) - Android
     - `icon-512.png` (512x512) - Android splash screen
     - `apple-touch-icon.png` (180x180) - iOS
     - `favicon-32x32.png` (32x32) - Desktop
     - `favicon-16x16.png` (16x16) - Desktop

3. **Mova os arquivos para `/public/`**
   - Todos os arquivos PNG devem estar na pasta `/public/`

## Arquivos Criados

- ✅ `/public/icon.svg` - Ícone vetorial (lua com fundo azul marinho)
- ✅ `/public/manifest.json` - Configuração PWA
- ✅ `/public/generate-icons.html` - Gerador de ícones
- ✅ Layout atualizado com meta tags PWA

## Cores do Tema

- **Fundo:** Gradiente azul marinho (#1e3a8a → #312e81)
- **Lua:** Amarelo claro (#fef3c7)
- **Brilho:** Dourado (#fbbf24)
- **Estrelas:** Dourado com opacidade variável

## Como testar

### Android (Chrome/Edge):
1. Acesse o site
2. Menu (⋮) → "Adicionar à tela inicial"
3. O ícone da lua com fundo azul marinho aparecerá

### iOS (Safari):
1. Acesse o site
2. Botão Compartilhar → "Adicionar à Tela de Início"
3. O ícone aparecerá na tela inicial

### Desktop (Chrome/Edge):
1. Acesse o site
2. Na barra de endereços, clique no ícone de instalação
3. Confirme a instalação

## Recursos PWA Implementados

- ✅ Ícones em múltiplos tamanhos
- ✅ Manifest.json configurado
- ✅ Meta tags para iOS
- ✅ Meta tags para Android
- ✅ Theme color azul marinho
- ✅ Modo standalone (sem barra do navegador)
- ✅ Orientação portrait
- ✅ Ícone SVG responsivo
