-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: podologia
-- ------------------------------------------------------
-- Server version	8.0.45

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `anamnesis_paciente`
--

DROP TABLE IF EXISTS `anamnesis_paciente`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `anamnesis_paciente` (
  `id` varchar(36) NOT NULL DEFAULT (uuid()),
  `clinica_id` varchar(36) NOT NULL,
  `paciente_id` varchar(36) NOT NULL,
  `podologo_verificador_id` varchar(36) DEFAULT NULL,
  `fecha_verificacion` timestamp NULL DEFAULT NULL,
  `profesion` varchar(150) DEFAULT NULL,
  `contacto_emergencia_nombre` varchar(150) DEFAULT NULL,
  `contacto_emergencia_telefono` varchar(20) DEFAULT NULL,
  `como_nos_encontro` enum('EVENTO','INSTAGRAM','INTERNET','RECOMENDACION','OTRO') DEFAULT NULL,
  `toma_medicamentos` tinyint(1) DEFAULT '0',
  `lista_medicamentos` text,
  `esta_embarazada` tinyint(1) DEFAULT '0',
  `semana_embarazo` int DEFAULT NULL,
  `embarazo_alto_riesgo` tinyint(1) DEFAULT '0',
  `embarazo_detalles` text,
  `tuvo_cirugias_lesiones` tinyint(1) DEFAULT '0',
  `lista_cirugias_lesiones` text,
  `ha_recibido_reflexologia` tinyint(1) DEFAULT '0',
  `motivo_consulta` text,
  `objetivos_sesion` text,
  `discapacidad` text,
  `alergias` text,
  `condicion_cancer` tinyint(1) DEFAULT '0',
  `condicion_dolor_cabeza` tinyint(1) DEFAULT '0',
  `condicion_artritis` tinyint(1) DEFAULT '0',
  `condicion_diabetes` tinyint(1) DEFAULT '0',
  `condicion_presion_alterada` tinyint(1) DEFAULT '0',
  `condicion_neuropatia` tinyint(1) DEFAULT '0',
  `condicion_fibromialgia` tinyint(1) DEFAULT '0',
  `condicion_infarto` tinyint(1) DEFAULT '0',
  `condicion_enfermedad_renal` tinyint(1) DEFAULT '0',
  `condicion_trombosis` tinyint(1) DEFAULT '0',
  `condicion_entumecimiento` tinyint(1) DEFAULT '0',
  `condicion_esguinces` tinyint(1) DEFAULT '0',
  `condicion_explicacion` text,
  `mapa_corporal_url` varchar(255) DEFAULT NULL COMMENT 'Ruta de la imagen si el podólogo dibuja o escanea el mapa',
  `escala_sueno` int DEFAULT NULL,
  `escala_energia` int DEFAULT NULL,
  `escala_estres` int DEFAULT NULL,
  `escala_nutricion` int DEFAULT NULL,
  `escala_ejercicio` int DEFAULT NULL,
  `acepta_terminos` tinyint(1) DEFAULT '0',
  `lugar_firma` varchar(150) DEFAULT NULL,
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_actualizacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_anamnesis_paciente` (`paciente_id`),
  KEY `idx_anamnesis_clinica` (`clinica_id`),
  KEY `fk_anamnesis_podologo` (`podologo_verificador_id`),
  CONSTRAINT `fk_anamnesis_clinica` FOREIGN KEY (`clinica_id`) REFERENCES `clinicas` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_anamnesis_paciente` FOREIGN KEY (`paciente_id`) REFERENCES `pacientes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_anamnesis_podologo` FOREIGN KEY (`podologo_verificador_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL,
  CONSTRAINT `chk_escala_ejercicio` CHECK ((`escala_ejercicio` between 1 and 5)),
  CONSTRAINT `chk_escala_energia` CHECK ((`escala_energia` between 1 and 5)),
  CONSTRAINT `chk_escala_estres` CHECK ((`escala_estres` between 1 and 5)),
  CONSTRAINT `chk_escala_nutricion` CHECK ((`escala_nutricion` between 1 and 5)),
  CONSTRAINT `chk_escala_sueno` CHECK ((`escala_sueno` between 1 and 5))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `categorias_inventario`
--

DROP TABLE IF EXISTS `categorias_inventario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categorias_inventario` (
  `id` varchar(36) NOT NULL DEFAULT (uuid()),
  `nombre` varchar(50) NOT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  `esta_activo` tinyint(1) DEFAULT '1',
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_categoria_nombre` (`nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Catálogo global de categorías de inventario';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `citas`
--

DROP TABLE IF EXISTS `citas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `citas` (
  `id` varchar(36) NOT NULL DEFAULT (uuid()),
  `clinica_id` varchar(36) NOT NULL,
  `paciente_id` varchar(36) NOT NULL,
  `podologo_id` varchar(36) NOT NULL,
  `servicio_id` varchar(36) DEFAULT NULL,
  `fecha_programada` date NOT NULL,
  `hora_programada` time NOT NULL,
  `duracion_minutos` int NOT NULL DEFAULT '60',
  `estado` enum('PROGRAMADA','CONFIRMADA','COMPLETADA','CANCELADA') DEFAULT 'PROGRAMADA',
  `notas` text,
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_actualizacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `servicio_id` (`servicio_id`),
  KEY `idx_citas_clinica` (`clinica_id`),
  KEY `idx_citas_paciente` (`paciente_id`),
  KEY `idx_citas_podologo` (`podologo_id`),
  KEY `idx_citas_fecha` (`fecha_programada`),
  KEY `idx_citas_estado` (`estado`),
  KEY `idx_citas_semana` (`podologo_id`,`fecha_programada`,`hora_programada`),
  CONSTRAINT `citas_ibfk_1` FOREIGN KEY (`clinica_id`) REFERENCES `clinicas` (`id`) ON DELETE CASCADE,
  CONSTRAINT `citas_ibfk_2` FOREIGN KEY (`paciente_id`) REFERENCES `pacientes` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `citas_ibfk_3` FOREIGN KEY (`podologo_id`) REFERENCES `usuarios` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `citas_ibfk_4` FOREIGN KEY (`servicio_id`) REFERENCES `servicios` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `clinicas`
--

DROP TABLE IF EXISTS `clinicas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `clinicas` (
  `id` varchar(36) NOT NULL DEFAULT (uuid()),
  `nombre` varchar(255) NOT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `correo` varchar(255) DEFAULT NULL,
  `codigo_postal` varchar(5) DEFAULT NULL,
  `estado` varchar(100) DEFAULT NULL,
  `municipio` varchar(100) DEFAULT NULL,
  `ciudad` varchar(100) DEFAULT NULL,
  `colonia` varchar(100) DEFAULT NULL,
  `calle_y_numero` varchar(255) DEFAULT NULL,
  `esta_activa` tinyint(1) DEFAULT '1',
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `platform_admin_id` varchar(36) DEFAULT NULL COMMENT 'SuperAdmin que gestiona o registró esta clínica',
  `plan_suscripcion_id` varchar(36) DEFAULT NULL COMMENT 'ID del plan actual contratado',
  `fecha_vencimiento_suscripcion` date DEFAULT NULL COMMENT 'Fecha límite operativa antes del bloqueo por impago',
  `dominio_personalizado` varchar(255) DEFAULT NULL COMMENT 'Subdominio exclusivo ej: clinicasur.tudominio.com',
  `configuracion_visual` json DEFAULT NULL COMMENT 'JSON: { logo_url: "", color_primario: "", color_secundario: "", mensaje_bienvenida: "" }',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_clinicas_dominio` (`dominio_personalizado`),
  KEY `fk_clinicas_platform_admin` (`platform_admin_id`),
  KEY `fk_clinicas_plan` (`plan_suscripcion_id`),
  CONSTRAINT `fk_clinicas_plan` FOREIGN KEY (`plan_suscripcion_id`) REFERENCES `subscription_plans` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_clinicas_platform_admin` FOREIGN KEY (`platform_admin_id`) REFERENCES `platform_admins` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `consentimientos_informados`
--

DROP TABLE IF EXISTS `consentimientos_informados`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `consentimientos_informados` (
  `id` varchar(36) NOT NULL DEFAULT (uuid()),
  `clinica_id` varchar(36) NOT NULL,
  `paciente_id` varchar(36) NOT NULL,
  `cita_id` varchar(36) DEFAULT NULL,
  `procedimiento` varchar(255) NOT NULL,
  `estado_firma` enum('PENDIENTE','FIRMADO') DEFAULT 'PENDIENTE',
  `url_documento_firmado` varchar(255) DEFAULT NULL COMMENT 'Ruta del PDF o escaneo',
  `fecha_firma` timestamp NULL DEFAULT NULL,
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_consentimientos_clinica` (`clinica_id`),
  KEY `idx_consentimientos_paciente` (`paciente_id`),
  KEY `idx_consentimientos_cita` (`cita_id`),
  CONSTRAINT `fk_consentimientos_cita` FOREIGN KEY (`cita_id`) REFERENCES `citas` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_consentimientos_clinica` FOREIGN KEY (`clinica_id`) REFERENCES `clinicas` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_consentimientos_paciente` FOREIGN KEY (`paciente_id`) REFERENCES `pacientes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `consulta_recetas`
--

DROP TABLE IF EXISTS `consulta_recetas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `consulta_recetas` (
  `id` char(36) NOT NULL,
  `consulta_id` char(36) NOT NULL,
  `producto_id` char(36) NOT NULL,
  `cantidad` int DEFAULT '1',
  `precio_unitario_venta` decimal(10,2) DEFAULT NULL,
  `indicaciones_uso` text,
  PRIMARY KEY (`id`),
  KEY `consulta_id` (`consulta_id`),
  KEY `producto_id` (`producto_id`),
  CONSTRAINT `consulta_recetas_ibfk_1` FOREIGN KEY (`consulta_id`) REFERENCES `consultas` (`id`),
  CONSTRAINT `consulta_recetas_ibfk_2` FOREIGN KEY (`producto_id`) REFERENCES `inventario` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `consulta_recetas_lotes`
--

DROP TABLE IF EXISTS `consulta_recetas_lotes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `consulta_recetas_lotes` (
  `id` varchar(36) NOT NULL DEFAULT (uuid()),
  `receta_id` varchar(36) NOT NULL COMMENT 'Referencia a la línea de la receta',
  `lote_id` varchar(36) NOT NULL COMMENT 'De qué lote físico se descontó',
  `cantidad` int NOT NULL COMMENT 'Cuántas unidades exactas se tomaron de este lote',
  PRIMARY KEY (`id`),
  KEY `idx_recetas_lotes_lote` (`lote_id`),
  KEY `fk_receta_lote_receta` (`receta_id`),
  CONSTRAINT `fk_receta_lote_lote` FOREIGN KEY (`lote_id`) REFERENCES `inventario_lotes` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_receta_lote_receta` FOREIGN KEY (`receta_id`) REFERENCES `consulta_recetas` (`id`) ON DELETE CASCADE,
  CONSTRAINT `chk_recetas_lotes_cantidad` CHECK ((`cantidad` > 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `consultas`
--

DROP TABLE IF EXISTS `consultas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `consultas` (
  `id` char(36) NOT NULL,
  `cita_id` char(36) NOT NULL,
  `paciente_id` char(36) NOT NULL,
  `podologo_id` char(36) NOT NULL,
  `servicio_id` char(36) DEFAULT NULL,
  `diagnostico` text,
  `procedimiento_detallado` text,
  `indicaciones_cuidado` text,
  `fecha_proxima_consulta` date DEFAULT NULL,
  `requiere_consentimiento` tinyint(1) DEFAULT '0',
  `consentimiento_firmado` tinyint(1) DEFAULT '0',
  `monto_procedimiento` decimal(10,2) DEFAULT NULL,
  `fecha_registro` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `cita_id` (`cita_id`),
  KEY `paciente_id` (`paciente_id`),
  KEY `podologo_id` (`podologo_id`),
  KEY `servicio_id` (`servicio_id`),
  CONSTRAINT `consultas_ibfk_1` FOREIGN KEY (`cita_id`) REFERENCES `citas` (`id`),
  CONSTRAINT `consultas_ibfk_2` FOREIGN KEY (`paciente_id`) REFERENCES `pacientes` (`id`),
  CONSTRAINT `consultas_ibfk_3` FOREIGN KEY (`podologo_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `consultas_ibfk_4` FOREIGN KEY (`servicio_id`) REFERENCES `servicios` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `facturas`
--

DROP TABLE IF EXISTS `facturas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `facturas` (
  `id` varchar(36) NOT NULL DEFAULT (uuid()),
  `clinica_id` varchar(36) NOT NULL,
  `paciente_id` varchar(36) NOT NULL,
  `consulta_id` varchar(36) DEFAULT NULL,
  `numero_factura` varchar(50) NOT NULL,
  `fecha_emision` date NOT NULL DEFAULT (curdate()),
  `descripcion_servicio` text NOT NULL,
  `monto` decimal(10,2) NOT NULL,
  `estado_pago` enum('PENDIENTE','PAGADO') DEFAULT 'PENDIENTE',
  `metodo_pago` enum('EFECTIVO','TARJETA','TRANSFERENCIA') DEFAULT NULL,
  `fecha_pago` date DEFAULT NULL,
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `clinica_id` (`clinica_id`,`numero_factura`),
  KEY `cita_id` (`consulta_id`),
  KEY `idx_facturas_clinica` (`clinica_id`),
  KEY `idx_facturas_paciente` (`paciente_id`),
  KEY `idx_facturas_estado` (`estado_pago`),
  KEY `idx_facturas_fecha` (`fecha_emision`),
  CONSTRAINT `facturas_ibfk_1` FOREIGN KEY (`clinica_id`) REFERENCES `clinicas` (`id`) ON DELETE CASCADE,
  CONSTRAINT `facturas_ibfk_2` FOREIGN KEY (`paciente_id`) REFERENCES `pacientes` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_facturas_consulta` FOREIGN KEY (`consulta_id`) REFERENCES `consultas` (`id`) ON DELETE SET NULL,
  CONSTRAINT `facturas_chk_1` CHECK ((`monto` >= 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `imagenes_paciente`
--

DROP TABLE IF EXISTS `imagenes_paciente`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `imagenes_paciente` (
  `id` varchar(36) NOT NULL DEFAULT (uuid()),
  `clinica_id` varchar(36) NOT NULL,
  `paciente_id` varchar(36) NOT NULL,
  `consulta_id` varchar(36) DEFAULT NULL,
  `url_archivo` text NOT NULL,
  `descripcion` text,
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `clinica_id` (`clinica_id`),
  KEY `idx_imagenes_consulta` (`consulta_id`),
  KEY `idx_imagenes_paciente_paciente` (`paciente_id`),
  CONSTRAINT `fk_imagenes_consulta` FOREIGN KEY (`consulta_id`) REFERENCES `consultas` (`id`) ON DELETE SET NULL,
  CONSTRAINT `imagenes_paciente_ibfk_1` FOREIGN KEY (`clinica_id`) REFERENCES `clinicas` (`id`) ON DELETE CASCADE,
  CONSTRAINT `imagenes_paciente_ibfk_2` FOREIGN KEY (`paciente_id`) REFERENCES `pacientes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `inventario`
--

DROP TABLE IF EXISTS `inventario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inventario` (
  `id` varchar(36) NOT NULL DEFAULT (uuid()),
  `clinica_id` varchar(36) NOT NULL COMMENT 'A qué clínica pertenece este inventario',
  `categoria_id` varchar(36) NOT NULL COMMENT 'Referencia al catálogo de categorías',
  `nombre` varchar(255) NOT NULL,
  `descripcion` text,
  `precio_compra` decimal(10,2) DEFAULT NULL COMMENT 'Costo para la clínica (Cálculo de utilidades)',
  `precio_venta` decimal(10,2) DEFAULT NULL COMMENT 'Precio al público (Si aplica)',
  `requiere_lote` tinyint(1) NOT NULL DEFAULT '0',
  `requiere_caducidad` tinyint(1) NOT NULL DEFAULT '0',
  `ubicacion` varchar(255) DEFAULT NULL COMMENT 'Ej: Estante 3, Almacén Principal',
  `esta_activo` tinyint(1) DEFAULT '1' COMMENT 'Soft delete',
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_actualizacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_inventario_clinica` (`clinica_id`),
  KEY `idx_inventario_categoria` (`categoria_id`),
  CONSTRAINT `fk_inventario_categoria` FOREIGN KEY (`categoria_id`) REFERENCES `categorias_inventario` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_inventario_clinica` FOREIGN KEY (`clinica_id`) REFERENCES `clinicas` (`id`) ON DELETE CASCADE,
  CONSTRAINT `chk_inventario_precio_compra` CHECK ((`precio_compra` >= 0)),
  CONSTRAINT `chk_inventario_precio_venta` CHECK ((`precio_venta` >= 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `inventario_codigos_barras`
--

DROP TABLE IF EXISTS `inventario_codigos_barras`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inventario_codigos_barras` (
  `id` varchar(36) NOT NULL DEFAULT (uuid()),
  `inventario_id` varchar(36) NOT NULL,
  `codigo_barra` varchar(100) NOT NULL,
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_codigo_barra` (`codigo_barra`),
  KEY `fk_codigo_inventario` (`inventario_id`),
  CONSTRAINT `fk_codigo_inventario` FOREIGN KEY (`inventario_id`) REFERENCES `inventario` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `inventario_lotes`
--

DROP TABLE IF EXISTS `inventario_lotes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inventario_lotes` (
  `id` varchar(36) NOT NULL DEFAULT (uuid()),
  `inventario_id` varchar(36) NOT NULL,
  `numero_lote` varchar(50) NOT NULL,
  `fecha_caducidad` date DEFAULT NULL,
  `stock_cantidad` int NOT NULL DEFAULT '0',
  `fecha_ingreso` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_lote_caducidad` (`fecha_caducidad`),
  KEY `fk_lote_inventario` (`inventario_id`),
  CONSTRAINT `fk_lote_inventario` FOREIGN KEY (`inventario_id`) REFERENCES `inventario` (`id`) ON DELETE CASCADE,
  CONSTRAINT `chk_lote_stock` CHECK ((`stock_cantidad` >= 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `pacientes`
--

DROP TABLE IF EXISTS `pacientes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pacientes` (
  `id` varchar(36) NOT NULL DEFAULT (uuid()),
  `clinica_id` varchar(36) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `primer_apellido` varchar(100) NOT NULL,
  `segundo_apellido` varchar(100) DEFAULT NULL,
  `telefono` varchar(20) NOT NULL,
  `correo` varchar(255) DEFAULT NULL,
  `codigo_postal` varchar(5) DEFAULT NULL,
  `estado` varchar(100) DEFAULT NULL,
  `municipio` varchar(100) DEFAULT NULL,
  `ciudad` varchar(100) DEFAULT NULL,
  `colonia` varchar(100) DEFAULT NULL,
  `calle_y_numero` varchar(255) DEFAULT NULL,
  `fecha_nacimiento` date DEFAULT NULL,
  `notas` text,
  `esta_activo` tinyint(1) DEFAULT '1',
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_pacientes_clinica` (`clinica_id`),
  KEY `idx_pacientes_telefono` (`telefono`),
  KEY `idx_pacientes_correo` (`correo`),
  KEY `idx_pacientes_nombre` (`nombre`,`primer_apellido`),
  CONSTRAINT `pacientes_ibfk_1` FOREIGN KEY (`clinica_id`) REFERENCES `clinicas` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `platform_admins`
--

DROP TABLE IF EXISTS `platform_admins`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `platform_admins` (
  `id` varchar(36) NOT NULL DEFAULT (uuid()),
  `correo` varchar(255) NOT NULL,
  `contrasena_hash` varchar(255) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_actualizacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `correo_unico` (`correo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `servicios`
--

DROP TABLE IF EXISTS `servicios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `servicios` (
  `id` varchar(36) NOT NULL DEFAULT (uuid()),
  `clinica_id` varchar(36) NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `descripcion` text,
  `duracion_minutos` int NOT NULL DEFAULT '60',
  `precio` decimal(10,2) NOT NULL,
  `esta_activo` tinyint(1) DEFAULT '1',
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_servicios_clinica` (`clinica_id`),
  KEY `idx_servicios_activos` (`clinica_id`,`esta_activo`),
  CONSTRAINT `servicios_ibfk_1` FOREIGN KEY (`clinica_id`) REFERENCES `clinicas` (`id`) ON DELETE CASCADE,
  CONSTRAINT `servicios_chk_1` CHECK ((`duracion_minutos` > 0)),
  CONSTRAINT `servicios_chk_2` CHECK ((`precio` >= 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `subscription_plans`
--

DROP TABLE IF EXISTS `subscription_plans`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `subscription_plans` (
  `id` varchar(36) NOT NULL DEFAULT (uuid()),
  `nombre` enum('BÁSICO','ESTÁNDAR','PREMIUM') NOT NULL,
  `precio_mensual` decimal(10,2) NOT NULL DEFAULT '0.00',
  `precio_anual` decimal(10,2) NOT NULL DEFAULT '0.00',
  `caracteristicas` json DEFAULT NULL,
  `esta_activo` tinyint(1) DEFAULT '1',
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre_plan_unico` (`nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id` varchar(36) NOT NULL DEFAULT (uuid()),
  `clinica_id` varchar(36) NOT NULL,
  `correo` varchar(255) NOT NULL,
  `contrasena_hash` varchar(255) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `primer_apellido` varchar(100) NOT NULL,
  `segundo_apellido` varchar(100) DEFAULT NULL,
  `rol` enum('ADMINISTRADOR','PODOLOGO','RECEPCIONISTA','CONTADOR') NOT NULL DEFAULT 'RECEPCIONISTA',
  `esta_activo` tinyint(1) DEFAULT '1',
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_usuarios_correo_global` (`correo`),
  KEY `idx_usuarios_clinica` (`clinica_id`),
  KEY `idx_usuarios_correo` (`correo`),
  CONSTRAINT `usuarios_ibfk_1` FOREIGN KEY (`clinica_id`) REFERENCES `clinicas` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Temporary view structure for view `v_citas_hoy`
--

DROP TABLE IF EXISTS `v_citas_hoy`;
/*!50001 DROP VIEW IF EXISTS `v_citas_hoy`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `v_citas_hoy` AS SELECT 
 1 AS `id`,
 1 AS `hora_programada`,
 1 AS `estado`,
 1 AS `nombre_paciente`,
 1 AS `telefono_paciente`,
 1 AS `nombre_podologo`,
 1 AS `nombre_servicio`,
 1 AS `notas`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `v_citas_proximas`
--

DROP TABLE IF EXISTS `v_citas_proximas`;
/*!50001 DROP VIEW IF EXISTS `v_citas_proximas`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `v_citas_proximas` AS SELECT 
 1 AS `id`,
 1 AS `fecha_programada`,
 1 AS `hora_programada`,
 1 AS `estado`,
 1 AS `nombre_paciente`,
 1 AS `nombre_podologo`,
 1 AS `nombre_servicio`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `ventas_inventario`
--

DROP TABLE IF EXISTS `ventas_inventario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ventas_inventario` (
  `id` varchar(36) NOT NULL DEFAULT (uuid()),
  `clinica_id` varchar(36) NOT NULL COMMENT 'Para reportes de ventas por clínica',
  `paciente_id` varchar(36) DEFAULT NULL COMMENT 'A quién se le vendió (Opcional, puede ser venta al mostrador)',
  `factura_id` varchar(36) DEFAULT NULL COMMENT 'Vinculación con el cobro global en la tabla facturas',
  `inventario_item_id` varchar(36) NOT NULL COMMENT 'Qué producto se vendió',
  `cantidad` int NOT NULL,
  `precio_venta` decimal(10,2) NOT NULL COMMENT 'Congela el precio al momento de la venta',
  `fecha_venta` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `esta_cancelada` tinyint(1) DEFAULT '0' COMMENT 'Soft cancel para reversión de ventas',
  PRIMARY KEY (`id`),
  KEY `idx_ventas_clinica` (`clinica_id`),
  KEY `idx_ventas_paciente` (`paciente_id`),
  KEY `idx_ventas_factura` (`factura_id`),
  KEY `idx_ventas_item` (`inventario_item_id`),
  CONSTRAINT `fk_ventas_clinica` FOREIGN KEY (`clinica_id`) REFERENCES `clinicas` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ventas_factura` FOREIGN KEY (`factura_id`) REFERENCES `facturas` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ventas_item` FOREIGN KEY (`inventario_item_id`) REFERENCES `inventario` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_ventas_paciente` FOREIGN KEY (`paciente_id`) REFERENCES `pacientes` (`id`) ON DELETE SET NULL,
  CONSTRAINT `chk_ventas_cantidad` CHECK ((`cantidad` > 0)),
  CONSTRAINT `chk_ventas_precio` CHECK ((`precio_venta` >= 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ventas_inventario_lotes`
--

DROP TABLE IF EXISTS `ventas_inventario_lotes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ventas_inventario_lotes` (
  `id` varchar(36) NOT NULL DEFAULT (uuid()),
  `venta_id` varchar(36) NOT NULL COMMENT 'Referencia a la venta global',
  `lote_id` varchar(36) NOT NULL COMMENT 'De qué lote físico se descontó',
  `cantidad` int NOT NULL COMMENT 'Cuántas unidades se tomaron de este lote',
  PRIMARY KEY (`id`),
  KEY `idx_ventas_lotes_lote` (`lote_id`),
  KEY `fk_venta_lote_venta` (`venta_id`),
  CONSTRAINT `fk_venta_lote_lote` FOREIGN KEY (`lote_id`) REFERENCES `inventario_lotes` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_venta_lote_venta` FOREIGN KEY (`venta_id`) REFERENCES `ventas_inventario` (`id`) ON DELETE CASCADE,
  CONSTRAINT `chk_ventas_lotes_cantidad` CHECK ((`cantidad` > 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Final view structure for view `v_citas_hoy`
--

/*!50001 DROP VIEW IF EXISTS `v_citas_hoy`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `v_citas_hoy` AS select `c`.`id` AS `id`,`c`.`hora_programada` AS `hora_programada`,`c`.`estado` AS `estado`,concat_ws(' ',`p`.`nombre`,`p`.`primer_apellido`,`p`.`segundo_apellido`) AS `nombre_paciente`,`p`.`telefono` AS `telefono_paciente`,concat_ws(' ',`u`.`nombre`,`u`.`primer_apellido`,`u`.`segundo_apellido`) AS `nombre_podologo`,`s`.`nombre` AS `nombre_servicio`,`c`.`notas` AS `notas` from (((`citas` `c` join `pacientes` `p` on((`c`.`paciente_id` = `p`.`id`))) join `usuarios` `u` on((`c`.`podologo_id` = `u`.`id`))) left join `servicios` `s` on((`c`.`servicio_id` = `s`.`id`))) where (`c`.`fecha_programada` = curdate()) order by `c`.`hora_programada` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_citas_proximas`
--

/*!50001 DROP VIEW IF EXISTS `v_citas_proximas`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `v_citas_proximas` AS select `c`.`id` AS `id`,`c`.`fecha_programada` AS `fecha_programada`,`c`.`hora_programada` AS `hora_programada`,`c`.`estado` AS `estado`,concat_ws(' ',`p`.`nombre`,`p`.`primer_apellido`,`p`.`segundo_apellido`) AS `nombre_paciente`,concat_ws(' ',`u`.`nombre`,`u`.`primer_apellido`,`u`.`segundo_apellido`) AS `nombre_podologo`,`s`.`nombre` AS `nombre_servicio` from (((`citas` `c` join `pacientes` `p` on((`c`.`paciente_id` = `p`.`id`))) join `usuarios` `u` on((`c`.`podologo_id` = `u`.`id`))) left join `servicios` `s` on((`c`.`servicio_id` = `s`.`id`))) where ((`c`.`fecha_programada` >= curdate()) and (`c`.`estado` in ('PROGRAMADA','CONFIRMADA'))) order by `c`.`fecha_programada`,`c`.`hora_programada` limit 10 */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-18 15:48:41
