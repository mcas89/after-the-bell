# After the Bell — Plano de fases (do corredor em diante)

Este arquivo é a referência para o que vem **depois do prólogo**.  
Seguir **uma fase de cada vez**. Não pular. Não “já ir fazendo o final”.

Quando uma fase terminar, marcar `[x]` e só então abrir a próxima.

---

## Não mexer

- Sala 11: prólogo, forca, mochilas, refrigerantes, L + M, 03:17 da sala
- Beat da silhueta: câmera, *Hei, espera!*, *Quem é você?*, *Não vai!!*, fuga para o escuro
- Relógio / celular / loader travados em **03:17**
- Nome **Marina** em texto que o jogador lê (até a fase de revelação)
- Inventário: título só por tamanho/peso, nunca origem
- Diretoria, biblioteca, banheiro e pátio: **não mostrar** até a fase correspondente
- Áudio: não destravar som a partir de `useFrame`

---



## Cânone (sempre)

- Lívia Ferreira, 16, impulsiva. Primeira pessoa, frase curta, sem metáfora de autora.
- Amiga: **Marina Alves**, 16. No jogo, primeiro só **M** / silhueta / “o quinto” / niver.
- Armário 5: placa sem nome. Pad “Armário 5”. Linha: *Não tem nome. Só o número.*
- PINs: celular e armário 4 **0305** (niver da Lívia, no prontuário). Armário 5 e PC **2107** (papel `0305-2107` no armário da Lívia). **Não explicar** em voz alta.
- A janela da sala 11 **não** é a da queda.
- Culpa emocional sim. “Você matou” / “ela pulou” **nunca**, até a revelação final.
- A escola do jogo é memória distorcida, não o prédio real. O texto da Lívia não explica o truque.



### Degraus (cada conteúdo sobe só um)

1. Tinha outra pessoa
2. Éramos próximas (L + M, quinto, niver)
3. Tem uma garota no corredor — preciso dela
4. A gente queria **sair** (buscas, alarme, segundo andar)
5. Iniciais M.A.
6. O nome
7. Ela estava comigo nesta noite
8. Foi ideia minha ficar
9. Ela quis ir embora
10. Por que eu não lembro do depois?
11. A janela. O salto. 03:17
12. As duas verdades. 03:18

---



## Fase 0 — Cânone interno

**Objetivo:** o código usa o nome certo; o jogador continua sem vê-lo.

- [x] Armário 5: `fullName` **Marina Alves** (hoje está Oliveira)
- [x] Placa / pad / examine: **sem o nome**
- [x] Se “Marcela Alves” no corredor ficar estranho, trocar o sobrenome da Marcela

**Pronto quando:** o nome completo existe só internamente.

---



## Fase 1 — Corredor (só se destoar)

**Não muda** layout, scare, nem o bloqueio do escuro.

- [x] Rejogar o corredor
- [x] Conferir se alguma fala soa a “entidade” em vez de “achar a garota”
- [x] Manter o gelado no fim: ela **não atravessa** — a mente ainda barra o caminho da janela
- [x] Fragmento “A garota” continua no tom de resgate

**Pronto quando:** a leitura do corredor é “preciso achar essa garota”.

*Se estiver bom, não reescrever. Pular para a Fase 2.*

---



## Fase 2 — Informática

**Objetivo:** o PC ligado conta a madrugada até o pânico de **sair**, sem a queda e sem o nome.

### Internet (histórico, horas antes de 03:17)


| Hora  | Busca                                                                   |
| ----- | ----------------------------------------------------------------------- |
| 01:52 | quanto falta pra amanhecer                                              |
| 02:16 | porta de emergência escola alarme                                       |
| 02:34 | como abrir porta trancada por dentro                                    |
| 02:51 | saída escola segundo andar                                              |
| 03:05 | **não mostrar inteiro** — cortado, apagado, ou “resultado indisponível” |




### Resto do desktop

- [x] Pastas vazias ou quase (mente ainda não libera arquivo)
- [x] Bloco / lixeira: no máximo um recorte inócuo. Sem *eu quero ir embora* neste unlock
- [x] Relógio da barra: **03:17**
- [x] Fala **uma vez** depois do histórico: *A gente tava tentando sair. Só isso.*
- [x] Fragmento novo, tipo **Como sair**: buscas de madrugada, porta, alarme, segundo andar

Objetivo do HUD pode continuar **Quem é a garota**. A informática explica o pânico; não troca a caçada.

**Pronto quando:** desbloquear o PC entrega até ~02:51, sem pulo e sem Marina.

---

### Trava do fundo do corredor (Fase 4 — não ligar agora)

O escuro no fundo **continua**. Quando a Fase 4 abrir, exigir estes fragmentos:

| Fragmento | ID | Quando |
| --- | --- | --- |
| A garota | `clue-mysterious-girl` | scare do corredor |
| Como sair | `clue-how-to-leave` | histórico do PC |
| Aviso de fechamento / alarme | `clue-closing-notice` | sala 13 (Fase 3) |
| Segundo andar / sair | `clue-second-floor` | sala 14 (Fase 3) |

Lista no código: `src/game/hallway/darkProgress.ts`. Não consultar em `hallwayStopZ` até a Fase 4.

---



## Fase 3 — Salas 13 e 14

Ainda é “como a gente sai”. Não é horror aleatório. Não é a janela da queda.

- [x] **Professores (13)** — `clue-closing-notice`: aviso de fechamento, alarme, algo burocrático. Zero nome da amiga
- [x] **Artes (14)** — `clue-second-floor`: tensão de “segundo andar” / sair, sem o pulo
- [ ] Chave errada continua *Não é essa.* Sem chave: *Trancada.*

**Pronto quando:** cada sala dá **um** fato de saída, não um dump da história.

---



## Fase 4 — Depois (não construir agora)

Só quando este documento for atualizado e a fase for aberta de propósito:

- Fim do corredor / caminho até a janela (outro ponto da escola, **não** a sala 11)
- Revelação do nome **Marina Alves**
- Reencontro: *Você tava tentando esquecer.*
- Memória da briga e *Eu só quero ir embora.*
- A queda. Tela preta. **03:17**
- Epílogo: **03:18**

O escuro no fundo do corredor **fica** até esta fase. É a trava da mente. Só abre com os fragmentos listados na Fase 2 (`darkProgress.ts`).

---



## Filtro rápido (todo texto novo)

Antes de gravar uma linha, passar nisto:

1. Soa como Lívia de 16?
2. Tem o nome Marina? → cortar
3. Entrega a queda ou “eu matei”? → cortar
4. O relógio anda? → não
5. Item de inventário conta origem? → não
6. Sobe mais de um degrau da lista? → cortar o extra

---



## Ordem

1. Fase 0
2. Fase 2
3. Fase 1 só se, no teste, o corredor destoar
4. Fase 3 quando a informática estiver boa
5. Fase 4 só com pedido explícito

**Agora:** Fase 3.