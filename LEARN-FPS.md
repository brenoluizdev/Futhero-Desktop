# 📄 Entendendo o Controle de FPS (FPS Limiter e FPS Unlocker)

Este documento explica como funcionam as ferramentas de controle de FPS (Frames por Segundo) e esclarece por que o FPS real pode ser menor do que o limite que você define.

---

## FPS Unlocker (Desbloqueador de FPS)

O **FPS Unlocker** é a ferramenta que remove todas as restrições de taxa de quadros impostas pelo navegador ou pelo sistema operacional.

- **Função:** Permite que o jogo utilize 100% da capacidade de renderização da sua placa de vídeo e CPU.
- **Resultado:** Se o seu hardware for potente, você verá o FPS subir para valores muito altos (ex: 500 FPS, 1000 FPS ou mais).

O valor que você vê no modo **Unlocker** é o **FPS Máximo Bruto** que seu computador consegue gerar no jogo.

---

## FPS Limiter (Limitador de FPS)

O **FPS Limiter** é a ferramenta que garante que o jogo **não exceda** um determinado valor de FPS.

- **Função:** Ele injeta um código que força um atraso entre a renderização de cada quadro, garantindo que o tempo entre eles seja igual ou superior ao necessário para atingir o limite definido.
- **Exemplo:** Se você define **120 FPS**, o limitador garante que o tempo entre cada frame seja de, no mínimo, 8.33 milissegundos (1000ms / 120).

### **A Dúvida Comum: Por que meu FPS é menor que o limite que eu defini?**

É **perfeitamente normal** que o FPS exibido seja **menor** do que o limite que você selecionou.

**O Limite de FPS é o Teto, Não a Garantia.**

O valor que você define (ex: 240 FPS) é o **teto máximo** que o jogo pode atingir. O FPS real que você vê é o **FPS Máximo Sustentável** do seu sistema naquele momento.

| Cenário | Limite Definido | FPS Máximo Bruto (Unlocker) | FPS Real Visto (Limiter) | Explicação |
| :--- | :--- | :--- | :--- | :--- |
| **Exemplo 1** | **240 FPS** | 500 FPS | **~200 FPS** | O jogo, devido à sua complexidade (física, renderização, lógica), leva mais tempo para processar um frame do que o ideal para 240 FPS. O limitador impede que ele suba para 500, mas o jogo só consegue renderizar 200 frames por segundo de forma consistente. |
| **Exemplo 2** | **60 FPS** | 500 FPS | **~60 FPS** | Como 60 FPS é uma taxa baixa, o jogo tem tempo de sobra para processar cada frame. O limitador consegue atrasar o frame com precisão para manter a taxa estável em 60 FPS. |

**Fatores que Reduzem o FPS Real:**

1.  **Tempo de Processamento do Jogo:** O Bonk.io precisa calcular a física, colisões e a lógica do jogo. Se essa etapa levar 5ms, o FPS máximo teórico será de 200 FPS (1000ms / 5ms), independentemente do limite que você defina.
2.  **Overhead do Limitador:** O código que faz a limitação (em JavaScript) adiciona um pequeno atraso.
3.  **Carga da CPU/GPU:** Em momentos de maior ação no jogo, a CPU ou a GPU podem não conseguir manter a taxa de quadros mais alta.

### **Conclusão para o Usuário**

Se você selecionou **340 FPS** e está vendo **200 FPS**, isso significa que:

- **O Limitador está funcionando corretamente:** Ele está impedindo que o FPS suba para o seu máximo (500 FPS).
- **Seu FPS Máximo Sustentável é 200:** O jogo não consegue rodar mais rápido do que isso no momento.

O limitador está fazendo o seu trabalho ao garantir que o FPS **não ultrapasse** o teto definido, proporcionando uma experiência mais estável e controlada. Se o FPS real estivesse acima do limite (ex: 250 FPS com o limite em 240 FPS), aí sim teríamos um bug.

---

*Se você deseja o FPS mais alto possível, use o **FPS Unlocker**. Se você deseja um FPS estável e controlado para monitores de alta taxa de atualização (ex: 144Hz), use o **FPS Limiter** e defina o valor do seu monitor.*
