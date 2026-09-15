# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Contexto del proyecto

Este repositorio es el entregable del **Taller 1 de Computación Gráfica (UI/UX, Diseño, herramientas de diseño)**, cursado por **Martín Barrero López** y **Geraldine Bedoya Sanchez**. El ejercicio consiste en el **rediseño del flujo completo de un servicio digital**; el servicio elegido fue **Domino's Pizza Colombia** (https://www.dominos.com.co/, categoría e-commerce).

El análisis completo (crítica de UI/UX de la página original, comparación con Papa John's, documentación de flujo y propuesta de rediseño) está en `Taller 1 Computación Gráfica - Martín Barrero y Geraldine Bedoya.pdf`, en la raíz del repo. Consultarlo para cualquier duda de justificación de diseño que no esté resumida aquí.

**Todo el desarrollo es solo front-end**: es interactivo (estado, formularios, wizard, validaciones) pero no hay backend ni persistencia real; los datos, pedidos y "pagos" son simulados en el cliente.

### Resumen del diagnóstico (de qué se está corrigiendo)

La página original de Domino's se identificó como fría, poco acogedora y con mal manejo del espacio. Puntos concretos que el rediseño debe resolver:

- **Jerarquía de color**: el azul competía visualmente con el rojo (la marca es predominantemente roja); el rojo debe dominar y el azul quedar como acento secundario.
- **Espacio desaprovechado**: mucho margen lateral vacío, imágenes forzadas a tamaños pequeños con letra ilegible pudiendo usar más espacio.
- **Imágenes genéricas**: poco cálidas/familiares (a diferencia de Papa John's, cuyo Hero con la pizza en su caja transmite cercanía).
- **Footer desproporcionado** y desalineado frente al poco contenido que tiene; ese espacio debería aprovecharse en el header.
- **Menú**: precios no visibles hasta el checkout (genera desconfianza) y letra pequeña que obliga a hacer clic para ver info básica.
- **Formulario de domicilio**: no marca campos obligatorios y el botón "Continuar" simplemente se deshabilita en vez de explicar qué falta.
- **Personalización de pizza**: demasiada información en un solo formulario largo; debería dividirse en pasos para no saturar.
- **Login/formularios**: apariencia anticuada.
- Punto positivo a conservar: el selector de tienda con **mapa satelital** para "recoger en tienda".

### Prompts de diseño (Figma Make)

El código base actual se generó a partir de estos prompts en Figma Make. Se implementaron hasta el **03**; **04, 05 y 06 siguen pendientes** de traer al código.

1. **Home (Hero + recomendaciones)** — Header compacto (logo, nav: Pedir en línea/Menú/Tiendas/Promos, cuenta, carrito), Hero de ancho completo con pizza recién horneada saliendo de su caja + CTA rojo, sección "Recomendaciones" con cards grandes (imagen, nombre, precio, "Pedir ya"). Rojo dominante, azul solo acento. Sin espacios laterales vacíos ni letra pequeña.
2. **Menú / Promos** — Grid de cards de pizza (imagen grande, nombre, descripción corta, precio visible desde el inicio, botón "Agregar"), filtros por categoría (Pizzas, Acompañamientos, Bebidas, Postres) arriba, buen espaciado.
3. **Formulario de domicilio / tienda** — Campos: tipo de vía, número, tipo de inmueble, instrucciones. Obligatorios marcados con asterisco rojo. Botón "Continuar" siempre activo; al fallar validación resalta el campo en rojo con mensaje corto ("Este campo es obligatorio") en vez de deshabilitarse. Toggle arriba para alternativa "Recoger en tienda" con mapa satelital de tiendas cercanas.
4. **Personalizar pizza (wizard)** — *(pendiente)* 4 pasos en pantallas completas (mitad y mitad → tamaño/masa → ingredientes → resumen/precio), barra de progreso arriba, panel lateral fijo con vista previa y precio en tiempo real, botones Atrás/Siguiente.
5. **Login / registro** — *(pendiente)* Modal moderno: correo, contraseña, "¿Olvidaste tu contraseña?", dos botones ("Iniciar sesión para esta orden" / "Iniciar sesión y dejarla abierta"), enlace de registro, opción de invitado.
6. **Checkout / finalización** — *(pendiente)* Resumen de pedido con imágenes pequeñas, cantidad y precio por ítem, subtotal, domicilio y total, método de pago, botón de confirmación grande en rojo.

Al continuar el desarrollo, seguir usando estos prompts (y el diagnóstico de arriba) como fuente de verdad de los requisitos de cada pantalla, en lugar de inventar alcance nuevo.

## Stack y estructura técnica

@AGENTS.md
