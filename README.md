# Simulador de Trading de Criptomonedas

## 1. Descripción del proyecto

El proyecto consistirá en el desarrollo una aplicación web que permite simular la compra y venta de criptomonedas utilizando dinero virtual, donde se podrá consultar los precios de cada moneda. La aplicación obtendrá los precios de las criptomonedas periodicamente a través de una API externa y calculará el valor de los activos del usuario (si los tuviera) en función de los precios actuales. El usuario podrá consultar en su cartera virtual los activos que posee y sus respectivos valores. 

## 2. Descripción del Dominio

## 2.1 Problema de negocio

El mercado de las criptomonedas es vólatil y recibe cambios constantes: los precios de las monedas suben y bajan en periodos de tiempo relativamente cortos. También, el proceso de aprendizaje requiere dinero real lo cual supone un riesgo económico especialmente para principiantes que carecen de experiencia previa e desean integrarse en el mundo de trading de criptomonedas. 

Por este motivo, se propone diseñar y desarrollar una aplicación web que permite simular el trading de las criptomonedas es decir, la compra y venta de activos digitales (Bitcoin, Ethereum etc) sin utilizar dinero real. La aplicación permitirá gestionar una cartera virtual, con dinero ficticio además de consultar los precios de las criptomonedas y realizar operaciones simuladas de compra y venta. De esta forma, los usuarios podrán observar como cambian sus inversiones virtuales en función de la variación de los precios del mercado sin asumir riesgos económicos.

## 2.2 Casos de uso principales

**CU01 - Consultar criptomonedas.** El usuario visualiza las criptomonedas disponibles y sus precios actuales, junto con la hora de su última actualización. Los precios se sirven desde una caché compartida alimentada por una API externa.

**CU02 - Comprar activo.** El usuario compra una cantidad de una criptomoneda al precio actual si dispone de saldo suficiente. La operación descuenta el saldo, actualiza la posición, recalcula el precio medio de compra y se registra en el historial.

**CU03 - Vender activo.** El usuario vende hasta la cantidad que posea al precio actual. La operación incrementa el saldo, reduce la posición y se registra en el historial junto con la ganancia o pérdida realizada.

**CU04 - Registrarse e iniciar sesión.** Los usuarios nuevos crean una cuenta con nombre de usuario y contraseña, y los registrados inician sesión para acceder a su cartera.

**CU05 - Consultar cartera.** El usuario consulta su saldo y sus activos. Para cada activo se calcula el precio medio de compra, el valor actual y la ganancia o pérdida (absoluta y porcentual), además del valor total de la cartera.

**CU06 - Recargar saldo.** El usuario puede añadir saldo virtual cuando el suyo sea inferior a un umbral, con un máximo por recarga.

**CU07 - Actualizar precios (sistema).** El Market Service consulta periódicamente la API externa y actualiza la caché compartida que consumen los usuarios y el Trading Service.

## 3. Características Cloud según NIST SP 800-145 y Justificación del uso de la nube

### 3.1 Autoservicio bajo demanda

Para mi aplicación de simulación de trading de criptomonedas, el autoservicio bajo demanda permitirá aprovisionar y configurar los recursos necesarios para desplegar la aplicación sin intervención directa del proveedor. En concreto, el simulador requiere aprovisionar recursos como máquinas virtuales (para la ejecución de microservicios en contenedores), una base de datos, una caché (Redis para la consulta de precios) y la red. Se crearán estos recursos de forma automática mediante infraestructura como código (IaC) con Terraform sin solicitar recursos al proveedor.

### 3.2 Acceso amplio a la red

El simulador es una aplicación web accesible mediante internet que permite a los usuarios consultar los precios de las criptomonedas, gestionar sus activos y la cartera virtual desde varias dispositivos con conexión a la red. La plataforma expone su funcionalidad a través de una API REST sobre HTTP con respuestas en JSON, un mecanismo estandarizado, permitiendo que los usuarios pueden realizar operaciones desde navegadores web, dispositivos móviles siempre que tengan acceso a internet. 

### 3.3 Agrupación de recursos

La infraestructura cloud escogida para desplegar la aplicación proporcionará los recursos necesarios para poner en marcha los microservicios y almacenar los datos del simulador de trading de criptomonedas. Estos recursos forman parte de la infraestructura compartida entre múltiples consumidores. Donde la asignación y reasignación de recurosos será gestionado por el proveedor cloud en función de la demanda. Con esto se consigue que la aplicación aproveche los recursos ofrecidos por esta infraestructura sin tener que obtener servidores físicos propios.

### 3.4 Rápida elasticidad

El mercado podría sufrir fluctuaciones en los precios de las criptomonedas que podrían causar variaciones en la actividad de los usuarios del simulador y por tanto, podría aumentar la demanda de recursos computacionales. Por este motivo, la aplicación aprovecha la rápida elasticidad para aumentar la capacidad de la infraestructura cuando haya un elevado número de usuarios realizando operaciones así como reducirla cuando la demanda disminuya.

### 3.5 Servicio medido

La plataforma aprovechará el servicio medido para monitorizar el consumo de recursos además de las peticiones recibidas y tiempos de respuesta. En concreto, se podrá monitorizar el uso de CPU y memoria principal cuando los usuarios vayan a consultar los precios de criptomonedas, la realización de operaciones compraventa o tareas relacionadas con sus carteras virtuales. Estos datos nos darán una visión general del consumo de recursos y controlar los costes asociados al despliegue. 


### 3.6 Justificación del uso en la nube

El uso de la nube para desplegar el simulador de trading de criptomonedas se justifica por varios motivos. Una de las principales razones para utilizar una infraestructura cloud en el simulador es la posible variación de la demanda de usuarios. Como se ha mencionado en apartados previos, las fluctuaciones de los precios pueden provocar picos de actividad ya que un elevado número de usuarios podría acceder al simulador para consultar los precios del mercado o realizar la compraventa de monedas.

Por otro lado, al tratarse de una aplicación basada en microservicios, es evidente que habrá una carga asimétrica entre algunos servicios. En concreto, el servicio de consulta de precios tendrá muchisimas más peticiones que el servicio de compraventa por lo que cada servicio debe escalarse de forma distinta e independiente. Esto respalda la necesidad de aprovechar de la nube ya que algunos proveedores permiten ajustar de forma dinámica el número de instancias o la capacidad asignada.

Otro motivo por el que utilizar la infraesrtructura cloud es debido a la disponibilidad del simulador. El mercado opera de forma continua por lo que la app debe ser disponible en cualquier momento para que los usuarios puedan consultar sus activos y los precios actuales.la implementación en el cloud facilita la tolerancia a fallos, si alguna instancia falla se podrá desplegar otra de forma rápida evitando interrupciones del servicio.

## 4. Actores Cloud según NIST SP 500-292 y impacto económico

### 4.1 Actores Cloud

| Actor | Aplicación en el proyecto | Impacto económico |
|---|---|---|
| **Cloud Consumer** | El consumidor en este contexto sería el desarrollador de la plataforma que utiliza los recursos del proveedor necesarios para desplegar la aplicación.| En este caso, el impacto económico será prácticamente nulo ya que se empleará la capa gratuita de AWS respetando sus límites de uso. |
| **Cloud Provider** | El proveedor proporcionará la infraestructura y servicios de la nube necesarios para ejecutar el simulador. En este caso el proveedor de la infraestructura será AWS. | El uso del plan gratuito permitirá reducir los costes de infraestructura. Se respetarán las condiciones y límites para evitar cargos adicionales. Cabe mencionar, que el plan gratuito proporciona |
| **Cloud Broker** | En este caso, no habrá cloud broker ya que contactamos directamente con el proveedor. | Al no contratar servicios de un intermediario no habrán costes asociados. |
| **Cloud Auditor** | Este proyecto no contará con un auditor externo por lo que el desarrollador se hará responsable de realizar comprobaciones de seguridad además de asegurar el cumplimiento de RGPD y la LOPDGDD. | No habrá gastos de contratación de auditorías externas sin embargo, las comprobaciones internas requerirán la inversión de tiempo de trabajo. |
| **Cloud Carrier / Operator** | Los operadores de telecomunicaciones y proveedores de acceso a internest además de la red del proveedor permitirán transportar el tráfico entre los usuarios del simulador y la infraestuctura nube. | Se utilizará la conexión a internet ya disponible sin necesidad de contratar una conexión adicional para el proyecto. |


## 5. Arquitectura del sistema

### 5.1 Diagrama de arquitectura

### 5.1 Diagrama de arquitectura

A continuación se muestra el diagrama de arquitectura del sistema, con los componentes, los microservicios y los protocolos de comunicación entre ellos.

```mermaid
flowchart TB
    U["Usuario"]
    CLI["Cliente (navegador o herramienta HTTP)"]
    EXT["API externa de precios"]

    subgraph AWS["AWS - máquinas virtuales EC2 (aprovisionadas con Terraform)"]
        PROXY["Proxy inverso"]
        MARKET["Market Service"]
        TRADING["Trading Service"]
        REDIS[("Redis - caché de precios")]
        DB[("PostgreSQL - usuarios, saldos y posiciones")]
    end

    U --> CLI
    CLI -->|"HTTPS"| PROXY
    PROXY -->|"HTTP /api/market"| MARKET
    PROXY -->|"HTTP /api/*"| TRADING
    MARKET -->|"HTTPS - consulta periódica"| EXT
    MARKET -->|"Redis sobre TCP - escritura"| REDIS
    TRADING -->|"Redis sobre TCP - lectura"| REDIS
    TRADING -->|"PostgreSQL sobre TCP"| DB
```

### 5.2 Componentes

El simulador será una arquitectura basado en microservicios. En concreto, estará formado por dos microservicios principales: Trading Service y Market Service. A continuación se detallan sus respectivas responsabilidades 

- Market Service: El servicio permite obtener y actualizar los precios de las criptomonedas.

- Trading Service: Este microservicio permite gestionar las compras y ventas de las criptomonedas, administra el saldo virtual de los usuarios junto con el registro e inicio de sesión.

- Base de Datos PostgreSQL: Se ha optado por utilizar una base de datos relacional por la naturaleza estructurada de los datos del problema.

- API Externa: Conectará a la aplicación y permitirá obtener los precios actuales de las criptomonedas.

- Caché Compartida: Con el fin de reducir un elevado número de peticiones a la API externa se ha optado por incluir una caché compartida para almacenar los últimos precios obtenidos para evitar sobrecargar la API externa. Esta caché se implementará mediante Redis.

### 5.3 Comunicación entre Microservicios

- Ambos microservicios (Trading Service y Market Service) se comunicará mediante peticiones HTTP a la API REST interna del servicio correspondiente. 

- El servicio de mercado (Market Service) se comunicará a través del protocolo HTTP a una API externa que proporcionará los precios actuales de las criptomonedas.

- Ambos microservicios comunicarán con la caché compartida mediante el protocolo Redis sobre TCP. 

- El acceso a la base de datos se realizará mediante el protocolo nativo TCP para la gestión de los datos de la aplicación.

## 6. Especificación de la API REST

Ambos servicios exponen una API REST sobre HTTP con payloads en JSON. Un proxy inverso situado delante de ellos enruta las peticiones por prefijo: `/api/market/*` al Market Service y el resto de rutas `/api/*` al Trading Service. Los endpoints del Trading Service, salvo el registro y el inicio de sesión, requieren un token JWT en la cabecera `Authorization: Bearer <token>`. El usuario se identifica siempre a partir del token, nunca por un parámetro de la petición, lo que garantiza que cada usuario solo accede a sus propios datos.

### 6.1 Market Service

| Método | Ruta | Descripción | Caso de uso |
|---|---|---|---|
| GET | `/api/market/prices` | Lista las criptomonedas disponibles con su precio actual | CU01 |
| GET | `/api/market/prices/{symbol}` | Precio actual de una criptomoneda | CU01 |
| GET | `/health` | Estado del servicio | — |

Los precios se leen de la caché compartida (Redis). La actualización periódica desde la API externa (CU07) es un proceso interno del servicio y no expone ningún endpoint.

**`GET /api/market/prices` → 200**

```json
{
  "updatedAt": "2026-10-17T10:30:00Z",
  "prices": [
    { "symbol": "BTC", "name": "Bitcoin", "priceEur": 61250.40 },
    { "symbol": "ETH", "name": "Ethereum", "priceEur": 2480.15 }
  ]
}
```

### 6.2 Trading Service

| Método | Ruta | Descripción | Caso de uso | Auth |
|---|---|---|---|---|
| POST | `/api/auth/register` | Registra un usuario nuevo | CU04 | No |
| POST | `/api/auth/login` | Inicia sesión y devuelve un token JWT | CU04 | No |
| GET | `/api/portfolio` | Saldo, activos, precio medio, valor actual y ganancia o pérdida | CU05 | Sí |
| POST | `/api/operations` | Ejecuta una compra o una venta | CU02, CU03 | Sí |
| POST | `/api/wallet/deposit` | Añade saldo virtual | CU06 | Sí |
| GET | `/health` | Estado del servicio | — | No |

**`POST /api/auth/register` → 201**

```json
// Petición
{ "username": "ana", "password": "********" }

// Respuesta
{ "id": 1, "username": "ana", "balanceEur": 10000.00 }
```

**`POST /api/auth/login` → 200**

```json
// Petición
{ "username": "ana", "password": "********" }

// Respuesta
{ "token": "eyJhbGciOi...", "expiresIn": 3600 }
```

**`POST /api/operations` (compra) → 201**

El precio lo fija el servidor a partir de la caché; el cliente solo envía el símbolo, el tipo y la cantidad.

```json
// Petición
{ "symbol": "BTC", "type": "BUY", "quantity": 0.01 }

// Respuesta
{
  "id": 42,
  "symbol": "BTC",
  "type": "BUY",
  "quantity": 0.01,
  "priceEur": 61250.40,
  "totalEur": 612.50,
  "realizedPnlEur": null,
  "createdAt": "2026-10-17T10:31:05Z"
}
```

En una venta, `type` es `SELL` y `realizedPnlEur` contiene la ganancia o pérdida realizada.

**`GET /api/portfolio` → 200**

```json
{
  "balanceEur": 9387.50,
  "assets": [
    {
      "symbol": "BTC",
      "quantity": 0.01,
      "avgBuyPriceEur": 61250.40,
      "currentPriceEur": 62000.00,
      "currentValueEur": 620.00,
      "pnlEur": 7.50,
      "pnlPercent": 1.22
    }
  ],
  "totalValueEur": 10007.50
}
```

**`POST /api/wallet/deposit` → 200**

Solo se permite si el saldo es inferior a 100 € y con un máximo de 10.000 € por recarga.

```json
// Petición
{ "amountEur": 5000 }

// Respuesta
{ "balanceEur": 5042.30 }
```

### 6.3 Códigos de error

| Código | Cuándo se devuelve |
|---|---|
| 400 | Datos inválidos (cantidad negativa, símbolo desconocido) |
| 401 | Token ausente, inválido o caducado; credenciales incorrectas |
| 409 | El nombre de usuario ya existe |
| 422 | Regla de negocio incumplida (saldo insuficiente, unidades insuficientes, recarga no permitida) |
| 503 | Precios no disponibles temporalmente |

Los errores devuelven un cuerpo con la forma `{ "error": "INSUFFICIENT_BALANCE", "message": "..." }`.


