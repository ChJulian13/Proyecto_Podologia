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
  `fecha_acepta_terminos` timestamp NULL DEFAULT NULL COMMENT 'Momento exacto en que el paciente aceptó los términos y firmó',
  `lugar_firma` varchar(150) DEFAULT NULL,
  `url_firma_digital` varchar(255) DEFAULT NULL COMMENT 'Ruta de imagen o PDF con la firma electrónica del paciente',
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
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_anamnesis_clinica_insert` BEFORE INSERT ON `anamnesis_paciente` FOR EACH ROW BEGIN
  DECLARE v_clinica_paciente varchar(36);

  SELECT `clinica_id` INTO v_clinica_paciente
    FROM `pacientes`
   WHERE `id` = NEW.paciente_id
   LIMIT 1;

  IF v_clinica_paciente IS NULL THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'El paciente_id no existe en la tabla pacientes';
  END IF;

  IF v_clinica_paciente != NEW.clinica_id THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'anamnesis_paciente.clinica_id no coincide con la clínica del paciente';
  END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_anamnesis_clinica_update` BEFORE UPDATE ON `anamnesis_paciente` FOR EACH ROW BEGIN
  DECLARE v_clinica_paciente varchar(36);

  SELECT `clinica_id` INTO v_clinica_paciente
    FROM `pacientes`
   WHERE `id` = NEW.paciente_id
   LIMIT 1;

  IF v_clinica_paciente != NEW.clinica_id THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'anamnesis_paciente.clinica_id no coincide con la clínica del paciente';
  END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `categorias_inventario`
--

DROP TABLE IF EXISTS `categorias_inventario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categorias_inventario` (
  `id` varchar(36) NOT NULL DEFAULT (uuid()),
  `clinica_id` varchar(36) DEFAULT NULL COMMENT 'NULL = categoría global de sistema. UUID = exclusiva de esa clínica',
  `nombre` varchar(50) NOT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  `esta_activo` tinyint(1) DEFAULT '1',
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_categoria_por_clinica` (`clinica_id`,`nombre`),
  KEY `idx_cat_inv_clinica` (`clinica_id`),
  CONSTRAINT `fk_cat_inv_clinica` FOREIGN KEY (`clinica_id`) REFERENCES `clinicas` (`id`) ON DELETE CASCADE
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
  `estado` enum('PROGRAMADA','CONFIRMADA','EN_CURSO','COMPLETADA','CANCELADA','NO_ASISTIO') DEFAULT 'PROGRAMADA',
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
  `fecha_actualizacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Última modificación de datos de la clínica',
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
  `estado_firma` enum('PENDIENTE','FIRMADO','RECHAZADO','VENCIDO') DEFAULT 'PENDIENTE' COMMENT 'Estado actual del consentimiento informado',
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
  `id` char(36) NOT NULL DEFAULT (uuid()),
  `clinica_id` varchar(36) NOT NULL COMMENT 'Denormalizado desde consultas para filtrado multitenant eficiente',
  `consulta_id` char(36) NOT NULL,
  `producto_id` char(36) NOT NULL,
  `cantidad` int DEFAULT '1',
  `precio_unitario_venta` decimal(10,2) DEFAULT NULL,
  `indicaciones_uso` text,
  PRIMARY KEY (`id`),
  KEY `consulta_id` (`consulta_id`),
  KEY `producto_id` (`producto_id`),
  KEY `idx_recetas_clinica` (`clinica_id`),
  CONSTRAINT `consulta_recetas_ibfk_1` FOREIGN KEY (`consulta_id`) REFERENCES `consultas` (`id`),
  CONSTRAINT `consulta_recetas_ibfk_2` FOREIGN KEY (`producto_id`) REFERENCES `inventario` (`id`),
  CONSTRAINT `fk_recetas_clinica` FOREIGN KEY (`clinica_id`) REFERENCES `clinicas` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_receta_clinica_insert` BEFORE INSERT ON `consulta_recetas` FOR EACH ROW BEGIN
  DECLARE v_clinica varchar(36);
  SELECT `clinica_id` INTO v_clinica
    FROM `consultas`
   WHERE `id` = NEW.consulta_id
   LIMIT 1;
  SET NEW.clinica_id = v_clinica;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

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
  `id` char(36) NOT NULL DEFAULT (uuid()),
  `clinica_id` varchar(36) NOT NULL COMMENT 'Clínica a la que pertenece esta consulta (multitenant)',
  `cita_id` char(36) NOT NULL,
  `paciente_id` char(36) NOT NULL,
  `podologo_id` char(36) NOT NULL,
  `servicio_id` char(36) DEFAULT NULL,
  `diagnostico` text,
  `procedimiento_detallado` text,
  `indicaciones_cuidado` text,
  `fecha_proxima_consulta` date DEFAULT NULL,
  `monto_procedimiento` decimal(10,2) DEFAULT NULL,
  `fecha_registro` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_actualizacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Última modificación del registro de consulta',
  `modificado_por_id` varchar(36) DEFAULT NULL COMMENT 'Usuario que realizó la última edición',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_consultas_cita` (`cita_id`),
  KEY `cita_id` (`cita_id`),
  KEY `paciente_id` (`paciente_id`),
  KEY `podologo_id` (`podologo_id`),
  KEY `servicio_id` (`servicio_id`),
  KEY `idx_consultas_clinica` (`clinica_id`),
  KEY `idx_consultas_modificado_por` (`modificado_por_id`),
  CONSTRAINT `consultas_ibfk_1` FOREIGN KEY (`cita_id`) REFERENCES `citas` (`id`),
  CONSTRAINT `consultas_ibfk_2` FOREIGN KEY (`paciente_id`) REFERENCES `pacientes` (`id`),
  CONSTRAINT `consultas_ibfk_3` FOREIGN KEY (`podologo_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `consultas_ibfk_4` FOREIGN KEY (`servicio_id`) REFERENCES `servicios` (`id`),
  CONSTRAINT `fk_consultas_clinica` FOREIGN KEY (`clinica_id`) REFERENCES `clinicas` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_consultas_modificado_por` FOREIGN KEY (`modificado_por_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL
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
  `metodo_pago` enum('EFECTIVO','TARJETA','TRANSFERENCIA','CHEQUE','CREDITO_CLINICA') DEFAULT NULL COMMENT 'Medio de pago utilizado',
  `fecha_pago` date DEFAULT NULL,
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `es_nota_credito` tinyint(1) NOT NULL DEFAULT '0' COMMENT '1 = esta factura es una nota de crédito (devolución/ajuste)',
  `factura_original_id` varchar(36) DEFAULT NULL COMMENT 'Factura a la que aplica esta nota de crédito',
  `creado_por_id` varchar(36) DEFAULT NULL COMMENT 'Usuario (recepcionista/admin) que generó la factura',
  PRIMARY KEY (`id`),
  UNIQUE KEY `clinica_id` (`clinica_id`,`numero_factura`),
  KEY `cita_id` (`consulta_id`),
  KEY `idx_facturas_clinica` (`clinica_id`),
  KEY `idx_facturas_paciente` (`paciente_id`),
  KEY `idx_facturas_estado` (`estado_pago`),
  KEY `idx_facturas_fecha` (`fecha_emision`),
  KEY `idx_facturas_creado_por` (`creado_por_id`),
  KEY `idx_facturas_original` (`factura_original_id`),
  CONSTRAINT `facturas_ibfk_1` FOREIGN KEY (`clinica_id`) REFERENCES `clinicas` (`id`) ON DELETE CASCADE,
  CONSTRAINT `facturas_ibfk_2` FOREIGN KEY (`paciente_id`) REFERENCES `pacientes` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_facturas_consulta` FOREIGN KEY (`consulta_id`) REFERENCES `consultas` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_facturas_creado_por` FOREIGN KEY (`creado_por_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_facturas_original` FOREIGN KEY (`factura_original_id`) REFERENCES `facturas` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `chk_nota_credito_referencia` CHECK (((`es_nota_credito` = 0) or ((`es_nota_credito` = 1) and (`factura_original_id` is not null)))),
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
  `clinica_id` varchar(36) NOT NULL COMMENT 'Derivado de inventario.clinica_id para constraint de unicidad',
  `inventario_id` varchar(36) NOT NULL,
  `codigo_barra` varchar(100) NOT NULL,
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_codigo_por_clinica` (`clinica_id`,`codigo_barra`),
  KEY `fk_codigo_inventario` (`inventario_id`),
  CONSTRAINT `fk_codigo_inventario` FOREIGN KEY (`inventario_id`) REFERENCES `inventario` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_codigos_clinica` FOREIGN KEY (`clinica_id`) REFERENCES `clinicas` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_codigo_clinica_insert` BEFORE INSERT ON `inventario_codigos_barras` FOR EACH ROW BEGIN
  DECLARE v_clinica varchar(36);
  SELECT `clinica_id` INTO v_clinica
    FROM `inventario`
   WHERE `id` = NEW.inventario_id
   LIMIT 1;
  SET NEW.clinica_id = v_clinica;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

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
  UNIQUE KEY `uq_lote_por_producto` (`inventario_id`,`numero_lote`),
  KEY `idx_lote_caducidad` (`fecha_caducidad`),
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
  `fecha_actualizacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Última modificación del expediente demográfico',
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
  `nombre` varchar(50) NOT NULL,
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
  `correo` varchar(255) NOT NULL,
  `contrasena_hash` varchar(255) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `primer_apellido` varchar(100) NOT NULL,
  `segundo_apellido` varchar(100) DEFAULT NULL,
  `esta_activo` tinyint(1) DEFAULT '1',
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_actualizacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Última modificación del perfil global del usuario',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_usuarios_correo_global` (`correo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `usuarios_clinicas`
--

DROP TABLE IF EXISTS `usuarios_clinicas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios_clinicas` (
  `id` varchar(36) NOT NULL DEFAULT (uuid()),
  `usuario_id` varchar(36) NOT NULL COMMENT 'Referencia a la identidad global',
  `clinica_id` varchar(36) NOT NULL COMMENT 'Clínica en la que opera este rol',
  `rol` enum('ADMINISTRADOR','PODOLOGO','RECEPCIONISTA','CONTADOR') NOT NULL DEFAULT 'RECEPCIONISTA',
  `esta_activo` tinyint(1) NOT NULL DEFAULT '1' COMMENT '0 = acceso revocado en esta clínica (sin afectar otras)',
  `fecha_asignacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Cuándo se le dio acceso a esta clínica',
  `fecha_actualizacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_usuario_por_clinica` (`usuario_id`,`clinica_id`),
  KEY `idx_uc_usuario` (`usuario_id`),
  KEY `idx_uc_clinica` (`clinica_id`),
  KEY `idx_uc_rol` (`rol`),
  KEY `idx_uc_activo` (`clinica_id`,`esta_activo`),
  CONSTRAINT `fk_uc_clinica` FOREIGN KEY (`clinica_id`) REFERENCES `clinicas` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_uc_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Asignación de usuarios a clínicas con su rol en cada una';
/*!40101 SET character_set_client = @saved_cs_client */;

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
  `vendido_por_id` varchar(36) DEFAULT NULL COMMENT 'Usuario que ejecutó la venta',
  `esta_cancelada` tinyint(1) DEFAULT '0' COMMENT 'Soft cancel para reversión de ventas',
  PRIMARY KEY (`id`),
  KEY `idx_ventas_clinica` (`clinica_id`),
  KEY `idx_ventas_paciente` (`paciente_id`),
  KEY `idx_ventas_factura` (`factura_id`),
  KEY `idx_ventas_item` (`inventario_item_id`),
  KEY `idx_ventas_vendido_por` (`vendido_por_id`),
  CONSTRAINT `fk_ventas_clinica` FOREIGN KEY (`clinica_id`) REFERENCES `clinicas` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ventas_factura` FOREIGN KEY (`factura_id`) REFERENCES `facturas` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_ventas_item` FOREIGN KEY (`inventario_item_id`) REFERENCES `inventario` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_ventas_paciente` FOREIGN KEY (`paciente_id`) REFERENCES `pacientes` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_ventas_vendido_por` FOREIGN KEY (`vendido_por_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL,
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
-- Dumping events for database 'podologia'
--

--
-- Dumping routines for database 'podologia'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-20 15:27:07
