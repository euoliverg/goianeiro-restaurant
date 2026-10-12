# Relatório de organização de arquivos e auditoria — Goianeiro Restaurante

Data: 12 out 2026 · Site: https://goianeirorestaurante.com/ · Escopo: projeto local + material novo enviado pelo proprietário (fotos/vídeos de 08, 10 e 11 out) + originais do Instagram usados como fonte do site.

## 1. Resumo executivo
- **Site íntegro.** As 109 referências de mídia do site carregam no domínio publicado (0 links quebrados); localmente, 41 imagens + 37 arquivos de zoom/vídeo carregam sem erro nas duas páginas; nenhum erro de JavaScript; testes do banco de avaliações 43/43.
- **Preços e textos corretos.** Os 13 itens com preço (7 hambúrgueres, 3 combos, 3 acompanhamentos/molhos) batem 100% com o quadro oficial do Instagram (4 out 2026). As 186 chaves de texto da página inicial e 62 da página de avaliações têm tradução PT.
- **Biblioteca criada.** `media/` reúne 43 originais (fotos, vídeos brutos, 8 reels originais do Instagram, Reels finalizados, capas, trilha, quadro de cardápio, flyer), com nomes padronizados e hash verificado. Antes, parte disso estava só em pastas soltas, em Downloads ou numa pasta temporária que seria apagada.
- **Nada foi excluído, nada publicado.** Arquivos do site, preços e textos comerciais não foram alterados. Nenhum commit/push foi feito.
- **5 avaliações reais de clientes** já estão no ar na página de avaliações.

## 2. Estrutura final

```
goianeiro-restaurant/
├── index.html, reviews.html, … (site — inalterado)
├── assets/                    arquivos PUBLICADOS do site (nomes e caminhos inalterados)
│   ├── img/                   <prato>-<largura>.{avif,webp,jpg}
│   ├── video/                 <tema>.{mp4,webm} + pôsteres
│   ├── css/, js/
├── brand/                     identidade visual publicada (brand/export = kit de logos)
├── supabase/                  SQL das avaliações
├── media/                     NOVO — biblioteca de originais (local; fora do git e do deploy)
│   ├── brand/{logos,identity}/
│   ├── menu/{brazilian-plates,buffet,burgers,breakfast,desserts,sides,menu-boards}/
│   ├── videos/{brazilian-plates,burgers,promotional,instagram-originals}/
│   ├── social-media/{instagram-reels(+previous-versions),thumbnails,audio}/
│   ├── review-needed/
│   └── README.md              estrutura + regras de nomes + como adicionar foto ao site
└── docs/                      NOVO — fora do deploy
    ├── asset-inventory.csv                 204 arquivos (site + biblioteca + duplicatas recebidas)
    ├── menu-inventory.csv                  41 itens do cardápio com textos EN/PT, preço, mídias e status
    ├── duplicates-and-removal-candidates.csv  52 sugestões (nenhuma executada)
    ├── restore-original-layout.mjs         desfaz as movimentações (testado em modo simulação)
    └── organization-report.md
```

**Por que `assets/` não foi renomeado:** os arquivos publicados já seguem um padrão consistente (um nome-base em minúsculas com hífens por prato, ex.: `feijao-tropeiro-480.webp`) e são URLs públicas já indexadas (Google, prévia de link/OG, caches). Renomear quebraria URLs sem ganho real. A correspondência arquivo do site → original → produto está no inventário. A estrutura `public/assets/...` sugerida foi adaptada: o projeto é estático e não tem pasta `public/`, então a biblioteca ficou em `media/`, seguindo as abas do cardápio do próprio site.

## 3. Ações executadas
| Ação | Detalhe |
|---|---|
| Movidos (20) | `_source/` (12 originais das fotos do site, logo original, filme do hero) e `marketing/` (Reels, capas, trilha, versões anteriores) → `media/` com nomes novos. Pastas antigas vazias removidas. Reversível com `node docs/restore-original-layout.mjs --apply`. |
| Copiados (23) | Material novo de Downloads (originais continuam em Downloads) e da pasta temporária: 8 reels originais do @goianeiro_, quadro oficial dos hambúrgueres, flyer. |
| Verificação | sha256 de cada arquivo antes e depois: 43/43 idênticos. |
| Não copiados (duplicatas exatas) | 10 arquivos de Downloads idênticos a arquivos já na biblioteca (ver `duplicates-and-removal-candidates.csv`), incl. `BURGER BRAZILIAN.mp4` = Reel do hambúrguer. |
| `.gitignore` / `.vercelignore` | `media/*` fora do git (~210 MB; só o README entra); `media` e `docs` fora do deploy. |
| `README.md` | Caminhos atualizados (`_source/` → `media/`). |

## 4. Identificação do material novo (análise visual + hash + impressão visual dHash)
| Arquivo recebido (11 out) | Conteúdo | Situação |
|---|---|---|
| 23.09.43.jpeg | Prato com espetinho no prato | Origem de `espetinho-prato` do site (recorte) |
| 23.09.44.jpeg | Prato com espetinho para viagem | Origem de `espetinho-viagem` (recorte) |
| 23.09.44 (1).jpeg | Pão de sal — **print de story do Instagram** | Origem de `pao-de-sal` (recorte) |
| 23.09.44 (2).jpeg | Mandioca, couve e torresmo | Duplicata exata de foto de 08 out |
| 23.09.45.jpeg | Pavê com morangos + copinhos | Duplicata exata de foto de 08 out |
| 23.09.45 (1).jpeg | Bolo vulcão (lava cake) | **Revisar** — não está no cardápio; luz/fundo de estúdio diferentes de todas as outras fotos (possível banco de imagem/IA) |
| 23.09.45 (2).jpeg | Chocolate & cream (outro ângulo) | Nova alternativa |
| 23.09.45 (3).jpeg | Costelinha assada | Original em alta de `costelinha` |
| 23.09.45 (4).jpeg | Carne com batata | Original em alta de `carne-batata` |
| 23.09.45 (5).jpeg | Marmita de churrasco (outra foto) | Nova alternativa |
| Video 23.09.43.mp4 | Feijão sendo servido no prato com espetinho | Origem de `assets/video/espetinho` |

Também encontrados: foto de **bufê de saladas** (08 out) nunca usada no site; foto e vídeo do **hambúrguer** (10 out) usados no Reel.

## 5. Inconsistências e problemas encontrados
1. **36 arquivos publicados sem uso** (6,6 MB): tamanhos/formatos de imagem nunca referenciados e 2 vídeos de versões antigas (`doces.*`, `hero-chapa.*`). Não afetam o visitante (não são baixados), só o tamanho do deploy. Lista em `duplicates-and-removal-candidates.csv`.
2. **Pão de sal** no site vem de um print de story (resolução limitada, interface do celular recortada) → recomenda-se foto limpa.
3. **Copinhos de sobremesa** no site é um recorte pequeno (360 px) de outra foto → recomenda-se foto própria.
4. **Hambúrgueres sem foto de produto** no site; as fotos novas de hambúrguer não identificam qual item do cardápio é (não foi atribuído a nenhum).
5. **Itens sem foto**: Feijoada, Farofa, Frango assado, Banana frita, Café com leite, Coxinhas, Bolos variados, Salgados (e fotos dedicadas de Couve, Bife à milanesa, Arroz & feijão).
6. **Pendências já conhecidas (não alteradas):** número do endereço (bio diz 14334; post e flyer, 14338 — o site usa 14338); café da manhã a partir das 6h30 vs. bio com abertura às 11h (o JSON-LD de horário não inclui o café); itens 05, 06, 10, 11, 17–20 do quadro de hambúrgueres cortados na imagem; sem link de pedido online.
7. Reel `ig-DduHuOOvOFE` mostra uma pessoa apresentando o restaurante — não verificado quem é nem se é filmagem real → `review-needed`.
8. O filme do hero é **gerado por IA** (Google Flow) — documentado no inventário para não ser confundido com filmagem real em campanhas.
9. Downloads contém duplicatas exatas (fotos de 08 out baixadas duas vezes; `BURGER BRAZILIAN.mp4`).

## 6. Apenas sugerido (aguarda sua aprovação)
- Remover os 36 arquivos publicados sem uso (deploy −6,6 MB) — requer commit/publicação.
- Apagar de Downloads as 10 duplicatas exatas e as versões anteriores do Reel de menu (−59 MB).
- Usar a foto do bufê de saladas no item "Saladas" e as fotos alternativas (marmita 02, chocolate & cream 02) na galeria do prato.
- Confirmar qual hambúrguer aparece nas fotos/vídeo de 10 out para associá-lo ao item certo.
- Confirmar a origem do bolo vulcão antes de qualquer uso.
- Fotografar os itens sem foto (lista no item 5).
- Fazer commit desta organização (README, `.gitignore`, `.vercelignore`, `docs/`, `media/README.md`) — **ainda não feito**.

## 7. Testes realizados
- Integridade: sha256 de 43/43 arquivos da biblioteca confere com o original; script de restauração em modo simulação: 20/20 restauráveis.
- Site publicado: 109/109 referências respondem 200.
- Site local: página inicial com todas as abas abertas — 41 imagens, 0 quebradas, 37 arquivos de zoom/vídeo válidos, 0 erros no console; página de avaliações carrega (5 avaliações), 0 erros.
- Testes existentes do banco de avaliações: 43/43.
- Nenhum arquivo rastreado pelo git foi removido ou renomeado (`git ls-files --deleted`: 0).
