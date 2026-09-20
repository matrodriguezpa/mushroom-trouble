# Sistema de estadísticas y balance de cartas

Cada carta se diseña a partir de **tres estadísticas principales**:

* **Ataque**
* **Defensa**
* **Duración**

Cada estadística tiene un valor de **0 a 3**.

Las características descriptivas de cada estadística se conservan para indicar **cómo funciona** la carta, mientras que el valor de 0 a 3 resume su nivel general dentro de esa estadística.

El objetivo es utilizar estas tres puntuaciones como un **presupuesto de poder inicial**.

### Presupuesto de poder

Una carta estándar tendrá:

**Ataque + Defensa + Duración = 0–9**

Como regla inicial, las cartas deberían mantenerse dentro de este rango.

Sin embargo, la suma no debe considerarse una ley absoluta. Dos cartas con el mismo total pueden tener valores muy diferentes en partida debido a su coste de acción, movilidad, alcance, condiciones de uso o sinergias.

Por tanto:

> **El 0–9 sirve para diseñar y comparar cartas; el balance definitivo se determina mediante pruebas de juego.**

---

# 1. RAREZA

La rareza no representa directamente el poder de una carta.

Representa principalmente su **especialización, complejidad y singularidad mecánica**.

* Común
* Raro
* Épico
* Legendario
* Mítico

Las cartas comunes deberían representar efectos fundamentales y fáciles de comprender.

Las cartas de mayor rareza pueden introducir mecánicas más específicas, excepcionales o difíciles de utilizar correctamente.

Por ejemplo:

* ataques múltiples
* ataques en área
* defensas contra determinados tipos de ataque
* efectos que modifican las reglas normales
* interacciones muy específicas con otras cartas

**Regla de balance:**

> Una carta no debe ser más poderosa simplemente por ser más rara.

La rareza puede limitar la disponibilidad de una mecánica, pero no debe utilizarse para justificar que una carta tenga estadísticas excesivas. Este enfoque coincide con una línea de diseño documentada en la que la rareza se utiliza para representar especialización en lugar de poder bruto.

---

# 2. COSTE DE ACCIÓN / TURNOS

El coste de turno representa **cuánto tiempo de acción necesita una carta para generar su efecto**.

Este sistema no forma parte de las tres estadísticas principales. Es un **modificador de balance**.

Existen cuatro categorías:

### TROPA

**Gasta una acción al colocarse y una acción al atacar.**

Son unidades completas de combate.

Por pagar acciones constantemente, pueden concentrar una mayor cantidad de poder directamente en sus estadísticas.

Normalmente destacan por:

* mayor duración
* mayor capacidad de ataque
* presencia constante en el tablero

**Trade-off principal:**

> Si una Tropa posee mucho poder ofensivo y defensivo, su coste de acciones debe impedir que utilice ambas capacidades sin comprometer el turno.

Una Tropa muy poderosa no debería, además, tener simultáneamente gran alcance, gran cobertura defensiva y gran duración sin una restricción adicional.

---

### ESTRUCTURA

**Gasta una acción al colocarse, pero no al atacar.**

Son permanentes que permanecen en una posición determinada y generan presión sin consumir continuamente acciones.

Por ello, su ataque normalmente debe ser:

* limitado
* poco potente
* fácil de bloquear
* dependiente de la posición
* o especializado contra determinados objetivos

Pueden tener buena duración física, pero no deberían combinar fácilmente:

**ataque gratuito + gran alcance + gran daño + gran duración.**

**Trade-off principal:**

> Ahorrar la acción de ataque debe pagarse principalmente mediante una capacidad ofensiva limitada.

Una Estructura puede atacar muchas veces durante la partida, pero cada ataque individual debería aportar poco valor o depender fuertemente de la situación.

---

### TRAMPA

**No gasta una acción al colocarse, pero gasta una acción al activarse o atacar.**

Su principal función es crear una **amenaza potencial**.

La fuerza de una Trampa no depende necesariamente de cuánto daño hace cuando se activa, sino de cómo obliga al rival a considerar sus movimientos.

Por ello, debe existir una diferencia entre:

**poder de amenaza** y **poder de ejecución**.

**Trade-off principal:**

> Cuanto más libre sea la colocación de una Trampa, más limitada debería ser su capacidad de ejecución.

Una carta que puede colocarse prácticamente en cualquier lugar y además atacar a distancia, en área y con gran potencia acumularía demasiadas ventajas independientes.

Por tanto, las Trampas deberían pagar su libertad mediante alguna combinación de:

* bajo daño
* objetivos limitados
* condición de activación
* alcance limitado
* poca duración
* imposibilidad de desplazarse
* dependencia de la posición enemiga

---

### SOPORTE

**No gasta una acción al colocarse y no gasta una acción al utilizar su efecto.**

Por esta razón, el soporte debe tener muy poco poder directo de combate.

Su valor procede principalmente de:

* curar
* reforzar
* proteger
* recuperar cartas
* modificar otras cartas
* preparar futuras jugadas

**Trade-off principal:**

> Si una carta genera valor sin consumir acciones, debe sacrificar capacidad de combate directo.

Un Soporte no debería ser simultáneamente una fuente importante de ataque, defensa y utilidad gratuita.

Especialmente peligrosas serían las cartas que:

**se colocan gratis + actúan gratis + duran mucho + mejoran otras cartas.**

Si una carta posee varias de esas características, debe existir una restricción fuerte en otro aspecto.

---

# 3. ATAQUE

El Ataque describe principalmente **cuántos objetivos puede afectar y desde qué distancia puede hacerlo**.

Se combinan dos características:

* **Cantidad de objetivos:** uno / varios
* **Alcance:** cuerpo a cuerpo / distancia

El valor inicial puede representarse así:

| Combinación                        | Ataque |
| ---------------------------------- | -----: |
| Varios objetivos + distancia       |      3 |
| Un objetivo + distancia            |      2 |
| Varios objetivos + cuerpo a cuerpo |      1 |
| Un objetivo + cuerpo a cuerpo      |      0 |

La puntuación representa la **capacidad ofensiva potencial**, no necesariamente el daño exacto.

### Trade-off

Una puntuación alta de Ataque debería dificultar que la misma carta sea excelente simultáneamente en Defensa y Duración.

Especialmente costosas en términos de balance son las combinaciones:

**varios objetivos + distancia + alta Duración**

o

**varios objetivos + distancia + alta Defensa.**

Una carta con gran cobertura ofensiva y alta supervivencia puede comenzar a sustituir demasiadas funciones dentro del juego.

Por el contrario:

**Ataque 0 + Defensa alta + Duración alta**

puede representar una carta puramente defensiva.

---

# 4. DEFENSA

La Defensa describe **cuánto territorio o cuántos objetivos puede proteger y qué tan fácilmente puede cambiar esa protección de posición**.

Se combinan dos características:

* **Cobertura:** área / objetivo único
* **Movilidad defensiva:** móvil / inmóvil

El valor inicial puede representarse así:

| Combinación              | Defensa |
| ------------------------ | ------: |
| Área + móvil             |       3 |
| Área + inmóvil           |       2 |
| Objetivo único + móvil   |       1 |
| Objetivo único + inmóvil |       0 |

Aquí "móvil" no significa simplemente que la carta pueda moverse.

Significa que su capacidad defensiva puede **cambiar de lugar para proteger distintos objetivos o posiciones**.

### Trade-off

La capacidad de proteger muchas posiciones simultáneamente es muy valiosa.

Por ello:

> Cuanto mayor sea la cobertura defensiva y la movilidad defensiva de una carta, menor debería ser su capacidad ofensiva directa, salvo que exista otra restricción clara.

Una carta que:

* protege un área,
* puede desplazarse,
* tiene mucho Ataque,
* y además tiene mucha Duración

está acumulando cuatro ventajas importantes y necesita una limitación adicional.

Una carta defensiva especializada puede, en cambio, tener:

**Defensa 3 + Ataque 0 + Duración alta**

sin resultar necesariamente problemática, porque ha renunciado a convertir su presencia en presión ofensiva.

---

# 5. DURACIÓN

La Duración describe **cuánto tiempo y cuántas veces puede existir o funcionar una carta antes de desaparecer**.

Se utilizan dos características:

* **Permanencia por turnos:** mantiene su salud durante los turnos / pierde salud con el paso de los turnos.
* **Permanencia por uso:** conserva sus vidas o usos al actuar / pierde vidas o usos al actuar.

Las cuatro combinaciones pueden representarse así:

| Combinación                              | Duración |
| ---------------------------------------- | -------: |
| No pierde por turnos + no pierde por uso |        3 |
| No pierde por turnos + pierde por uso    |        2 |
| Pierde por turnos + no pierde por uso    |        1 |
| Pierde por turnos + pierde por uso       |        0 |

Esto genera cuatro formas fundamentales de permanencia:

### Duración 3 — Permanente

La carta no se desgasta automáticamente con el paso de los turnos ni por utilizar su acción.

Representa la mayor capacidad de permanencia.

### Duración 2 — Usos limitados

La carta permanece en el tablero, pero sus acciones reducen sus vidas, cargas o usos disponibles.

### Duración 1 — Temporal

La carta puede utilizarse varias veces mientras permanezca activa, pero pierde duración con el paso de los turnos.

### Duración 0 — Consumible

La carta desaparece rápidamente debido al paso del tiempo y/o al uso de su efecto.

### Trade-off

La Duración representa **la cantidad de oportunidades que una carta tiene para convertir sus otras estadísticas en valor**.

Por ello:

> Cuanto mayor sea la Duración, más cuidadoso debe ser el diseño de Ataque y Defensa.

Una carta con Ataque 3 y Duración 3 puede generar valor repetidamente durante muchos turnos.

Una carta con Ataque 3 y Duración 0 puede, en cambio, representar una amenaza explosiva de una sola oportunidad.

Esto permite que una carta sea extremadamente fuerte en un momento determinado sin necesariamente ser dominante durante toda la partida.

---

# 6. REGLA GENERAL DE TRADE-OFF

Las tres estadísticas no tienen que ser diferentes siempre.

Lo importante es evitar que una carta acumule **poder, supervivencia y libertad de uso** sin pagar algún precio.

Una buena regla inicial es:

> **Cuando una carta recibe una ventaja importante en una dimensión, debe perder capacidad en otra dimensión o adquirir una restricción de uso.**

Ejemplos:

### Mucho Ataque

Puede compensarse con:

* poca Defensa
* poca Duración
* alto coste de acción
* alcance restringido
* objetivos restringidos
* condición de activación

### Mucha Defensa

Puede compensarse con:

* poco Ataque
* poca movilidad
* poca Duración
* necesidad de estar en una posición determinada
* coste de colocación

### Mucha Duración

Puede compensarse con:

* Ataque bajo
* Defensa baja
* coste elevado
* escasa movilidad
* efecto lento o condicionado

### Mucha libertad de colocación

Puede compensarse con:

* menor Ataque
* menor Defensa
* menor Duración
* efectos más especializados

### Ataque gratuito

Puede compensarse con:

* Ataque bajo
* alcance limitado
* objetivos limitados
* activación condicionada
* poca Duración

### Colocación gratuita

Puede compensarse con:

* estadísticas bajas
* posición fija
* condición de activación
* efecto especializado

### Varias ventajas simultáneas

Cuando una carta posee varias ventajas, no es suficiente con reducir una sola estadística.

Por ejemplo:

**Ataque 3 + Defensa 3 + Duración 3**

debería considerarse una señal de alerta independientemente de su rareza.

---

# 7. REGLAS DURAS Y REGLAS BLANDAS

No todas las reglas deben ser absolutas.

### Reglas duras

Son restricciones que protegen la estructura del juego.

Por ejemplo:

* una carta con uso gratuito no debería tener simultáneamente una capacidad ofensiva excepcional;
* la rareza no debe utilizarse como justificación de poder bruto;
* una carta no debería obtener simultáneamente todas las ventajas del sistema sin una restricción equivalente;
* una carta que rompe una regla fundamental debe tener un coste o condición especialmente claro.

### Reglas blandas

Son principios que ayudan a diseñar, pero pueden romperse cuando existe una buena razón.

Por ejemplo:

* Ataque alto suele combinarse con Duración baja;
* Defensa alta suele combinarse con Ataque bajo;
* movilidad alta suele reducir otras ventajas;
* alcance alto suele reducir otras ventajas;
* efectos gratuitos suelen ser menos potentes directamente.

Estas reglas deben poder romperse para crear cartas especiales.

### Reglas que solamente debe decidir el playtesting

No debería fijarse únicamente mediante teoría:

* cuánto vale exactamente una unidad de daño;
* cuánto vale exactamente una vida;
* cuánto vale la movilidad;
* cuánto vale atacar a distancia;
* cuánto vale atacar múltiples objetivos;
* cuánto vale proteger un área;
* qué combinaciones son realmente dominantes.

El balance inicial puede reducir mucho el espacio de búsqueda, pero el metajuego real puede encontrar interacciones que el diseñador no anticipó.

---

# 8. LOS CUATRO MAPAS DEL SISTEMA

El sistema puede representarse visualmente mediante cuatro mapas.

## Mapa 1 — Poder de combate

```text
        ATAQUE
       0 ── 3

      /       \

 DEFENSA ─── DURACIÓN
  0 ── 3       0 ── 3
```

Este es el mapa principal.

La carta se resume como:

**A / D / T**

Por ejemplo:

**3 / 0 / 1**

representaría una carta muy ofensiva, poco defensiva y de duración limitada.

---

## Mapa 2 — Ataque

```text
                 DISTANCIA
                    ↑
                    │
             2      │      3
       uno + distancia   varios + distancia
                    │
                    │
             0      │      1
       uno + cuerpo      varios + cuerpo
                    │
                    └──────────────→
```

Este mapa determina el valor de Ataque de 0 a 3.

---

## Mapa 3 — Defensa

```text
                 COBERTURA
                    ↑
                    │
             2      │      3
          área + fija     área + móvil
                    │
             0      │      1
       objetivo + fija   objetivo + móvil
                    │
                    └──────────────→ MOVILIDAD
```

Este mapa determina el valor de Defensa de 0 a 3.

---

## Mapa 4 — Duración

```text
                    NO SE DESGASTA
                         ↑
                         │
             1           │           3
     pierde por turnos   │      permanente
                         │
             0           │           2
       pierde por ambos  │     pierde por uso
                         │
                         └──────────────→
                              NO SE
                            DESGASTA
                            POR USO
```

Este mapa determina la Duración de 0 a 3.

---

# 9. REGLA FINAL DE DISEÑO

El objetivo no es crear cartas con valores diferentes.

El objetivo es crear cartas que sean **buenas en situaciones diferentes**.

Una carta no debería preguntarse:

> "¿Cómo hago esta carta más poderosa?"

sino:

> "¿Qué función quiero que cumpla y qué debe sacrificar para cumplirla?"

Esto permite crear arquetipos diferentes sin convertir cada carta en una versión estadísticamente superior de otra.

Una carta puede ser:

**3 Ataque / 0 Defensa / 1 Duración**

y ser excelente para atacar rápidamente.

Otra puede ser:

**0 Ataque / 3 Defensa / 3 Duración**

y ser excelente para controlar territorio.

Otra puede ser:

**1 Ataque / 2 Defensa / 2 Duración**

y funcionar como una unidad equilibrada.

Ninguna debería ser automáticamente "mejor"; deben resolver problemas diferentes.

El sistema de 0–9 sirve como **marco de construcción**, no como sustituto del diseño de juego. La validación final debe realizarse mediante pruebas iterativas y comparación entre las cartas que compiten por cumplir la misma función. Diseñar alrededor de una curva inicial de poder y después ajustarla mediante varias iteraciones es una práctica documentada en diseño de juegos de cartas.

